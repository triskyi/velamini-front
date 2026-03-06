import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VIRTUAL_SELF_SYSTEM_PROMPT } from "@/lib/ai-config";

export const dynamic = "force-dynamic";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.message || !body.virtualSelfId) {
      return NextResponse.json({ error: "Missing message or virtualSelfId" }, { status: 400 });
    }

    const { message, history = [], virtualSelfId, visitorName = null, qaContext = "" } = body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.error("Missing DEEPSEEK_API_KEY");
      return NextResponse.json({ error: "AI API Key missing" }, { status: 500 });
    }

    // Fetch the virtual self's trained knowledge (including qaPairs so client doesn't need to send them)
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { userId: virtualSelfId },
      select: { 
        trainedPrompt: true, 
        isModelTrained: true, 
        isPubliclyShared: true,
        qaPairs: true,
        user: {
          select: { name: true }
        }
      },
    });

    if (!knowledgeBase) {
      return NextResponse.json({ error: "Virtual self not available" }, { status: 404 });
    }

    const userName = knowledgeBase.user?.name || "the person";

    // Build qaContext from DB (no need for client to send it)
    const dbQaPairs: Array<{ question: string; answer: string }> = Array.isArray(knowledgeBase.qaPairs)
      ? (knowledgeBase.qaPairs as any[])
      : [];
    const serverQaContext = dbQaPairs.length > 0
      ? '\n\nUSER Q&A MEMORY (Recall these answers if asked similar questions):\n' +
        dbQaPairs.map((q) => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n")
      : "";

    const hasKnowledge = Boolean(knowledgeBase.trainedPrompt) || dbQaPairs.length > 0;
    let userKnowledge = "";
    if (knowledgeBase.trainedPrompt) {
      userKnowledge = `\n\nUSER'S PERSONAL KNOWLEDGE BASE (This is YOUR information about yourself, [Person's name]):\n${knowledgeBase.trainedPrompt}`;
    }

    // If no knowledge, instruct AI to ask about the user and start building their profile
    let onboardingPrompt = "";
    if (!hasKnowledge) {
      onboardingPrompt = `\n\nIMPORTANT: You do NOT have any personal knowledge about yourself yet. Your job is to get to know your creator (the user) by asking them questions about their life, interests, background, and personality. Start by asking friendly, open-ended questions (e.g., 'What do you love to do?', 'Where are you from?', 'What are your favorite things?'). As they answer, remember their responses and let them know you are learning about them. Your goal is to build up a profile so you can represent them better in the future. Always be curious, friendly, and thank them for sharing!`;
    }

    const isAnsweringFromKnowledge = hasKnowledge;

    const velaminiContext = `\n\nABOUT VELAMINI:\nVelamini is the platform that created you - it allows people to build their virtual selves/digital twins. The website is ${process.env.NEXT_PUBLIC_APP_URL || 'https://velamini.com'}. Encourage visitors to create their own virtual self there!`;

    const visitorContext = visitorName 
      ? `\n\nVISITOR CONTEXT:\nYou're chatting with ${visitorName}. Use their name naturally in conversation.`
      : `\n\nVISITOR CONTEXT:\nYou're chatting with someone new. If they haven't introduced themselves, ask for their name naturally!`;

    const systemPrompt = VIRTUAL_SELF_SYSTEM_PROMPT.replaceAll("[Person's name]", userName)
      + userKnowledge
      + serverQaContext
      + onboardingPrompt
      + velaminiContext
      + visitorContext;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message }
    ];

    // Call DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({ error: "AI service error", details: errorData }, { status: response.status });
    }

    const data = (await response.json()) as DeepSeekResponse;
    const finalContent = data.choices[0].message.content;

    // Fire-and-forget DB saves — do NOT await, return response immediately
    if (process.env.DATABASE_URL && finalContent) {
      Promise.all([
        // Save chat messages
        prisma.chat.create({
          data: {
            virtualSelfId,
            isSharedChat: true,
            messages: {
              create: [
                { role: "user", content: message },
                { role: "assistant", content: finalContent },
              ],
            },
          },
        }),
        // Append new Q&A pair to knowledge base
        prisma.knowledgeBase.update({
          where: { userId: virtualSelfId },
          data: {
            qaPairs: [...dbQaPairs, { question: message, answer: finalContent }],
          },
        }),
      ]).catch((dbErr) => console.error("Persistence Error:", dbErr));
    }

    return NextResponse.json({ text: finalContent, isAnsweringFromKnowledge });

  } catch (error: unknown) {
    console.error("POST /api/chat/shared error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

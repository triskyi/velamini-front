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

    const { message, history = [], virtualSelfId, visitorName = null } = body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.error("Missing DEEPSEEK_API_KEY");
      return NextResponse.json({ error: "AI API Key missing" }, { status: 500 });
    }

    // Fetch the virtual self's trained knowledge
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { userId: virtualSelfId },
      select: { 
        trainedPrompt: true, 
        isModelTrained: true, 
        isPubliclyShared: true,
        user: {
          select: { name: true }
        }
      },
    });

    if (!knowledgeBase?.isModelTrained || !knowledgeBase.isPubliclyShared) {
      return NextResponse.json({ error: "Virtual self not available" }, { status: 404 });
    }

    const userName = knowledgeBase.user?.name || "the person";
    const userKnowledge = knowledgeBase.trainedPrompt
      ? `\n\nUSER'S PERSONAL KNOWLEDGE BASE (This is YOUR information about yourself, [Person's name]):\n${knowledgeBase.trainedPrompt}`
      : "";

    // Add Velamini context
    const velaminiContext = `\n\nABOUT VELAMINI:\nVelamini is the platform that created you - it allows people to build their virtual selves/digital twins. The website is ${process.env.NEXT_PUBLIC_APP_URL || 'https://velamini.com'}. Encourage visitors to create their own virtual self there!`;

    // Add visitor context if name is known
    const visitorContext = visitorName 
      ? `\n\nVISITOR CONTEXT:\nYou're chatting with ${visitorName}. Use their name naturally in conversation.`
      : `\n\nVISITOR CONTEXT:\nYou're chatting with someone new. If they haven't introduced themselves, ask for their name naturally!`;

    const systemPrompt = VIRTUAL_SELF_SYSTEM_PROMPT.replaceAll("[Person's name]", userName) 
      + userKnowledge 
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

    // Save to database with virtualSelfId
    if (process.env.DATABASE_URL) {
      try {
        const chat = await prisma.chat.create({
          data: {
            virtualSelfId,
            isSharedChat: true,
            messages: {
              create: [
                { role: "user", content: message },
                { role: "assistant", content: finalContent || "" },
              ],
            },
          },
        });
        console.log("Saved shared chat:", chat.id);
      } catch (dbErr) {
        console.error("Persistence Error:", dbErr);
      }
    }

    return NextResponse.json({ text: finalContent });

  } catch (error: unknown) {
    console.error("POST /api/chat/shared error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

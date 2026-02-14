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

    const { message, history = [], virtualSelfId } = body;
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
      ? `\n\nUSER'S PERSONAL KNOWLEDGE BASE:\n${knowledgeBase.trainedPrompt}`
      : "";

    const systemPrompt = VIRTUAL_SELF_SYSTEM_PROMPT.replaceAll("[Person's name]", userName) + userKnowledge;

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

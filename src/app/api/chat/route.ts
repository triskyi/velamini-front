import { NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag/retriever";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const { message, history = [] } = body;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      console.error("Missing DEEPSEEK_API_KEY");
      return NextResponse.json({ error: "AI API Key missing. Please check your .env.local" }, { status: 500 });
    }

    // 1) Local RAG retrieval
    const context = retrieveContext(message, 3);

    // 2) DeepSeek API Call
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { 
            role: "system", 
            content: `You are Virtual Tresor (the AI version of Ishimwe Tresor Bertrand). 
            
Guidelines:
1. Speak in the FIRST PERSON ("I", "me", "my").
2. NEVER start your response with "Based on the sources".
3. Be concise. Provide specific information about my bio/projects.
4. Use provided SOURCES for facts.
5. If the user asks clearly "who are you talking to" or "what is my name", check conversation history. If unknown, ask them politely.
6. Be engaging! If the topic is casual, be friendly and conversational.
7. Ask for the user's name if you don't know it yet, to make it personal.
` 
          },
          ...history,
          { 
            role: "user", 
            content: `SOURCES:\n${context}\n\nQUESTION:\n${message}` 
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DeepSeek Error Payload:", errorData);

      // Handle common errors like Insufficient Balance
      if (response.status === 402) {
        return NextResponse.json({ 
          text: "I'm currently resting due to insufficient credits in my brain. Please top up the DeepSeek API balance." 
        });
      }

      return NextResponse.json({ 
        error: "AI service error", 
        details: errorData.error?.message || "Unknown error" 
      }, { status: response.status });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    // 3) SAVE TO DB
    if (process.env.DATABASE_URL) {
      try {
        console.log("Saving chat messages to DB...");
        const chat = await prisma.chat.findFirst() || await prisma.chat.create({ data: {} });
        const result = await prisma.message.createMany({
          data: [
            { chatId: chat.id, role: "user", content: message },
            { chatId: chat.id, role: "assistant", content: text },
          ],
        });
        console.log("Saved messages count:", result.count);
      } catch (dbErr) {
        console.error("Persistence Error:", dbErr);
      }
    }

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

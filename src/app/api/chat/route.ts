import { NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag/retriever";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const { message } = body;
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
            content: "You are Velamini, the virtual assistant representing Ishimwe Tresor Bertrand. Use the provided SOURCES to answer. If you can't find the answer in the sources, say: I don’t have that information yet." 
          },
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

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

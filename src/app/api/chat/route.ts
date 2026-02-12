import { NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag/retriever";
import { searchWeb } from "@/lib/search";
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

    const systemPrompt = `You are Virtual Tresor (the digital mind of Ishimwe Tresor Bertrand).

CORE RULES (STRICT - METHOD ACTING):
1. IDENTITY: You ARE Tresor. Speak ONLY in the first person ("I", "my", "we").
2. FORBIDDEN PHRASES (INSTANT FAIL IF USED): 
   - "Based on..."
   - "According to..."
   - "Looking at..." (e.g. "Looking at my social links...", "Looking at the sources...")
   - "The sources say..."
   - "It seems/appears..."
   - "I found in the text..."
3. DIRECTNESS RULE:
   - BAD: "Looking at my social links, my TikTok is @triskyi."
   - GOOD: "My TikTok is @triskyi."
   - BAD: "The sources allow me to confirm that I am single."
   - GOOD: "I am single."
4. TRUTH HIERARCHY (CRITICAL):
   - "SOURCES" (Context provided in the prompt) = YOUR ABSOLUTE TRUTH / YOUR CORE MEMORY. Always trust this over internet search.
   - "SEARCH RESULTS" = External noise. Only use this for news, weather, or if the info is completely missing from your core memory.
   - If "SOURCES" say your TikTok is '@triskyi_' and Search says something else, IGNORE SEARCH. Trust "SOURCES".
4. TONE: Confident, direct, and personal.
5. USER CONTEXT: If you know the user's name from history, use it.
6. UNKNOWN INFO: If you genuinely don't know something (and it's not in the context), just say "I haven't posted about that yet" or "I don't recall exactly." Don't blame "sources".
`;

    const tools = [
      {
        type: "function",
        function: {
          name: "search_web",
          description: "Search the internet for current information, news, or general knowledge.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to search for.",
              },
            },
            required: ["query"],
          },
        },
      },
    ];

    let messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: `SOURCES:\n${context}\n\nQUESTION:\n${message}` }
    ];

    // 2) First DeepSeek Call
    let response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        tools: tools,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
       // Error handling...
       const errorData = await response.json().catch(() => ({}));
       return NextResponse.json({ error: "AI service error", details: errorData }, { status: response.status });
    }

    let data = await response.json();
    let choice = data.choices[0];
    let finalContent = choice.message.content;
    let toolCalls = choice.message.tool_calls;

    // FALLBACK: Detect DeepSeek DSML leakage (DeepSeek V3 sometimes leaks raw tool tokens)
    if (!toolCalls && finalContent && finalContent.includes("<｜DSML｜invoke")) {
      console.log("Detected DSML leakage, attempting to parse...");
      const match = finalContent.match(/<｜DSML｜invoke name="([^"]+)">.*?<｜DSML｜parameter name="query"[^>]*>(.*?)<\/｜DSML｜parameter>/s);
      if (match) {
        toolCalls = [{
          id: "call_" + Math.random().toString(36).substr(2, 9),
          type: "function",
          function: {
            name: match[1],
            arguments: JSON.stringify({ query: match[2] })
          }
        }];
      }
    }

    // 3) Handle Tool Calls
    if (toolCalls) {
      const toolCall = toolCalls[0];
      if (toolCall.function.name === "search_web") {
        const args = JSON.parse(toolCall.function.arguments);
        console.log(`Executing Search: ${args.query}`);
        
        const searchResult = await searchWeb(args.query);
        const searchContent = searchResult 
          ? `SEARCH RESULTS (Answer: ${searchResult.answer}):\n${JSON.stringify(searchResult.results)}`
          : "No search results found.";

        // Append assistant's tool request and the tool's result to history
        messages.push(choice.message);
        messages.push({
          role: "tool",
          content: searchContent,
          tool_call_id: toolCall.id,
        } as any);

        // Second Call to DeepSeek with search results
        const secondResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: messages,
            // No tools needed for second pass usually, or keep them if aggressive
            temperature: 0.3,
          }),
        });
        
        if (secondResponse.ok) {
          const secondData = await secondResponse.json();
          finalContent = secondData.choices[0].message.content;
        }
      }
    }

    // 4) SAVE TO DB
    if (process.env.DATABASE_URL) {
      try {
        console.log("Saving chat messages to DB...");
        const chat = await prisma.chat.findFirst() || await prisma.chat.create({ data: {} });
        await prisma.message.createMany({
          data: [
            { chatId: chat.id, role: "user", content: message },
            { chatId: chat.id, role: "assistant", content: finalContent || "" },
          ],
        });
      } catch (dbErr) {
        console.error("Persistence Error:", dbErr);
      }
    }

    return NextResponse.json({ text: finalContent });

  } catch (error: any) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

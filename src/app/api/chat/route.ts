import { NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag/retriever";
import { searchWeb } from "@/lib/search";
import { prisma } from "@/lib/prisma";
import { VIRTUAL_TRESOR_SYSTEM_PROMPT } from "@/lib/ai-config";

export const dynamic = "force-dynamic";

type ToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

type DeepSeekResponse = {
  choices: Array<{
    message: {
      content: string;
      tool_calls?: ToolCall[];
    };
  }>;
};

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
    
    // Proactive Searching: If it's a "What/How/More" question, trigger search immediately to fill context
    let searchContent = "";
    if (message.toLowerCase().match(/what|how|more|tech|bring|status|latest/)) {
        const searchResult = await searchWeb(message);
        searchContent = searchResult 
            ? `SEARCH RESULTS (Answer: ${searchResult.answer}):\n${JSON.stringify(searchResult.results)}`
            : "No search results found.";
    }

    const systemPrompt = VIRTUAL_TRESOR_SYSTEM_PROMPT;

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

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: `CORE MEMORY:\n${context || "Not found in direct memory."}\n\nEXTERNAL SEARCH:\n${searchContent}\n\nQUESTION:\n${message}` }
    ];

    // 2) First DeepSeek Call
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
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

    const data = (await response.json()) as DeepSeekResponse;
    const choice = data.choices[0];
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
        const args = JSON.parse(toolCall.function.arguments) as { query: string };
        console.log(`Executing Search: ${args.query}`);
        
        const searchResult = await searchWeb(args.query);
        const searchContent = searchResult 
          ? `SEARCH RESULTS (Answer: ${searchResult.answer}):\n${JSON.stringify(searchResult.results)}`
          : "No search results found.";

        // Append assistant's tool request and the tool's result to history
        messages.push({
          role: "assistant",
          content: choice.message.content,
          tool_calls: choice.message.tool_calls,
        });
        messages.push({
          role: "tool",
          content: searchContent,
          tool_call_id: toolCall.id,
        });

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

  } catch (error: unknown) {
    console.error("POST /api/chat error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

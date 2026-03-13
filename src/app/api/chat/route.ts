import { NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag/retriever";
import { searchWeb } from "@/lib/search";
import { prisma } from "@/lib/prisma";
import { VIRTUAL_SELF_SYSTEM_PROMPT } from "@/lib/ai-config";
import { auth } from "@/auth";
import { log, warn, error as logError } from "@/lib/logger";
import { getServerAppUrl } from "@/lib/app-url";
import { z } from "zod";

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
  usage?: {
    total_tokens?: number;
  };
  choices: Array<{
    message: {
      content: string;
      tool_calls?: ToolCall[];
    };
  }>;
};

const chatHistoryItemSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string().max(12000),
});

const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(chatHistoryItemSchema).max(100).default([]),
  useLocalKnowledge: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const raw = await req.json().catch(() => null);
    const parsed = chatRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, history = [], useLocalKnowledge = false } = parsed.data;
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      logError("/api/chat", "Missing DEEPSEEK_API_KEY");
      return NextResponse.json({ error: "AI API Key missing. Please check your .env.local" }, { status: 500 });
    }

    // Get user's trained knowledge if authenticated + check quota
    let userKnowledge = "";
    let userName = "the person";
    let useLocal = useLocalKnowledge;
    let authenticatedUserId: string | undefined;
    try {
      const session = await auth();
      if (session?.user?.email) {
        userName =
          session.user.name?.trim() ||
          session.user.email.split("@")[0] ||
          userName;
        let userId: string | undefined = session.user.id;
        const GRACE_MS = 3 * 24 * 60 * 60 * 1000;
        if (!userId && session.user.email) {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, personalMonthlyMsgCount: true, personalMonthlyMsgLimit: true, creditsExhaustedAt: true },
          });
          userId = user?.id;
          userName = user?.name || userName;
          if (user && user.personalMonthlyMsgCount >= user.personalMonthlyMsgLimit) {
            const now = Date.now();
            if (!user.creditsExhaustedAt) {
              await prisma.user.update({ where: { id: user.id }, data: { creditsExhaustedAt: new Date(now) } });
              await prisma.notification.create({ data: { userId: user.id, type: "warning", scope: "personal", title: "Credits exhausted", body: "You've used all your monthly credits. You have a 3-day grace period — top up your plan before it expires to avoid losing access." } }).catch(() => {});
            } else if (now > user.creditsExhaustedAt.getTime() + GRACE_MS) {
              return NextResponse.json({ error: "Your monthly credits have run out. Please top up your plan to continue chatting." }, { status: 429 });
            }
          } else if (user?.creditsExhaustedAt) {
            await prisma.user.update({ where: { id: user.id }, data: { creditsExhaustedAt: null } }).catch(() => {});
          }
        } else if (session.user.name) {
          userName = session.user.name;
          if (userId) {
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { personalMonthlyMsgCount: true, personalMonthlyMsgLimit: true, creditsExhaustedAt: true },
            });
            if (user && user.personalMonthlyMsgCount >= user.personalMonthlyMsgLimit) {
              const now = Date.now();
              if (!user.creditsExhaustedAt) {
                await prisma.user.update({ where: { id: userId }, data: { creditsExhaustedAt: new Date(now) } });
                await prisma.notification.create({ data: { userId, type: "warning", scope: "personal", title: "Credits exhausted", body: "You've used all your monthly credits. You have a 3-day grace period — top up your plan before it expires to avoid losing access." } }).catch(() => {});
              } else if (now > user.creditsExhaustedAt.getTime() + GRACE_MS) {
                return NextResponse.json({ error: "Your monthly credits have run out. Please top up your plan to continue chatting." }, { status: 429 });
              }
            } else if (user?.creditsExhaustedAt) {
              await prisma.user.update({ where: { id: userId }, data: { creditsExhaustedAt: null } }).catch(() => {});
            }
          }
        }
        authenticatedUserId = userId;
        if (userId && !useLocal) {
          const knowledgeBase = await prisma.knowledgeBase.findUnique({
            where: { userId },
            select: { trainedPrompt: true, isModelTrained: true },
          });
          if (knowledgeBase?.isModelTrained && knowledgeBase.trainedPrompt) {
            userKnowledge = `\n\nUSER'S PERSONAL KNOWLEDGE BASE (This is YOUR information about yourself, [Person's name]):\n${knowledgeBase.trainedPrompt}`;
          }
        } else {
          useLocal = true;
        }
      } else {
        useLocal = true;
      }
    } catch (authError) {
      useLocal = true;
      warn("/api/chat", "Could not fetch user knowledge", {
        err: authError instanceof Error ? authError.message : String(authError),
      });
    }

    // Add Velamini context
    const velaminiContext = `\n\nABOUT VELAMINI:\nVelamini is the platform that created you - it allows people to build their virtual selves/digital twins. The website is ${getServerAppUrl()}. When visitors ask about you or how they can create their own digital assistant, explain Velamini and encourage them to sign up!`;

    // 1) Local RAG retrieval
    let context = "";
    if (useLocal) {
      context = ""; // No local KB, leave empty or set a default string
    } else {
      context = retrieveContext(message, 3);
    }

    // Proactive Searching: If it's a "What/How/More" question, trigger search immediately to fill context
    let searchContent = "";
    if (message.toLowerCase().match(/what|how|more|tech|bring|status|latest/)) {
        const searchResult = await searchWeb(message);
        searchContent = searchResult 
            ? `SEARCH RESULTS (Answer: ${searchResult.answer}):\n${JSON.stringify(searchResult.results)}`
            : "No search results found.";
    }

    // Use only the server-side system prompt — never accept one from the client
    const systemPrompt = VIRTUAL_SELF_SYSTEM_PROMPT.replaceAll("[Person's name]", userName) + userKnowledge + velaminiContext;

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
       logError("/api/chat", "AI service error", { status: response.status, errorData });
       return NextResponse.json({ error: "AI service is temporarily unavailable." }, { status: 502 });
    }

    const data = (await response.json()) as DeepSeekResponse;
    let totalTokensUsed = data.usage?.total_tokens ?? 0;
    const choice = data.choices[0];
    let finalContent = choice.message.content;
    let toolCalls = choice.message.tool_calls;

    // FALLBACK: Detect DeepSeek DSML leakage (DeepSeek V3 sometimes leaks raw tool tokens)
    if (!toolCalls && finalContent && finalContent.includes("<｜DSML｜invoke")) {
      warn("/api/chat", "Detected DSML leakage, attempting parse");
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
        log("/api/chat", "Executing search tool", { queryLength: args.query.length });
        
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
          totalTokensUsed += (secondData as DeepSeekResponse).usage?.total_tokens ?? 0;
        }
      }
    }

    // 4) SAVE TO DB
    if (process.env.DATABASE_URL) {
      try {
        log("/api/chat", "Persisting chat messages");
        const chat = await prisma.chat.findFirst({ where: { userId: authenticatedUserId ?? "anon" } })
          || await prisma.chat.create({ data: { userId: authenticatedUserId ?? "anon" } });
        await prisma.message.createMany({
          data: [
            { chatId: chat.id, role: "user", content: message },
            { chatId: chat.id, role: "assistant", content: finalContent || "" },
          ],
        });
        // Increment personal usage counters
        if (authenticatedUserId) {
          await prisma.user.update({
            where: { id: authenticatedUserId },
            data: {
              personalMonthlyMsgCount: { increment: 1 },
              personalMonthlyTokenCount: { increment: totalTokensUsed },
            },
          }).catch(() => {});
        }
      } catch (dbErr) {
        logError("/api/chat", "Persistence error", {
          err: dbErr instanceof Error ? dbErr.message : String(dbErr),
        });
      }
    }

    return NextResponse.json({ text: finalContent });

  } catch (error: unknown) {
    logError("/api/chat", "POST error", { err: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

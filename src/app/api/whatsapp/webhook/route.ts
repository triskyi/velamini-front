import { NextResponse } from "next/server";
import { retrieveContext } from "@/lib/rag/retriever";
import { searchWeb } from "@/lib/search";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { VIRTUAL_TRESOR_SYSTEM_PROMPT } from "@/lib/ai-config";
import { prisma } from "@/lib/prisma";

// Force Node.js runtime for FormData compatibility if needed, 
// though standard Web API Request/Response works in Edge too.
export const runtime = "nodejs"; 

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
    // Twilio sends data as application/x-www-form-urlencoded
    const formData = await req.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;
    const numMedia = formData.get("NumMedia") ? parseInt(formData.get("NumMedia") as string) : 0;

    if (!from) {
      console.warn("Invalid Twilio Request: Missing From");
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    // Handle Voice Notes / Media (which have no Body text)
    if (!body && numMedia > 0) {
        console.log(`Twilio Message from ${from}: [MEDIA RECEIVED]`);
        await sendWhatsAppMessage(from, "I can't listen to voice notes or see images yet! Please type it for me? ❤️");
        return new NextResponse("<Response></Response>", { status: 200, headers: { "Content-Type": "text/xml" } });
    }

    if (!body) {
         console.warn("Invalid Twilio Request: Missing Body and no Media");
         return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    console.log(`Twilio Message from ${from}: ${body}`);

    // Process logic (awaiting ensures it finishes before response)
    await handleIncomingMessage(from, body);

    // Return empty TwiML to suppress Twilio errors
    return new NextResponse("<Response></Response>", {
        status: 200,
        headers: { "Content-Type": "text/xml" },
    });

  } catch (error) {
    console.error("Twilio Webhook Error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}

async function handleIncomingMessage(from: string, userMessage: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
      console.error("Missing DEEPSEEK_API_KEY");
      return;
  }

  // 0) Database Persistence: Get/Create Chat & History
  // We explicitly check for chats where `userId` matches the phone number
  let chat = await prisma.chat.findFirst({
      where: { userId: from },
      orderBy: { createdAt: 'desc' }
  });

  if (!chat) {
      chat = await prisma.chat.create({
          data: { userId: from }
      });
  }

  const historyMessages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'desc' },
      take: 10
  });

  // Save User Message
  await prisma.message.create({
      data: {
          chatId: chat.id,
          role: 'user',
          content: userMessage
      }
  });

    const context = retrieveContext(userMessage, 3);
    
    // 2) AI Prompt Construction
    // Note: We do NOT force a web search here. We let the AI decide via tools if it needs one, 
    // or rely on the "CORE MEMORY" context (Rag) + System Prompt rules.
  
  const messages: ChatMessage[] = [
    { role: "system", content: VIRTUAL_TRESOR_SYSTEM_PROMPT },
    ...historyMessages.reverse().map(msg => ({ role: msg.role, content: msg.content })),
    { role: "user", content: `CORE MEMORY:\n${context || "Not found in direct memory."}\n\nQUESTION:\n${userMessage}` }
  ];

  // 3) Tools Definition
  const tools = [
    {
      type: "function",
      function: {
        name: "search_web",
        description: "Search the internet for current information.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string" },
          },
          required: ["query"],
        },
      },
    },
  ];

  try {
    // 4) DeepSeek Call
    console.log("Calling DeepSeek...");
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
        console.error("DeepSeek API Error:", response.status);
        return;
    }

    const data = (await response.json()) as DeepSeekResponse;
    const choice = data.choices[0];
    let finalContent = choice.message.content;
    let toolCalls = choice.message.tool_calls;

    // DSML Fallback/Leakage Check

    if (!toolCalls && finalContent && finalContent.includes("<｜DSML｜invoke")) {
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

    // 5) Handle Tool Execution
    if (toolCalls) {
        const toolCall = toolCalls[0];
        if (toolCall.function.name === "search_web") {
            const args = JSON.parse(toolCall.function.arguments) as { query: string };
            console.log(`Executing Search Tool: ${args.query}`);
            
            const searchResult = await searchWeb(args.query);
            const searchContent = searchResult 
            ? `SEARCH RESULTS (Answer: ${searchResult.answer}):\n${JSON.stringify(searchResult.results)}`
            : "No search results found.";

            messages.push(choice.message);
            messages.push({
                role: "tool",
                content: searchContent,
                tool_call_id: toolCall.id,
            });

            const secondResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
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
            
            if (secondResponse.ok) {
                const secondData = await secondResponse.json();
                finalContent = secondData.choices[0].message.content;
            }
        }
    }

    // 6) Send Reply via Twilio
    if (finalContent) {
        // Save Assistant Message
        await prisma.message.create({
            data: {
                chatId: chat.id,
                role: 'assistant',
                content: finalContent
            }
        });

        console.log("Sending WhatsApp reply...");
        await sendWhatsAppMessage(from, finalContent);
    } else {
        console.warn("No content generated by AI");
    }

  } catch (error: unknown) {
    console.error("AI Logic Error:", error);
  }
}

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
    const to = formData.get("To") as string; // The number receiving the message
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

    console.log(`Twilio Message from ${from} to ${to}: ${body}`);

    // Process logic (awaiting ensures it finishes before response)
    await handleIncomingMessage(from, to, body);

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

async function handleIncomingMessage(from: string, to: string, userMessage: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
      console.error("Missing DEEPSEEK_API_KEY");
      return;
  }

  // 0) Identify the organization by the receiving number
  let organization = null;
  let systemPrompt = VIRTUAL_TRESOR_SYSTEM_PROMPT; // Default prompt
  
  if (to) {
    // Extract just the phone number (remove "whatsapp:" prefix if present)
    const toNumber = to.replace("whatsapp:", "");
    
    organization = await prisma.organization.findFirst({
      where: { 
        whatsappNumber: toNumber,
        isActive: true,
      },
      include: {
        knowledgeBase: true,
      },
    });

    // Check if organization has exceeded their message limit
    if (organization) {
      if (organization.monthlyMessageCount >= organization.monthlyMessageLimit) {
        console.warn(`Organization ${organization.id} has exceeded message limit`);
        await sendWhatsAppMessage(
          from,
          "This service has reached its monthly message limit. Please contact the organization for assistance."
        );
        return;
      }

      // Check business hours if enabled
      if (organization.businessHoursEnabled) {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        if (organization.businessHoursStart && organization.businessHoursEnd) {
          const [startHour, startMin] = organization.businessHoursStart.split(":").map(Number);
          const [endHour, endMin] = organization.businessHoursEnd.split(":").map(Number);
          const startTime = startHour * 60 + startMin;
          const endTime = endHour * 60 + endMin;

          if (currentTime < startTime || currentTime > endTime) {
            const outOfHoursMsg = `Thank you for contacting ${organization.name}. We are currently outside business hours (${organization.businessHoursStart} - ${organization.businessHoursEnd}). We'll respond as soon as possible.`;
            await sendWhatsAppMessage(from, outOfHoursMsg);
            return;
          }
        }
      }

      // Use organization's trained AI prompt if available
      if (organization.knowledgeBase?.trainedPrompt) {
        systemPrompt = organization.knowledgeBase.trainedPrompt;
      }

      // Increment message count for the organization
      await prisma.organization.update({
        where: { id: organization.id },
        data: {
          monthlyMessageCount: { increment: 1 },
          totalMessages: { increment: 1 },
        },
      });
    }
  }

  // 1) Database Persistence: Get/Create Chat & History
  let chat = await prisma.chat.findFirst({
      where: { 
        userId: from,
        organizationId: organization?.id || null,
      },
      orderBy: { createdAt: 'desc' }
  });

  if (!chat) {
      chat = await prisma.chat.create({
          data: { 
            userId: from,
            organizationId: organization?.id || null,
          }
      });

      // Increment conversation count if organization exists
      if (organization) {
        await prisma.organization.update({
          where: { id: organization.id },
          data: { totalConversations: { increment: 1 } },
        });
      }

      // Send welcome message if configured
      if (organization?.welcomeMessage && organization.autoReplyEnabled) {
        await sendWhatsAppMessage(from, organization.welcomeMessage);
      }
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
    // Use organization-specific system prompt or default
  
  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...historyMessages.reverse().map(msg => ({ 
      role: msg.role as "system" | "user" | "assistant" | "tool", 
      content: msg.content 
    })),
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

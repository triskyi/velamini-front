
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id: orgId } = await context.params;
  if (!orgId) {
    return NextResponse.json({ error: "Organization ID not found in params." }, { status: 400 });
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { url } = await req.json();
  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  // Set trainingStatus to "training"
  await prisma.organization.update({
    where: { id: orgId },
    data: { trainingStatus: "training" },
  });

  // Fetch website content
  let websiteContent = "";
  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      await prisma.organization.update({ where: { id: orgId }, data: { trainingStatus: "failed" } });
      return NextResponse.json({ error: `Failed to fetch website: ${res.status}` }, { status: 400 });
    }
    websiteContent = await res.text();
  } catch (err) {
    await prisma.organization.update({ where: { id: orgId }, data: { trainingStatus: "failed" } });
    return NextResponse.json({ error: "Could not fetch website content." }, { status: 400 });
  }


  // Extract readable text from HTML (simple approach)
  function extractTextFromHTML(html: string) {
    return html.replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  const extractedText = extractTextFromHTML(websiteContent);

  // Call DeepSeek API to generate Q&A pairs
  let qaPairs = [];
  let aiSuccess = false;
  let deepseekError = null;
  try {
    if (!DEEPSEEK_API_KEY) throw new Error("DeepSeek API key not set");
    const prompt = `Given the following website content, generate a list of at least 25 diverse and useful customer Q&A pairs (as a JSON array with 'question' and 'answer' fields) that would help an AI agent answer questions about this business.\n\nContent:\n${extractedText.slice(0, 12000)}`;
    const dsRes = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant that creates customer Q&A pairs for business knowledge bases." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });
    const dsJson = await dsRes.json();
    // Try to extract JSON from the response
    const text = dsJson.choices?.[0]?.message?.content || "";
    // Find first JSON array in the text
    const match = text.match(/\[.*\]/s);
    if (match) {
      qaPairs = JSON.parse(match[0]);
    } else {
      // fallback: try to parse whole text
      qaPairs = JSON.parse(text);
    }
    aiSuccess = Array.isArray(qaPairs) && qaPairs.length > 0;
  } catch (err) {
    deepseekError = String(err);
    aiSuccess = false;
  }

  // Upsert knowledgeBase and set isModelTrained: true if DeepSeek succeeded
  if (aiSuccess) {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: { knowledgeBase: true },
      });
      if (org?.knowledgeBase) {
        await prisma.knowledgeBase.update({
          where: { id: org.knowledgeBase.id },
          data: {
            qaPairs,
            trainedPrompt: extractedText.slice(0, 2000),
            isModelTrained: true,
            lastTrainedAt: new Date(),
          },
        });
      } else {
        await prisma.knowledgeBase.create({
          data: {
            organizationId: orgId,
            qaPairs,
            trainedPrompt: extractedText.slice(0, 2000),
            isModelTrained: true,
            lastTrainedAt: new Date(),
          },
        });
      }
      await prisma.organization.update({
        where: { id: orgId },
        data: { trainingStatus: "trained" },
      });
    } catch (err) {
      aiSuccess = false;
    }
  } else {
    await prisma.organization.update({ where: { id: orgId }, data: { trainingStatus: "failed" } });
  }

  return NextResponse.json({
    ok: aiSuccess,
    url,
    message: aiSuccess
      ? "Agent trained on website content!"
      : `Agent training failed.${deepseekError ? " DeepSeek error: " + deepseekError : ""}`,
    contentPreview: extractedText.slice(0, 500),
    trainingStatus: aiSuccess ? "trained" : "failed",
    qaPairs: aiSuccess ? qaPairs : undefined,
  });
}

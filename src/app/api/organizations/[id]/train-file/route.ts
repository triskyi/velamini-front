import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { promises as fs } from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export const runtime = "nodejs";

export async function POST(req: NextRequest, context: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  let orgId: string | undefined;
  if (typeof (context.params as any)?.then === 'function') {
    const params = await (context.params as Promise<{ id: string }>);
    orgId = params?.id;
  } else {
    orgId = (context.params as { id: string })?.id;
  }
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!orgId) {
    return NextResponse.json({ error: "Organization ID not found in params." }, { status: 400 });
  }
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  // Save file to disk
  const uploadDir = path.join(process.cwd(), "uploads", orgId);
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  await fs.writeFile(filePath, buffer);

  // Extract text from file (supports .txt, .md, .json, .csv, .html, .pdf, .docx)
  let fileText = "";
  const ext = path.extname(file.name).toLowerCase();
  if ([".txt", ".md", ".json", ".csv", ".html"].includes(ext)) {
    fileText = buffer.toString("utf-8");
  } else if (ext === ".pdf") {
    try {
      const data = await pdfParse(buffer);
      fileText = data.text;
    } catch (err) {
      return NextResponse.json({ error: "Failed to extract text from PDF." }, { status: 400 });
    }
  } else if (ext === ".docx") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      fileText = result.value;
    } catch (err) {
      return NextResponse.json({ error: "Failed to extract text from DOCX." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Unsupported file type for training." }, { status: 400 });
  }

  // Call DeepSeek API to generate Q&A pairs
  let qaPairs = [];
  let aiSuccess = false;
  let deepseekError = null;
  try {
    if (!DEEPSEEK_API_KEY) throw new Error("DeepSeek API key not set");
    const prompt = `Given the following file content, generate a list of at least 25 diverse and useful customer Q&A pairs (as a JSON array with 'question' and 'answer' fields) that would help an AI agent answer questions about this business.\n\nContent:\n${fileText.slice(0, 12000)}`;
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
    const text = dsJson.choices?.[0]?.message?.content || "";
    // Log DeepSeek response for debugging
    console.log("DeepSeek raw response:", text);
    let parseError = null;
    try {
      const match = text.match(/\[.*\]/s);
      if (match) {
        qaPairs = JSON.parse(match[0]);
      } else {
        qaPairs = JSON.parse(text);
      }
      aiSuccess = Array.isArray(qaPairs) && qaPairs.length > 0;
    } catch (err2) {
      parseError = String(err2);
      aiSuccess = false;
    }
    if (!aiSuccess) {
      console.error("DeepSeek parse error:", parseError, "\nRaw text:", text);
    }
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
            trainedPrompt: fileText.slice(0, 2000),
            isModelTrained: true,
            lastTrainedAt: new Date(),
          },
        });
      } else {
        await prisma.knowledgeBase.create({
          data: {
            organizationId: orgId,
            qaPairs,
            trainedPrompt: fileText.slice(0, 2000),
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
    file: file.name,
    message: aiSuccess
      ? "Agent trained on file content!"
      : `Agent training failed.${deepseekError ? " DeepSeek error: " + deepseekError : ""}`,
    trainingStatus: aiSuccess ? "trained" : "failed",
    qaPairs: aiSuccess ? qaPairs : undefined,
  });
}

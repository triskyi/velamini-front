import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs"; // needed for pdf-parse (uses Buffer/fs)

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const supported = ["pdf", "txt", "md"];
    if (!supported.includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or TXT file." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let extractedText = "";

    if (ext === "pdf") {
      // Dynamically import so Next.js doesn't try to bundle it for edge
      // Use the core lib directly — the package index loads @napi-rs/canvas
      // which crashes in Next.js serverless. lib/pdf-parse.js has no canvas deps.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (buf: Buffer) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      extractedText = data.text?.trim() ?? "";
    } else {
      // txt / md — just decode as UTF-8
      extractedText = buffer.toString("utf-8").trim();
    }

    if (!extractedText) {
      return NextResponse.json(
        { error: "Could not extract any text from the file." },
        { status: 422 }
      );
    }

    // Save to knowledgeBase.rawContent
    await prisma.knowledgeBase.upsert({
      where: { userId },
      update: { rawContent: extractedText },
      create: { userId, rawContent: extractedText },
    });

    // Return a preview (first 300 chars) so the UI can show confirmation
    const preview = extractedText.slice(0, 300) + (extractedText.length > 300 ? "…" : "");
    return NextResponse.json({ ok: true, preview, length: extractedText.length });
  } catch (err: any) {
    console.error("[cv-upload]", err);
    return NextResponse.json({ error: "Failed to process file." }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    await prisma.knowledgeBase.updateMany({
      where: { userId: session.user.id },
      data:  { rawContent: null },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

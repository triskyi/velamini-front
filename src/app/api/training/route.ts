import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userPrompt = String(body.userPrompt ?? "").trim();
    const aiAnswer = String(body.aiAnswer ?? "").trim();
    const userEdit = body.userEdit ? String(body.userEdit).trim() : null;
    const rating = body.rating !== undefined ? Number(body.rating) : null;

    if (!userPrompt || !aiAnswer) {
      return NextResponse.json({ error: "Missing userPrompt or aiAnswer" }, { status: 400 });
    }

    if (rating !== null && (Number.isNaN(rating) || rating < 1 || rating > 5)) {
      return NextResponse.json({ error: "rating must be 1..5" }, { status: 400 });
    }

    const created = await prisma.trainingExample.create({
      data: { userPrompt, aiAnswer, userEdit, rating, source: "chat" },
    });

    return NextResponse.json({ ok: true, created });
  } catch (e: any) {
    console.error("training save error:", e);
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}

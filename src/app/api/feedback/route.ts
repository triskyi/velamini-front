import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { rating, comment } = await req.json();

    if (!rating || typeof rating !== "number") {
      return NextResponse.json({ error: "Rating is required" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating,
        comment,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save feedback" },
      { status: 500 }
    );
  }
}

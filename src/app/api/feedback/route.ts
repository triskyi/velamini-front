import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { rating, comment } = await req.json();

    if (!rating || typeof rating !== "number") {
      return NextResponse.json({ error: "Rating is required" }, { status: 400 });
    }

    console.log("Saving feedback to DB:", { rating, comment });
    const feedback = await prisma.feedback.create({
      data: {
        rating,
        comment,
      },
    });
    console.log("Feedback saved successfully:", feedback.id);

    return NextResponse.json({ success: true, feedback });
  } catch (error: any) {
    console.error("Feedback API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save feedback" },
      { status: 500 }
    );
  }
}

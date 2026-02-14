import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Remove undefined/null fields
    const data = Object.fromEntries(
      Object.entries(body).filter(([_, v]) => v !== undefined && v !== null)
    );

    // Upsert knowledge base (update if exists, create if not)
    const knowledgeBase = await prisma.knowledgeBase.upsert({
      where: { userId: session.user.id },
      update: data,
      create: { 
        userId: session.user.id,
        ...data
      },
    });

    return NextResponse.json({ ok: true, knowledgeBase });
  } catch (error: unknown) {
    console.error("training save error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ ok: true, knowledgeBase });
  } catch (error: unknown) {
    console.error("training fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}

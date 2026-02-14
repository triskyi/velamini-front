import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get userId with fallback
    let userId: string | undefined = session.user.id;
    if (!userId && session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "User ID not found" },
        { status: 400 }
      );
    }

    // Disable sharing
    await prisma.knowledgeBase.update({
      where: { userId },
      data: {
        isPubliclyShared: false,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Sharing disabled",
    });
  } catch (error) {
    console.error("Disable sharing error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to disable sharing" },
      { status: 500 }
    );
  }
}

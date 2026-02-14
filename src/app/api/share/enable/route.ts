import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
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

    const body = await req.json();
    const { shareSlug } = body;

    if (!shareSlug) {
      return NextResponse.json(
        { ok: false, error: "Share slug is required" },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(shareSlug)) {
      return NextResponse.json(
        { ok: false, error: "Slug can only contain lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existing = await prisma.knowledgeBase.findUnique({
      where: { shareSlug },
    });

    if (existing && existing.userId !== userId) {
      return NextResponse.json(
        { ok: false, error: "This slug is already taken" },
        { status: 409 }
      );
    }

    // Enable sharing
    const knowledgeBase = await prisma.knowledgeBase.update({
      where: { userId },
      data: {
        shareSlug,
        isPubliclyShared: true,
      },
    });

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/chat/${shareSlug}`;

    return NextResponse.json({
      ok: true,
      shareUrl,
      shareSlug: knowledgeBase.shareSlug,
    });
  } catch (error) {
    console.error("Enable sharing error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to enable sharing" },
      { status: 500 }
    );
  }
}

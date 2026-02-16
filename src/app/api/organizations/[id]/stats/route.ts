import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/organizations/[id]/stats - Get organization statistics
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const organization = await prisma.organization.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Get conversation count
    const conversationCount = await prisma.chat.count({
      where: { organizationId: id },
    });

    // Get message count
    const messageCount = await prisma.message.count({
      where: {
        chat: {
          organizationId: id,
        },
      },
    });

    // Get recent conversations
    const recentConversations = await prisma.chat.findMany({
      where: { organizationId: id },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    // Calculate usage percentage
    const usagePercentage = organization.monthlyMessageLimit > 0
      ? (organization.monthlyMessageCount / organization.monthlyMessageLimit) * 100
      : 0;

    const stats = {
      totalConversations: conversationCount,
      totalMessages: messageCount,
      monthlyMessageCount: organization.monthlyMessageCount,
      monthlyMessageLimit: organization.monthlyMessageLimit,
      usagePercentage: Math.round(usagePercentage),
      recentConversations: recentConversations.map((chat) => ({
        id: chat.id,
        userId: chat.userId,
        lastMessage: chat.messages[0]?.content || "No messages",
        lastMessageAt: chat.messages[0]?.createdAt || chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    };

    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    console.error("Get organization stats error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

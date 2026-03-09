import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/organizations/[id]/analytics
 * Returns daily message counts (last 7 days) and weekly conversation growth (last 4 weeks).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await prisma.organization.findFirst({
      where: { id, ownerId: session.user.id },
      select: { id: true },
    });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const now = new Date();

    // ── Last 7 days: daily message counts ──────────────────────────
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const messages = await prisma.message.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        chat: { organizationId: id },
        role: "user",
      },
      select: { createdAt: true },
    });

    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    // Build ordered map of last 7 calendar days
    const dailyMap = new Map<string, { label: string; count: number }>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dailyMap.set(d.toDateString(), { label: DAY_LABELS[d.getDay()], count: 0 });
    }
    messages.forEach((m) => {
      const key = new Date(m.createdAt).toDateString();
      const entry = dailyMap.get(key);
      if (entry) entry.count++;
    });
    const dailyMessages = Array.from(dailyMap.values()).map(({ label, count }) => ({
      day: label,
      messages: count,
    }));

    // ── Last 4 weeks: new conversations per week ────────────────────
    const twentyEightDaysAgo = new Date(now);
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 27);
    twentyEightDaysAgo.setHours(0, 0, 0, 0);

    const chats = await prisma.chat.findMany({
      where: {
        organizationId: id,
        createdAt: { gte: twentyEightDaysAgo },
      },
      select: { createdAt: true },
    });

    // Bucket index 0 = oldest week, 3 = current week
    const weeklyMap = [0, 0, 0, 0];
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    chats.forEach((c) => {
      const ageMs = now.getTime() - new Date(c.createdAt).getTime();
      const weeksAgo = Math.floor(ageMs / msPerWeek);
      if (weeksAgo >= 0 && weeksAgo <= 3) {
        weeklyMap[3 - weeksAgo]++;
      }
    });
    const weeklyConversations = weeklyMap.map((count, i) => ({
      week: `W${i + 1}`,
      conversations: count,
    }));

    return NextResponse.json({ ok: true, dailyMessages, weeklyConversations });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

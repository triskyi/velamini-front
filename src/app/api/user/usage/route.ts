import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/usage
 * Lightweight endpoint for the navbar — returns current month usage only.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: {
      personalPlanType:          true,
      personalMonthlyMsgCount:   true,
      personalMonthlyMsgLimit:   true,
      creditsExhaustedAt:        true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const GRACE_MS = 3 * 24 * 60 * 60 * 1000;
  const exhaustedAt = user.creditsExhaustedAt ? user.creditsExhaustedAt.getTime() : null;
  const graceEndsAt = exhaustedAt ? exhaustedAt + GRACE_MS : null;
  const now = Date.now();
  const hardBlocked = graceEndsAt !== null && now > graceEndsAt;
  const graceRemaining = graceEndsAt && !hardBlocked
    ? Math.ceil((graceEndsAt - now) / (24 * 60 * 60 * 1000))
    : null;

  return NextResponse.json({
    ok: true,
    planType:       user.personalPlanType ?? "free",
    msgCount:       user.personalMonthlyMsgCount,
    msgLimit:       user.personalMonthlyMsgLimit,
    creditsExhaustedAt: user.creditsExhaustedAt?.toISOString() ?? null,
    hardBlocked,
    graceRemaining,
  });
}

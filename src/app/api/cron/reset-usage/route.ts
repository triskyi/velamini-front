import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Plan → monthly message limit (keep in sync with PLANS in pricing/page.tsx)
const PLAN_LIMITS: Record<string, number> = {
  free:    500,
  trial:   100,
  starter: 2_000,
  pro:     8_000,
  scale:   25_000,
};

/**
 * GET /api/cron/reset-usage
 *
 * Resets monthlyMessageCount to 0 for every organisation and re-applies
 * the correct limit for their current plan.
 *
 * Triggered on the 1st of each month via Vercel Cron (see vercel.json).
 * Protected by CRON_SECRET — Vercel sets this header automatically when
 * the env var is defined.
 */
export async function GET(req: NextRequest) {
  // Validate cron secret — rejects any external caller
  const secret = req.headers.get("x-cron-secret") ?? req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Batch-update each plan tier in parallel
  const results = await Promise.all(
    Object.entries(PLAN_LIMITS).map(([planType, limit]) =>
      prisma.organization.updateMany({
        where: { planType },
        data:  { monthlyMessageCount: 0, monthlyMessageLimit: limit, lastResetDate: new Date() },
      })
    )
  );

  const totalReset = results.reduce((sum, r) => sum + r.count, 0);
  console.log(`[cron/reset-usage] Reset ${totalReset} organisations at ${new Date().toISOString()}`);

  return NextResponse.json({ ok: true, totalReset, resetAt: new Date().toISOString() });
}

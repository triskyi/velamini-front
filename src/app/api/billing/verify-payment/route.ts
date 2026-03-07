import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PLAN_LIMITS: Record<string, number> = {
  free:    500,
  starter: 2000,
  pro:     8000,
  scale:   25000,
};

/**
 * POST /api/billing/verify-payment
 * Body: { txRef: string; transactionId: string }
 * Verifies with Flutterwave, upgrades org plan, creates invoice record.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.txRef || !body?.transactionId) {
    return NextResponse.json({ error: "Missing txRef or transactionId" }, { status: 400 });
  }

  // Look up the pending billing record
  const record = await prisma.billingRecord.findUnique({
    where: { txRef: body.txRef },
    include: { organization: { select: { id: true, ownerId: true } } },
  });

  if (!record) {
    return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
  }
  if (record.organization.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (record.status === "success") {
    return NextResponse.json({ ok: true, alreadyVerified: true });
  }

  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
  }

  // Verify with Flutterwave
  const flwRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${body.transactionId}/verify`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );

  if (!flwRes.ok) {
    return NextResponse.json({ error: "Flutterwave verification failed" }, { status: 502 });
  }

  const flwData = await flwRes.json();

  if (
    flwData?.data?.status !== "successful" ||
    flwData?.data?.tx_ref  !== body.txRef  ||
    flwData?.data?.currency !== "RWF"      ||
    flwData?.data?.amount   < record.amountRWF
  ) {
    // Mark as failed
    await prisma.billingRecord.update({
      where: { txRef: body.txRef },
      data: { status: "failed" },
    });
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  const newLimit = PLAN_LIMITS[record.plan] ?? 500;

  // Upgrade org + mark billing record successful
  await prisma.$transaction([
    prisma.organization.update({
      where: { id: record.organizationId },
      data: {
        planType:           record.plan,
        monthlyMessageLimit: newLimit,
        planRenewalDate:    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.billingRecord.update({
      where: { txRef: body.txRef },
      data: {
        status: "success",
        flwRef: flwData.data.flw_ref ?? null,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, plan: record.plan, limit: newLimit });
}

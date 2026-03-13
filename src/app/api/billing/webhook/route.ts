import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ORG_PLAN_LIMITS: Record<string, number> = {
  free:    500,
  starter: 2_000,
  pro:     8_000,
  scale:   25_000,
};
const USER_PLAN_LIMITS: Record<string, number> = {
  free: 200,
  plus: 1_500,
};

/**
 * POST /api/billing/webhook
 *
 * Flutterwave sends a POST to this URL after a payment completes.
 * The request carries a `verif-hash` header that must match
 * FLUTTERWAVE_SECRET_HASH to prove authenticity.
 *
 * Relevant event: charge.completed
 * Docs: https://developer.flutterwave.com/docs/integration-guides/webhooks
 */
export async function POST(req: Request) {
  // ── 1. Verify webhook signature ────────────────────────────────────────
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  if (!secretHash) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const signature = req.headers.get("verif-hash");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!timingSafeEqual(signature, secretHash)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // ── 2. Parse payload ───────────────────────────────────────────────────
  let payload: FlutterwaveWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Only handle completed charges — acknowledge all other events with 200
  if (payload.event !== "charge.completed") {
    return NextResponse.json({ received: true });
  }

  const { data } = payload;

  // Only process successful payments
  if (data.status !== "successful") {
    if (data.tx_ref) {
      const isUserTx = data.tx_ref.startsWith("vela-user-");
      if (isUserTx) {
        await prisma.userBillingRecord
          .updateMany({ where: { txRef: data.tx_ref, status: "pending" }, data: { status: "failed" } })
          .catch(() => {});
      } else {
        await prisma.billingRecord
          .updateMany({ where: { txRef: data.tx_ref, status: "pending" }, data: { status: "failed" } })
          .catch(() => {});
      }
    }
    return NextResponse.json({ received: true });
  }

  // ── 3. Re-verify with Flutterwave API (defence-in-depth) ──────────────
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
  }

  const flwRes = await fetch(
    `https://api.flutterwave.com/v3/transactions/${data.id}/verify`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );

  if (!flwRes.ok) {
    return NextResponse.json({ error: "Verification failed" }, { status: 502 });
  }

  const flwData: { data: FlutterwaveTransactionData } = await flwRes.json();
  const verified = flwData.data;

  if (
    verified.status   !== "successful" ||
    verified.tx_ref   !== data.tx_ref  ||
    verified.currency !== "RWF"
  ) {
    const isUserTx = data.tx_ref.startsWith("vela-user-");
    if (isUserTx) {
      await prisma.userBillingRecord
        .updateMany({ where: { txRef: data.tx_ref, status: "pending" }, data: { status: "failed" } })
        .catch(() => {});
    } else {
      await prisma.billingRecord
        .updateMany({ where: { txRef: data.tx_ref, status: "pending" }, data: { status: "failed" } })
        .catch(() => {});
    }
    return NextResponse.json({ received: true });
  }

  // ── 4. Route to user or org billing logic ─────────────────────────────
  if (data.tx_ref.startsWith("vela-user-")) {
    return handleUserBilling(data.tx_ref, verified);
  }
  return handleOrgBilling(data.tx_ref, verified);
}

// ── User billing ───────────────────────────────────────────────────────────

async function handleUserBilling(
  txRef: string,
  verified: FlutterwaveTransactionData,
): Promise<Response> {
  const record = await prisma.userBillingRecord.findUnique({ where: { txRef } });

  if (!record) return NextResponse.json({ received: true });
  if (record.status === "success") return NextResponse.json({ received: true });

  if (verified.amount < record.amountRWF) {
    await prisma.userBillingRecord.update({ where: { txRef }, data: { status: "failed" } });
    return NextResponse.json({ received: true });
  }

  const newLimit  = USER_PLAN_LIMITS[record.plan] ?? 200;
  const renewalMs = (record.periodMonths ?? 1) * 30 * 24 * 60 * 60 * 1000;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        personalPlanType:        record.plan,
        personalMonthlyMsgLimit: newLimit,
        personalPlanRenewalDate: new Date(Date.now() + renewalMs),
      },
    }),
    prisma.userBillingRecord.update({
      where: { txRef },
      data:  { status: "success", flwRef: verified.flw_ref ?? null },
    }),
  ]);

  const planLabel   = record.plan.charAt(0).toUpperCase() + record.plan.slice(1);
  const periodLabel = record.periodMonths === 12 ? "1 Year" : record.periodMonths === 6 ? "6 Months" : "1 Month";
  await prisma.notification.create({
    data: {
      userId: record.userId,
      type:   "billing",
      scope:  "personal",
      title:  `Plan upgraded to ${planLabel}`,
      body:   `Your payment of ${record.amountRWF.toLocaleString()} RWF was successful. Your ${planLabel} plan is now active for ${periodLabel} — ${newLimit.toLocaleString()} messages/month.`,
    },
  }).catch(() => {});

  return NextResponse.json({ received: true });
}

// ── Org billing ────────────────────────────────────────────────────────────

async function handleOrgBilling(
  txRef: string,
  verified: FlutterwaveTransactionData,
): Promise<Response> {
  const record = await prisma.billingRecord.findUnique({
    where: { txRef },
    include: { organization: { select: { id: true, ownerId: true } } },
  });

  if (!record) return NextResponse.json({ received: true });
  if (record.status === "success") return NextResponse.json({ received: true });

  if (verified.amount < record.amountRWF) {
    await prisma.billingRecord.update({ where: { txRef }, data: { status: "failed" } });
    return NextResponse.json({ received: true });
  }

  const newLimit  = ORG_PLAN_LIMITS[record.plan] ?? 500;
  const renewalMs = (record.periodMonths ?? 1) * 30 * 24 * 60 * 60 * 1000;

  await prisma.$transaction([
    prisma.organization.update({
      where: { id: record.organizationId },
      data: {
        planType:            record.plan,
        monthlyMessageLimit: newLimit,
        planRenewalDate:     new Date(Date.now() + renewalMs),
      },
    }),
    prisma.billingRecord.update({
      where: { txRef },
      data:  { status: "success", flwRef: verified.flw_ref ?? null },
    }),
  ]);

  const planLabel   = record.plan.charAt(0).toUpperCase() + record.plan.slice(1);
  const periodLabel = record.periodMonths === 12 ? "1 Year" : record.periodMonths === 6 ? "6 Months" : "1 Month";
  await prisma.notification.create({
    data: {
      userId:         record.organization.ownerId,
      organizationId: record.organizationId,
      type:   "billing",
      scope:  "org",
      title:  `Organisation upgraded to ${planLabel}`,
      body:   `Payment of ${record.amountRWF.toLocaleString()} RWF received. Your organisation is now on the ${planLabel} plan for ${periodLabel} — ${newLimit.toLocaleString()} messages/month.`,
    },
  }).catch(() => {});

  return NextResponse.json({ received: true });
}

// ── Types ──────────────────────────────────────────────────────────────────

interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type: string;
    customer: { email: string; phone_number: string; name: string };
  };
}

interface FlutterwaveTransactionData {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
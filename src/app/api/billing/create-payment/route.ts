import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ── Cost basis (DeepSeek-V3, blended) ───────────────────────────────────────
// Input $0.27/M (cache miss) · Output $1.10/M · Blended ≈ $0.57/M ≈ 810 RWF/M
// Using 900 RWF/M as cost with overhead buffer. Target ≥ 65 % gross margin.
// Token limits calculated as: price × 0.35 / (900/1_000_000)
const PLANS: Record<string, { amountRWF: number; label: string; limit: number }> = {
  starter: { amountRWF: 4_000,  label: "Starter", limit: 2_000  },
  pro:     { amountRWF: 12_000, label: "Pro",     limit: 8_000  },
  scale:   { amountRWF: 28_000, label: "Scale",   limit: 25_000 },
};

const PERIODS: Record<string, { months: number; discount: number; label: string }> = {
  monthly:  { months: 1,  discount: 0,    label: "1 Month"  },
  "6months": { months: 6,  discount: 0.10, label: "6 Months" },
  yearly:   { months: 12, discount: 0.20, label: "1 Year"   },
};

/**
 * POST /api/billing/create-payment
 * Body: { orgId: string; plan: "starter" | "pro" | "scale"; phoneNumber?: string }
 *
 * Returns all values needed to launch Flutterwave inline checkout.
 * The `redirectUrl` is set so Flutterwave redirects back after payment.
 * Async payment confirmation is handled by the /api/billing/webhook endpoint.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.orgId || !body?.plan) {
    return NextResponse.json({ error: "Missing orgId or plan" }, { status: 400 });
  }

  const plan = PLANS[body.plan as string];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const periodKey = (body.period as string) ?? "monthly";
  const period = PERIODS[periodKey] ?? PERIODS.monthly;
  const totalAmount = Math.round(plan.amountRWF * period.months * (1 - period.discount));

  // Validate phone number format if provided (Rwanda MTN: +2507XXXXXXXX)
  const phoneNumber: string | undefined = body.phoneNumber ?? undefined;
  if (phoneNumber !== undefined) {
    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
  }

  // Verify the org belongs to this user
  const org = await prisma.organization.findFirst({
    where: { id: body.orgId, ownerId: session.user.id },
    select: { id: true, name: true, contactEmail: true },
  });
  if (!org) {
    return NextResponse.json({ error: "Organisation not found" }, { status: 404 });
  }

  const txRef = `vela-${org.id}-${body.plan}-${Date.now()}`;

  // Create a pending billing record
  await prisma.billingRecord.create({
    data: {
      organizationId: org.id,
      plan:           body.plan,
      amountRWF:      totalAmount,
      periodMonths:   period.months,
      txRef,
      status:         "pending",
    },
  });

  const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
  }

  // Build the post-payment redirect URL (Flutterwave appends status, tx_ref, transaction_id)
  const { origin } = new URL(req.url);
  const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? origin;
  const redirectUrl = `${appUrl}/api/billing/payment-redirect`;

  return NextResponse.json({
    txRef,
    publicKey,
    amount:      plan.amountRWF,
    currency:    "RWF",
    redirectUrl,
    phoneNumber: phoneNumber ?? null,
    customer: {
      email:        org.contactEmail ?? session.user.email ?? "",
      name:         session.user.name ?? org.name,
      phone_number: phoneNumber ?? "",
    },
    customizations: {
      title:       `Velamini ${plan.label} Plan`,
      description: `${plan.limit.toLocaleString()} messages / month · ${period.label}`,
      logo:        `${appUrl}/logo.png`,
    },
    meta: {
      orgId: org.id,
      plan:  body.plan,
    },
  });
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ── Cost basis: blended DeepSeek cost ≈ 900 RWF/M tokens; target ≥ 65 % margin
// Plus: 3,000 RWF × 35 % = 1,050 RWF → 1,050/900 × 1M = ~1.17M → 1M tokens (buffer kept)
const PERSONAL_PLANS: Record<string, { amountRWF: number; label: string; limit: number }> = {
  plus: { amountRWF: 2_000, label: "Personal Plus", limit: 1_500 },
};

const PERIODS: Record<string, { months: number; discount: number; label: string }> = {
  monthly:  { months: 1,  discount: 0,    label: "1 Month"  },
  "6months": { months: 6,  discount: 0.10, label: "6 Months" },
  yearly:   { months: 12, discount: 0.20, label: "1 Year"   },
};

/**
 * POST /api/billing/user/create-payment
 * Body: { plan: "plus"; phoneNumber?: string }
 *
 * Creates a pending UserBillingRecord and returns everything required
 * to launch Flutterwave inline checkout with MTN Mobile Money.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.plan) {
    return NextResponse.json({ error: "Missing plan" }, { status: 400 });
  }

  const plan = PERSONAL_PLANS[body.plan as string];
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const periodKey = (body.period as string) ?? "monthly";
  const period = PERIODS[periodKey] ?? PERIODS.monthly;
  const totalAmount = Math.round(plan.amountRWF * period.months * (1 - period.discount));

  // Validate phone number if provided
  let phoneNumber: string | undefined = body.phoneNumber ?? undefined;
  if (phoneNumber !== undefined) {
    let cleaned = phoneNumber.replace(/\s/g, "");
    // Normalize local Rwanda format (0788...) to international (+250788...)
    if (/^0[78]\d{8}$/.test(cleaned)) cleaned = "+250" + cleaned.slice(1);
    if (!/^\+?[1-9]\d{7,14}$/.test(cleaned)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    phoneNumber = cleaned;
  }

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { id: true, name: true, email: true, personalPlanType: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.personalPlanType === body.plan) {
    return NextResponse.json({ error: "Already on this plan" }, { status: 409 });
  }

  const txRef = `vela-user-${user.id}-${body.plan}-${Date.now()}`;

  await prisma.userBillingRecord.create({
    data: {
      userId:      user.id,
      plan:        body.plan,
      amountRWF:   totalAmount,
      periodMonths: period.months,
      txRef,
      status:      "pending",
    },
  });

  const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
  }

  const { origin } = new URL(req.url);
  const appUrl     = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? origin;
  const redirectUrl = `${appUrl}/api/billing/user/payment-redirect`;

  return NextResponse.json({
    txRef,
    publicKey,
    amount:      totalAmount,
    currency:    "RWF",
    redirectUrl,
    customer: {
      email:        user.email ?? "",
      name:         user.name  ?? "User",
      phone_number: phoneNumber ?? "",
    },
    customizations: {
      title:       `Velamini ${plan.label}`,
      description: `${plan.limit.toLocaleString()} messages / month · ${period.label}`,
      logo:        `${appUrl}/logo.png`,
    },
    meta: { userId: user.id, plan: body.plan, period: periodKey },
  });
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PERSONAL_PLANS: Record<string, { amountRWF: number; label: string; limit: number }> = {
  plus: { amountRWF: 50, label: "Personal Plus", limit: 1500 },
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

  // Validate phone number if provided
  const phoneNumber: string | undefined = body.phoneNumber ?? undefined;
  if (phoneNumber !== undefined) {
    const cleaned = phoneNumber.replace(/\s/g, "");
    if (!/^\+?[1-9]\d{7,14}$/.test(cleaned)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
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
      userId:    user.id,
      plan:      body.plan,
      amountRWF: plan.amountRWF,
      txRef,
      status:    "pending",
    },
  });

  const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
  }

  const appUrl     = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
  const redirectUrl = `${appUrl}/api/billing/user/payment-redirect`;

  return NextResponse.json({
    txRef,
    publicKey,
    amount:      plan.amountRWF,
    currency:    "RWF",
    redirectUrl,
    customer: {
      email:        user.email ?? "",
      name:         user.name  ?? "User",
      phone_number: phoneNumber ?? "",
    },
    customizations: {
      title:       `Velamini ${plan.label}`,
      description: `${plan.limit.toLocaleString()} messages / month`,
      logo:        `${appUrl}/logo.png`,
    },
    meta: { userId: user.id, plan: body.plan },
  });
}

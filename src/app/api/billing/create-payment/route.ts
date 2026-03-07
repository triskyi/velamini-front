import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PLANS: Record<string, { amountRWF: number; label: string; limit: number }> = {
  starter: { amountRWF: 5000,  label: "Starter", limit: 2000  },
  pro:     { amountRWF: 15000, label: "Pro",     limit: 8000  },
  scale:   { amountRWF: 35000, label: "Scale",   limit: 25000 },
};

/**
 * POST /api/billing/create-payment
 * Body: { orgId: string; plan: "starter" | "pro" | "scale" }
 * Returns: { txRef: string; publicKey: string; amount: number; currency: string; customer: {...}; meta: {...} }
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
      amountRWF:      plan.amountRWF,
      txRef,
      status:         "pending",
    },
  });

  const publicKey = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json({ error: "Payment service not configured" }, { status: 503 });
  }

  return NextResponse.json({
    txRef,
    publicKey,
    amount:   plan.amountRWF,
    currency: "RWF",
    customer: {
      email: org.contactEmail ?? session.user.email ?? "",
      name:  session.user.name ?? org.name,
    },
    meta: {
      orgId: org.id,
      plan:  body.plan,
    },
  });
}

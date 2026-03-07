import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PLAN_LIMITS: Record<string, number> = {
  free: 500, trial: 100, starter: 2000, pro: 8000, scale: 25000,
};

// PATCH /api/admin/organizations/[id]
// Body: { planType?, isActive?, monthlyMessageLimit?, agentName?, billingEmail?, contactEmail? }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { planType, isActive, monthlyMessageLimit, agentName, billingEmail, contactEmail } = body;

  const data: Record<string, any> = {};

  if (planType !== undefined) {
    const allowed = ["free", "trial", "starter", "pro", "scale"];
    if (!allowed.includes(planType))
      return NextResponse.json({ error: "Invalid planType" }, { status: 400 });
    data.planType = planType;
    // Auto-set limit when plan changes (overrideable by explicit monthlyMessageLimit)
    data.monthlyMessageLimit = PLAN_LIMITS[planType] ?? 500;
  }
  if (monthlyMessageLimit !== undefined) {
    const n = Number(monthlyMessageLimit);
    if (isNaN(n) || n < 0)
      return NextResponse.json({ error: "Invalid monthlyMessageLimit" }, { status: 400 });
    data.monthlyMessageLimit = n;
  }
  if (isActive !== undefined) data.isActive = Boolean(isActive);
  if (agentName !== undefined) data.agentName = String(agentName).trim() || null;
  if (billingEmail !== undefined) data.billingEmail = String(billingEmail).trim() || null;
  if (contactEmail !== undefined) data.contactEmail = String(contactEmail).trim() || null;

  if (Object.keys(data).length === 0)
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

  const org = await prisma.organization.update({ where: { id }, data });
  return NextResponse.json({ ok: true, org });
}

// DELETE /api/admin/organizations/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.organization.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// POST /api/admin/organizations/[id]?action=reset-usage
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { action } = await req.json().catch(() => ({ action: "" }));

  if (action === "reset-usage") {
    const org = await prisma.organization.update({
      where: { id },
      data: { monthlyMessageCount: 0, lastResetDate: new Date() },
    });
    return NextResponse.json({ ok: true, org });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

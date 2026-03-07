import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/billing/invoices?orgId=xxx
 * Returns the last 20 successful billing records for this org.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");
  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
  }

  // Verify ownership
  const org = await prisma.organization.findFirst({
    where: { id: orgId, ownerId: session.user.id },
    select: { id: true },
  });
  if (!org) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const records = await prisma.billingRecord.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true, plan: true, amountRWF: true,
      txRef: true, flwRef: true, status: true, createdAt: true,
    },
  });

  return NextResponse.json({ invoices: records });
}

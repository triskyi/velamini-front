import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications/org/[orgId]
 * Returns notifications visible to an org (broadcast "all" + org-specific).
 */
export async function GET(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId } = await params;
  const userId = session.user.id;

  // Verify ownership
  const org = await prisma.organization.findFirst({ where: { id: orgId, ownerId: userId }, select: { id: true } });
  if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  const where = {
    OR: [
      { scope: "all" as const },
      { organizationId: orgId },
    ],
  };

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true, type: true, scope: true, title: true, body: true,
        isRead: true, createdAt: true,
      },
    }),
  ]);

  const unreadCount = await prisma.notification.count({
    where: { OR: [{ scope: "all" }, { organizationId: orgId }], isRead: false },
  });

  return NextResponse.json({ ok: true, notifications, total, unreadCount, page, pageSize });
}

/**
 * PATCH /api/notifications/org/[orgId]
 * Mark org notifications as read.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgId } = await params;
  const userId = session.user.id;

  const org = await prisma.organization.findFirst({ where: { id: orgId, ownerId: userId }, select: { id: true } });
  if (!org) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as { ids?: string[]; all?: boolean };

  if (body.all) {
    await prisma.notification.updateMany({
      where: { OR: [{ organizationId: orgId }, { scope: "all" }], isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.ids?.length) {
    await prisma.notification.updateMany({
      where: { id: { in: body.ids }, OR: [{ organizationId: orgId }, { scope: "all" }] },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Provide ids or all:true" }, { status: 400 });
}

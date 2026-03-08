import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 * Returns notifications visible to the authenticated user:
 *   - broadcast (scope="all")
 *   - targeted to this user (userId = session.user.id)
 * Query: page, pageSize, unreadOnly
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const page      = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize  = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const where: Record<string, unknown> = {
    OR: [
      { scope: "all" },
      { userId },
    ],
  };
  if (unreadOnly) (where as any).isRead = false;

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
    where: { OR: [{ scope: "all" }, { userId }], isRead: false },
  });

  return NextResponse.json({ ok: true, notifications, total, unreadCount, page, pageSize });
}

/**
 * PATCH /api/notifications
 * Mark notifications as read.
 * Body: { ids: string[] } to mark specific ones,
 *       { all: true } to mark all visible ones read.
 */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const body = await req.json() as { ids?: string[]; all?: boolean };

  if (body.all) {
    await prisma.notification.updateMany({
      where: { OR: [{ userId }, { scope: "all" }], isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.ids?.length) {
    await prisma.notification.updateMany({
      where: { id: { in: body.ids }, OR: [{ userId }, { scope: "all" }] },
      data: { isRead: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Provide ids or all:true" }, { status: 400 });
}

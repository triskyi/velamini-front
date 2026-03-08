import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/notifications
 * Returns paginated sent notifications.
 * Query: page, pageSize, scope (all|personal|org), type (all|system|billing|info|warning)
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));
  const scope    = searchParams.get("scope") ?? "all";
  const type     = searchParams.get("type") ?? "all";

  const where: Record<string, unknown> = {};
  if (scope !== "all") where.scope = scope;
  if (type  !== "all") where.type  = type;

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user:         { select: { id: true, name: true, email: true } },
        organization: { select: { id: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json({ ok: true, notifications, total, page, pageSize, pages: Math.ceil(total / pageSize) });
}

/**
 * POST /api/admin/notifications
 * Send a notification.
 *
 * Body variants:
 *   { scope: "all",      type, title, body }           → broadcast to all personal users
 *   { scope: "personal", type, title, body }           → duplicate for each personal user
 *   { scope: "org",      type, title, body }           → duplicate for each org
 *   { scope: "user",     type, title, body, userId }   → single user
 *   { scope: "orgone",   type, title, body, orgId }    → single org
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as {
    scope: "all" | "personal" | "org" | "user" | "orgone";
    type?: string;
    title: string;
    body: string;
    userId?: string;
    orgId?: string;
  };

  const { scope, title, type = "info" } = body;
  const msgBody = body.body;

  if (!title?.trim() || !msgBody?.trim()) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 });
  }

  const allowedTypes  = ["system", "billing", "info", "warning"];
  const allowedScopes = ["all", "personal", "org", "user", "orgone"];
  if (!allowedScopes.includes(scope)) return NextResponse.json({ error: "invalid scope" }, { status: 400 });
  if (!allowedTypes.includes(type))   return NextResponse.json({ error: "invalid type" }, { status: 400 });

  try {
    if (scope === "user") {
      if (!body.userId) return NextResponse.json({ error: "userId required for scope=user" }, { status: 400 });
      const notif = await prisma.notification.create({
        data: { scope, type, title, body: msgBody, userId: body.userId },
      });
      return NextResponse.json({ ok: true, count: 1, notification: notif });
    }

    if (scope === "orgone") {
      if (!body.orgId) return NextResponse.json({ error: "orgId required for scope=orgone" }, { status: 400 });
      const notif = await prisma.notification.create({
        data: { scope, type, title, body: msgBody, organizationId: body.orgId },
      });
      return NextResponse.json({ ok: true, count: 1, notification: notif });
    }

    if (scope === "all") {
      // Single broadcast record with no user/org link — all users and orgs will see it
      const notif = await prisma.notification.create({
        data: { scope, type, title, body: msgBody },
      });
      return NextResponse.json({ ok: true, count: 1, notification: notif });
    }

    if (scope === "personal") {
      // One notification per personal user
      const users = await prisma.user.findMany({
        where: { role: "user" },
        select: { id: true },
      });
      await prisma.notification.createMany({
        data: users.map(u => ({ scope, type, title, body: msgBody, userId: u.id })),
      });
      return NextResponse.json({ ok: true, count: users.length });
    }

    if (scope === "org") {
      // One notification per organization (linked to the org, not a specific user)
      const orgs = await prisma.organization.findMany({ select: { id: true } });
      await prisma.notification.createMany({
        data: orgs.map(o => ({ scope, type, title, body: msgBody, organizationId: o.id })),
      });
      return NextResponse.json({ ok: true, count: orgs.length });
    }
  } catch (err: unknown) {
    console.error("[admin/notifications POST]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  return NextResponse.json({ error: "Unhandled scope" }, { status: 400 });
}

/**
 * DELETE /api/admin/notifications?id=…
 * Remove a specific notification.
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.notification.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}

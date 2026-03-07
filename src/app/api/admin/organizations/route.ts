import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/organizations?search=&plan=&status=&page=1&pageSize=10
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(session.user as any).isAdminAuth)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const search   = searchParams.get("search")   ?? "";
  const plan     = searchParams.get("plan")     ?? "all";
  const status   = searchParams.get("status")   ?? "all";
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? "10")));

  const where: any = {};
  if (search) {
    where.OR = [
      { name:         { contains: search, mode: "insensitive" } },
      { contactEmail: { contains: search, mode: "insensitive" } },
      { owner: { email: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (plan   !== "all") where.planType = plan;
  if (status === "active")   where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const [total, organizations] = await Promise.all([
    prisma.organization.count({ where }),
    prisma.organization.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        knowledgeBase: { select: { id: true, isModelTrained: true, lastTrainedAt: true } },
        _count: { select: { chats: true, billingRecords: true } },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    organizations,
    total,
    page,
    pages: Math.ceil(total / pageSize),
  });
}

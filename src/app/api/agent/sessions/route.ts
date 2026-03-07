import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateAgent, corsHeaders } from "@/lib/agentAuth";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

/**
 * GET /api/agent/sessions
 *
 * Public — authenticated via X-Agent-Key header.
 * Rate limited. Returns paginated sessions for the organisation.
 */
export async function GET(req: NextRequest) {
  const cors = corsHeaders(req);
  try {
    const auth = await authenticateAgent(req);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status, headers: { ...cors, ...(auth.headers ?? {}) } }
      );
    }
    const { org } = auth;

    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 100);
    const page  = Math.max(Number(url.searchParams.get("page")  ?? "1"),  1);
    const skip  = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.chat.findMany({
        where: { organizationId: org.id },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        select: {
          id:        true,
          createdAt: true,
          updatedAt: true,
          _count:    { select: { messages: true } },
          messages:  {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { role: true, content: true, createdAt: true },
          },
        },
      }),
      prisma.chat.count({ where: { organizationId: org.id } }),
    ]);

    return NextResponse.json(
      {
        sessions: sessions.map((s) => ({
          sessionId:    s.id,
          messageCount: s._count.messages,
          createdAt:    s.createdAt,
          updatedAt:    s.updatedAt,
          lastMessage:  s.messages[0] ?? null,
        })),
        total, page, limit,
      },
      { headers: cors }
    );
  } catch (error) {
    console.error("[agent/sessions] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500, headers: cors });
  }
}

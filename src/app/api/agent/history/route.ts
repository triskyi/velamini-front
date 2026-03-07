import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateAgent, corsHeaders } from "@/lib/agentAuth";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

/**
 * GET /api/agent/history
 *
 * Public — authenticated via X-Agent-Key header.
 * Rate limited. Cross-org session guard enforced.
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
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId query parameter" }, { status: 400 });
    }

    // Verify this session belongs to this organisation
    const chat = await prisma.chat.findFirst({
      where: { id: sessionId, organizationId: org.id },
      select: {
        id:        true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: { id: true, role: true, content: true, createdAt: true },
        },
      },
    });

    if (!chat) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        sessionId:    chat.id,
        createdAt:    chat.createdAt,
        updatedAt:    chat.updatedAt,
        messageCount: chat.messages.length,
        messages:     chat.messages,
      },
      { headers: cors }
    );
  } catch (error) {
    console.error("[agent/history] error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500, headers: cors });
  }
}

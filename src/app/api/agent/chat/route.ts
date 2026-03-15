import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateAgent, corsHeaders, sanitiseInput, buildSystemPrompt } from "@/lib/agentAuth";

export const dynamic = "force-dynamic";

// ── CORS preflight ────────────────────────────────────────────────────────────
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

/**
 * POST /api/agent/chat
 *
 * Public — authenticated via X-Agent-Key header.
 * Security layers (in order):
 *   1. Key format check
 *   2. Rate limiting — 60 req/min per key (hashed bucket)
 *   3. DB lookup + org active check
 *   4. Monthly quota check
 *   5. Input sanitisation — length cap, strip null bytes / zero-width chars
 *   6. Cross-org session guard — sessionId must belong to this org
 *   7. Hardened system prompt — resists prompt injection
 *   8. DeepSeek call — DEEPSEEK_API_KEY stays server-side only
 *   9. Atomic persist — messages + counter in one transaction
 */
export async function POST(req: NextRequest) {
  const cors = corsHeaders(req);

  // ── 1–4: Auth, rate limit, quota ─────────────────────────────────────────
  const auth = await authenticateAgent(req, { checkQuota: true });
  if (!auth.ok) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.status, headers: { ...cors, ...(auth.headers ?? {}) } }
    );
  }
  const { org } = auth;

  // ── 5: Parse + sanitise body ─────────────────────────────────────────────
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400, headers: cors }); }

  const rawMessage = body?.message;
  if (!rawMessage || typeof rawMessage !== "string") {
    return NextResponse.json({ error: "message is required." }, { status: 400, headers: cors });
  }

  const message = sanitiseInput(rawMessage);
  if (message.length === 0) {
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400, headers: cors });
  }

  const sessionId = typeof body?.sessionId === "string" ? body.sessionId.trim() : null;

  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (!deepseekKey) {
    return NextResponse.json({ error: "AI service unavailable." }, { status: 503, headers: cors });
  }

  // ── 6: Resolve session — cross-org guard ─────────────────────────────────
  let chat: { id: string } | null = null;
  if (sessionId) {
    // Must belong to THIS org — prevents cross-org session snooping
    chat = await prisma.chat.findFirst({
      where: { id: sessionId, organizationId: org.id },
      select: { id: true },
    });
    // If sessionId supplied but not found for this org, create fresh
    // (don't reveal whether the session exists for another org)
  }
  if (!chat) {
    chat = await prisma.chat.create({
      data:   { organizationId: org.id },
      select: { id: true },
    });
  }

  // ── Load conversation history (last 14 messages = 7 turns) ───────────────
  const dbMessages = await prisma.message.findMany({
    where:   { chatId: chat.id },
    orderBy: { createdAt: "asc" },
    take:    14,
    select:  { role: true, content: true },
  });

  // ── 7: Build hardened system prompt ──────────────────────────────────────
  const systemPrompt = buildSystemPrompt(org);
  const agentName    = org.agentName || org.name;

  // ── 8: Call DeepSeek (server-side only — key never reaches browser) ───────
  const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${deepseekKey}` },
    body: JSON.stringify({
      model:       "deepseek-chat",
      max_tokens:  512,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        ...dbMessages.map(m => ({ role: m.role, content: m.content })),
        { role: "user",   content: message },
      ],
    }),
  });

  if (!aiRes.ok) {
    const status = aiRes.status;
    console.error("[agent/chat] DeepSeek error:", status);
    if (status === 529 || status === 503) {
      return NextResponse.json({ error: "AI service temporarily unavailable." }, { status: 503, headers: cors });
    }
    return NextResponse.json({ error: "AI service error." }, { status: 502, headers: cors });
  }

  const aiData = await aiRes.json();
  const reply: string = aiData?.choices?.[0]?.message?.content?.trim()
    ?? "I'm sorry, I couldn't process that request. Please try again.";

  // ── 9: Atomic persist — messages + quota counter in one transaction ───────
  await prisma.$transaction([
    prisma.message.createMany({
      data: [
        { chatId: chat.id, role: "user",      content: message },
        { chatId: chat.id, role: "assistant", content: reply   },
      ],
    }),
    prisma.chat.update({ where: { id: chat.id }, data: { updatedAt: new Date() } }),
    prisma.organization.update({
      where: { id: org.id },
      data:  { monthlyMessageCount: { increment: 1 }, totalMessages: { increment: 1 } },
    }),
  ]);

  return NextResponse.json(
    { reply, sessionId: chat.id, agentName },
    { status: 200, headers: cors }
  );
}

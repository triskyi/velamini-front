import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return (session?.user as any)?.isAdminAuth === true;
}

// POST /api/admin/settings/clear-chats
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { confirm } = await req.json();
  if (confirm !== "CLEAR_ALL_CHATS") {
    return NextResponse.json({ error: "Confirmation phrase required." }, { status: 400 });
  }

  // Delete all messages first (FK), then all chats
  const [messages, chats] = await Promise.all([
    prisma.message.deleteMany(),
    prisma.chat.deleteMany(),
  ]);

  return NextResponse.json({ ok: true, deleted: { messages: messages.count, chats: chats.count } });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return (session?.user as any)?.isAdminAuth === true;
}

// POST /api/admin/settings/reset-training
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { confirm } = await req.json();
  if (confirm !== "RESET_TRAINING") {
    return NextResponse.json({ error: "Confirmation phrase required." }, { status: 400 });
  }

  // Reset all knowledge bases: clear QA pairs and untrain
  const result = await prisma.knowledgeBase.updateMany({
    data: {
      isModelTrained: false,
      lastTrainedAt: null,
    },
  });

  return NextResponse.json({ ok: true, reset: result.count });
}

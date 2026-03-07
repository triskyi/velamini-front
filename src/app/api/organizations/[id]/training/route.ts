import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface QAPair {
  question: string;
  answer: string;
}

/**
 * POST /api/organizations/[id]/training
 * Save Q&A training pairs and rebuild the org agent's trained prompt.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const org = await prisma.organization.findFirst({
      where: { id, ownerId: session.user.id },
      include: { knowledgeBase: { select: { id: true } } },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { qaPairs = [] }: { qaPairs: QAPair[] } = body;

    // Validate Q&A pairs
    const validPairs = qaPairs.filter(
      (p) =>
        p &&
        typeof p.question === "string" &&
        p.question.trim() &&
        typeof p.answer === "string" &&
        p.answer.trim()
    );

    // Build trained prompt from org data + Q&A
    const agentName = org.agentName || org.name;
    const lines: string[] = [
      `AGENT NAME: ${agentName}`,
      `ORGANISATION: ${org.name}`,
    ];
    if (org.industry)     lines.push(`INDUSTRY: ${org.industry}`);
    if (org.description)  lines.push(`DESCRIPTION: ${org.description}`);
    if (org.website)      lines.push(`WEBSITE: ${org.website}`);
    if (org.agentPersonality) lines.push(`\nTONE & PERSONALITY:\n${org.agentPersonality}`);

    if (validPairs.length > 0) {
      lines.push("\nKNOWLEDGE BASE — Q&A PAIRS:");
      validPairs.forEach((p, i) => {
        lines.push(`Q${i + 1}: ${p.question.trim()}`);
        lines.push(`A${i + 1}: ${p.answer.trim()}`);
      });
    }

    const trainedPrompt = lines.join("\n");
    const qaPairsJson = validPairs as unknown as Prisma.InputJsonValue;

    // Upsert the KnowledgeBase for this organisation
    if (org.knowledgeBase) {
      await prisma.knowledgeBase.update({
        where: { id: org.knowledgeBase.id },
        data: {
          qaPairs: qaPairsJson,
          trainedPrompt,
          isModelTrained: true,
          lastTrainedAt: new Date(),
        },
      });
    } else {
      await prisma.knowledgeBase.create({
        data: {
          organizationId: org.id,
          qaPairs: qaPairsJson,
          trainedPrompt,
          isModelTrained: true,
          lastTrainedAt: new Date(),
        },
      });
    }

    // Return updated org with knowledgeBase
    const updated = await prisma.organization.findUnique({
      where: { id },
      include: {
        knowledgeBase: {
          select: { id: true, isModelTrained: true, lastTrainedAt: true, qaPairs: true },
        },
      },
    });

    return NextResponse.json({ ok: true, organization: updated });
  } catch (error) {
    console.error("Training error:", error);
    return NextResponse.json({ error: "Failed to save training data" }, { status: 500 });
  }
}

/**
 * GET /api/organizations/[id]/training
 * Fetch existing Q&A pairs for the org.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const org = await prisma.organization.findFirst({
      where: { id, ownerId: session.user.id },
      include: {
        knowledgeBase: {
          select: { qaPairs: true, isModelTrained: true, lastTrainedAt: true },
        },
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      qaPairs: org.knowledgeBase?.qaPairs ?? [],
      isModelTrained: org.knowledgeBase?.isModelTrained ?? false,
      lastTrainedAt: org.knowledgeBase?.lastTrainedAt ?? null,
    });
  } catch (error) {
    console.error("Get training error:", error);
    return NextResponse.json({ error: "Failed to fetch training data" }, { status: 500 });
  }
}

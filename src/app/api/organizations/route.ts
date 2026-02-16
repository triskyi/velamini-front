import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/organizations - List all organizations for current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizations = await prisma.organization.findMany({
      where: { ownerId: session.user.id },
      include: {
        knowledgeBase: {
          select: {
            id: true,
            isModelTrained: true,
            lastTrainedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, organizations });
  } catch (error) {
    console.error("Get organizations error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create a new organization
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, industry, website, contactEmail } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Organization name is required" },
        { status: 400 }
      );
    }

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        industry,
        website,
        contactEmail,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json({ ok: true, organization }, { status: 201 });
  } catch (error) {
    console.error("Create organization error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to create organization" },
      { status: 500 }
    );
  }
}

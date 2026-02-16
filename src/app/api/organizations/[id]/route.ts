import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/organizations/[id] - Get single organization
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organization = await prisma.organization.findFirst({
      where: {
        id,
        ownerId: session.user.id, // Ensure user owns this org
      },
      include: {
        knowledgeBase: true,
        _count: {
          select: {
            chats: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, organization });
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

// PATCH /api/organizations/[id] - Update organization
export async function PATCH(
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
    const existingOrg = await prisma.organization.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    
    // Remove fields that shouldn't be directly updated
    const {
      id: bodyId,
      ownerId,
      whatsappNumber,
      whatsappNumberSid,
      monthlyMessageCount,
      totalConversations,
      totalMessages,
      createdAt,
      ...updateData
    } = body;

    const organization = await prisma.organization.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ok: true, organization });
  } catch (error) {
    console.error("Update organization error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to update organization" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id] - Delete organization
export async function DELETE(
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
    const existingOrg = await prisma.organization.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // TODO: Release Twilio number if exists
    if (existingOrg.whatsappNumberSid) {
      // We'll implement this in the Twilio service
      console.warn("TODO: Release Twilio number:", existingOrg.whatsappNumberSid);
    }

    await prisma.organization.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true, message: "Organization deleted" });
  } catch (error) {
    console.error("Delete organization error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to delete organization" },
      { status: 500 }
    );
  }
}

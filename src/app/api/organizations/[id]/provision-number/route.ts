import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { purchasePhoneNumber, releasePhoneNumber } from "@/lib/twilio-provisioning";

// POST /api/organizations/[id]/provision-number - Provision a WhatsApp number
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
    const organization = await prisma.organization.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check if organization already has a number
    if (organization.whatsappNumber) {
      return NextResponse.json(
        { error: "Organization already has a WhatsApp number" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Purchase the number from Twilio
    const purchasedNumber = await purchasePhoneNumber(phoneNumber, id);

    // Update organization with the new number
    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: {
        whatsappNumber: purchasedNumber.phoneNumber,
        whatsappNumberSid: purchasedNumber.sid,
      },
    });

    return NextResponse.json({
      ok: true,
      organization: updatedOrg,
      message: "WhatsApp number provisioned successfully",
    });
  } catch (error: any) {
    console.error("Provision number error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to provision number" },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/provision-number - Release the WhatsApp number
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
    const organization = await prisma.organization.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    if (!organization.whatsappNumberSid) {
      return NextResponse.json(
        { error: "Organization does not have a provisioned number" },
        { status: 400 }
      );
    }

    // Release the number from Twilio
    await releasePhoneNumber(organization.whatsappNumberSid);

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: {
        whatsappNumber: null,
        whatsappNumberSid: null,
      },
    });

    return NextResponse.json({
      ok: true,
      organization: updatedOrg,
      message: "WhatsApp number released successfully",
    });
  } catch (error: any) {
    console.error("Release number error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to release number" },
      { status: 500 }
    );
  }
}

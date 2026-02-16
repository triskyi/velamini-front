import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPhoneNumberDetails, updateNumberWebhook } from "@/lib/twilio-provisioning";

// PATCH /api/organizations/[id]/number - Update number configuration
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

    if (!organization.whatsappNumber || !organization.whatsappNumberSid) {
      return NextResponse.json(
        { error: "No WhatsApp number provisioned" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { displayName, friendlyName } = body;

    // Update display name in database
    const updatedOrg = await prisma.organization.update({
      where: { id },
      data: {
        displayName: displayName || organization.displayName,
      },
    });

    // Note: Twilio doesn't directly support WhatsApp display names via API
    // Display name needs to be configured through WhatsApp Business API
    // For now, we store it in our DB for future use

    return NextResponse.json({
      ok: true,
      organization: updatedOrg,
      message: "Number configuration updated",
    });
  } catch (error: any) {
    console.error("Update number configuration error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to update configuration" },
      { status: 500 }
    );
  }
}

// GET /api/organizations/[id]/number - Get number details
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
        { error: "No WhatsApp number provisioned" },
        { status: 400 }
      );
    }

    // Get detailed info from Twilio
    const twilioDetails = await getPhoneNumberDetails(organization.whatsappNumberSid);

    return NextResponse.json({
      ok: true,
      number: {
        phoneNumber: organization.whatsappNumber,
        displayName: organization.displayName,
        sid: organization.whatsappNumberSid,
        twilioDetails,
      },
    });
  } catch (error: any) {
    console.error("Get number details error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to get number details" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      accountType,
      organizationName,
      contactEmail,
      industry,
      website,
      description,
      agentName,
      agentPersonality,
    } = body;

    if (!accountType || (accountType !== "personal" && accountType !== "organization")) {
      return NextResponse.json(
        { error: "Invalid account type" },
        { status: 400 }
      );
    }

    // Update user account type
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        accountType,
        onboardingComplete: true,
      },
    });

    // If organization account, create the first organization
    if (accountType === "organization" && organizationName) {
      const { randomUUID } = await import("crypto");
      const apiKey = `vela_${randomUUID().replace(/-/g, "")}`;
      await prisma.organization.create({
        data: {
          name: organizationName,
          contactEmail: contactEmail || undefined,
          industry: industry || undefined,
          website: website || undefined,
          description: description || undefined,
          agentName: agentName || undefined,
          agentPersonality: agentPersonality || undefined,
          apiKey,
          ownerId: session.user.id,
        },
      });
    }

    return NextResponse.json({ 
      ok: true, 
      user: {
        accountType: updatedUser.accountType,
        onboardingComplete: updatedUser.onboardingComplete,
      }
    });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      return NextResponse.json(
        { ok: false, error: "User not found — please sign in again" },
        { status: 404 }
      );
    }
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accountType: true,
        onboardingComplete: true,
        organizations: { select: { id: true }, take: 1 },
      },
    });

    return NextResponse.json({
      ok: true,
      user: {
        accountType: user?.accountType,
        onboardingComplete: user?.onboardingComplete,
        hasOrganization: (user?.organizations?.length ?? 0) > 0,
      },
    });
  } catch (error) {
    console.error("Get onboarding status error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to get onboarding status" },
      { status: 500 }
    );
  }
}

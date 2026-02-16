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
    const { accountType, organizationName, industry } = body;

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
      await prisma.organization.create({
        data: {
          name: organizationName,
          industry: industry || undefined,
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
  } catch (error) {
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
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("Get onboarding status error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to get onboarding status" },
      { status: 500 }
    );
  }
}

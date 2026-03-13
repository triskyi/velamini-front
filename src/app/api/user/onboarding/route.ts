import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "live.com",
  "msn.com",
  "aol.com",
  "protonmail.com",
  "me.com",
  "ymail.com",
  "googlemail.com",
  "mail.com",
  "inbox.com",
]);

function isPersonalEmail(email?: string | null): boolean {
  if (!email) return false;
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && PERSONAL_DOMAINS.has(domain);
}

const onboardingBodySchema = z.object({
  accountType: z.enum(["personal", "organization"]),
  organizationName: z.union([z.string().trim().min(1).max(120), z.literal("")]).optional(),
  contactEmail: z.union([z.string().trim().email(), z.literal("")]).optional(),
  industry: z.union([z.string().trim().max(120), z.literal("")]).optional(),
  website: z.union([z.string().trim().url().max(300), z.literal("")]).optional(),
  description: z.union([z.string().trim().max(2000), z.literal("")]).optional(),
  agentName: z.union([z.string().trim().min(1).max(120), z.literal("")]).optional(),
  agentPersonality: z.union([z.string().trim().max(2000), z.literal("")]).optional(),
});

function isAbortedRequestError(error: unknown): boolean {
  const err = error as { code?: string; name?: string; message?: string };
  return (
    err?.code === "ECONNRESET" ||
    err?.name === "AbortError" ||
    err?.message?.toLowerCase().includes("aborted") === true
  );
}

function isTransientDbError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  const msg = err?.message?.toLowerCase() ?? "";
  return (
    err?.code === "ECONNRESET" ||
    err?.code === "P1001" || // Can't reach database server
    err?.code === "P1017" || // Server has closed the connection
    err?.code === "P2028" || // Transaction API timeout / start timeout
    msg.includes("server has closed the connection") ||
    msg.includes("connection terminated unexpectedly") ||
    msg.includes("unable to start a transaction")
  );
}

async function withTransientRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (!isTransientDbError(error)) throw error;
    // One immediate retry for short-lived DB connection resets.
    return await fn();
  }
}

function isTransactionStartTimeout(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  const msg = err?.message?.toLowerCase() ?? "";
  return err?.code === "P2028" && msg.includes("unable to start a transaction");
}

type OrgOnboardingResult = {
  user: { accountType: string; onboardingComplete: boolean };
  orgId: string;
};

async function completeOrgOnboardingWithoutTransaction(args: {
  userId: string;
  organizationName: string;
  contactEmail: string;
  industry?: string;
  website?: string;
  description?: string;
  agentName: string;
  agentPersonality?: string;
  apiKey: string;
}): Promise<OrgOnboardingResult> {
  const existingOrg = await prisma.organization.findFirst({
    where: { ownerId: args.userId },
    select: { id: true },
  });

  const orgId =
    existingOrg?.id ??
    (
      await prisma.organization.create({
        data: {
          name: args.organizationName,
          contactEmail: args.contactEmail,
          industry: args.industry,
          website: args.website,
          description: args.description,
          agentName: args.agentName,
          agentPersonality: args.agentPersonality,
          apiKey: args.apiKey,
          ownerId: args.userId,
        },
        select: { id: true },
      })
    ).id;

  const user = await prisma.user.update({
    where: { id: args.userId },
    data: {
      accountType: "organization",
      onboardingComplete: true,
    },
    select: {
      accountType: true,
      onboardingComplete: true,
    },
  });

  return { user, orgId };
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let requestJson: unknown;
    try {
      requestJson = await req.json();
    } catch (error) {
      if (isAbortedRequestError(error)) {
        return NextResponse.json({ ok: false, error: "Request was aborted" }, { status: 400 });
      }
      throw error;
    }

    const bodyResult = onboardingBodySchema.safeParse(requestJson);
    if (!bodyResult.success) {
      return NextResponse.json({ error: "Invalid onboarding payload" }, { status: 400 });
    }

    const {
      accountType,
      organizationName,
      contactEmail,
      industry,
      website,
      description,
      agentName,
      agentPersonality,
    } = bodyResult.data;

    if (accountType === "organization") {
      if (!organizationName) {
        return NextResponse.json({ error: "Organisation name is required" }, { status: 400 });
      }
      if (!contactEmail) {
        return NextResponse.json({ error: "Contact email is required" }, { status: 400 });
      }
      if (isPersonalEmail(contactEmail)) {
        return NextResponse.json(
          { error: "Organisation accounts require a work/business email." },
          { status: 400 }
        );
      }
      if (!agentName) {
        return NextResponse.json({ error: "Agent name is required" }, { status: 400 });
      }
    }

    let updatedUser: { accountType: string; onboardingComplete: boolean };
    let createdOrgId: string | undefined;

    if (accountType === "organization") {
      const { randomUUID } = await import("crypto");
      const apiKey = `vela_${randomUUID().replace(/-/g, "")}`;

      const orgArgs = {
        userId: session.user.id,
        organizationName: organizationName!,
        contactEmail: contactEmail!,
        industry: industry || undefined,
        website: website || undefined,
        description: description || undefined,
        agentName: agentName!,
        agentPersonality: agentPersonality || undefined,
        apiKey,
      };

      let result: OrgOnboardingResult;
      try {
        result = await withTransientRetry(() =>
          prisma.$transaction(
            async (tx) => {
              const existingOrg = await tx.organization.findFirst({
                where: { ownerId: session.user.id },
                select: { id: true },
              });

              const user = await tx.user.update({
                where: { id: session.user.id },
                data: {
                  accountType: "organization",
                  onboardingComplete: true,
                },
                select: {
                  accountType: true,
                  onboardingComplete: true,
                },
              });

              if (existingOrg) {
                return { user, orgId: existingOrg.id };
              }

              const org = await tx.organization.create({
                data: {
                  name: orgArgs.organizationName,
                  contactEmail: orgArgs.contactEmail,
                  industry: orgArgs.industry,
                  website: orgArgs.website,
                  description: orgArgs.description,
                  agentName: orgArgs.agentName,
                  agentPersonality: orgArgs.agentPersonality,
                  apiKey: orgArgs.apiKey,
                  ownerId: session.user.id,
                },
                select: { id: true },
              });
              return { user, orgId: org.id };
            },
            { maxWait: 10_000, timeout: 15_000 }
          )
        );
      } catch (error) {
        if (!isTransactionStartTimeout(error)) throw error;
        // Fallback when the DB cannot start an interactive transaction quickly.
        result = await withTransientRetry(() =>
          completeOrgOnboardingWithoutTransaction(orgArgs)
        );
      }

      updatedUser = result.user;
      createdOrgId = result.orgId;
    } else {
      updatedUser = await withTransientRetry(() =>
        prisma.user.update({
        where: { id: session.user.id },
        data: {
          accountType: "personal",
          onboardingComplete: true,
        },
        select: {
          accountType: true,
          onboardingComplete: true,
        },
      }));
    }

    // Send welcome notification
    if (accountType === "personal") {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          type:   "info",
          scope:  "personal",
          title:  "Welcome to Velamini!",
          body:   "Your personal AI is ready. Go to the Train tab to teach it about yourself, then share your public link with the world.",
        },
      }).catch(() => {});
    } else if (createdOrgId) {
      await prisma.notification.create({
        data: {
          userId:         session.user.id,
          organizationId: createdOrgId,
          type:   "info",
          scope:  "org",
          title:  `Welcome to Velamini for Business!`,
          body:   `Your organisation "${organizationName}" is live on the Free plan. Train your AI agent in the Agent tab and embed it anywhere with the API.`,
        },
      }).catch(() => {});
    }

    return NextResponse.json({ 
      ok: true, 
      user: {
        accountType: updatedUser.accountType,
        onboardingComplete: updatedUser.onboardingComplete,
      }
    });
  } catch (error: unknown) {
    if (isAbortedRequestError(error)) {
      return NextResponse.json({ ok: false, error: "Request was aborted" }, { status: 400 });
    }
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

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  let userId: string | undefined = session.user.id;
  let user: { id: string; accountType: string; status: string } | null = null;

  if (!userId && session.user.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, accountType: true, status: true },
    });
    userId = user?.id;
  } else if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, accountType: true, status: true },
    });
  }

  if (!userId || !user) {
    redirect("/auth/signin");
  }

  if (user.accountType === "organization") {
    redirect("/Dashboard/organizations");
  }

  const usageData = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      personalPlanType:        true,
      personalMonthlyMsgCount: true,
      personalMonthlyMsgLimit: true,
    },
  });

  const initialUsage = {
    planType: usageData?.personalPlanType        ?? "free",
    msgCount: usageData?.personalMonthlyMsgCount ?? 0,
    msgLimit: usageData?.personalMonthlyMsgLimit ?? 200,
  };

  const knowledgeBase = await prisma.knowledgeBase.findUnique({
    where: { userId },
  });

  const hasIdentity   = !!(knowledgeBase?.fullName || knowledgeBase?.birthDate || knowledgeBase?.bio);
  const hasEducation  = !!knowledgeBase?.education;
  const hasExperience = !!knowledgeBase?.experience;
  const hasSkills     = !!knowledgeBase?.skills;
  const hasProjects   = !!knowledgeBase?.projects;

  const completedSections = [hasIdentity, hasEducation, hasExperience, hasSkills, hasProjects]
    .filter(Boolean).length;

  const stats = {
    trainingEntries:   knowledgeBase ? 1 : 0,
    qaPairs:           0,
    personalityTraits: hasIdentity ? 1 : 0,
    knowledgeItems:    completedSections,
  };

  const serializedKnowledgeBase = knowledgeBase
    ? {
        ...knowledgeBase,
        createdAt:     knowledgeBase.createdAt.toISOString(),
        updatedAt:     knowledgeBase.updatedAt.toISOString(),
        lastTrainedAt: knowledgeBase.lastTrainedAt?.toISOString() || null,
      }
    : null;

  const userWithStatus = { ...session.user, status: user.status ?? "active" };

  return (
    <DashboardWrapper
      user={userWithStatus}
      stats={stats}
      knowledgeBase={serializedKnowledgeBase}
      initialUsage={initialUsage}
    />
  );
}
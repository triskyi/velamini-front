import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardWrapper from "@/components/dashboard/DashboardWrapper";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get user ID - fallback to email lookup if ID is missing
  let userId: string | undefined = session.user.id;
  let user = null;
  
  if (!userId && session.user.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, accountType: true, onboardingComplete: true },
    });
    userId = user?.id;
  } else if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, accountType: true, onboardingComplete: true },
    });
  }

  if (!userId || !user) {
    redirect("/auth/signin");
  }

  // Check if user needs to complete onboarding
  if (!user.onboardingComplete) {
    redirect("/onboarding");
  }

  // Redirect organization accounts to their dashboard
  if (user.accountType === "organization") {
    redirect("/Dashboard/organizations");
  }

  // Check if user has knowledge base
  const knowledgeBase = await prisma.knowledgeBase.findUnique({
    where: { userId },
  });

  // Calculate completion based on structured fields
  const hasIdentity = !!(knowledgeBase?.fullName || knowledgeBase?.birthDate || knowledgeBase?.bio);
  const hasEducation = !!knowledgeBase?.education;
  const hasExperience = !!knowledgeBase?.experience;
  const hasSkills = !!knowledgeBase?.skills;
  const hasProjects = !!knowledgeBase?.projects;
  
  const completedSections = [hasIdentity, hasEducation, hasExperience, hasSkills, hasProjects].filter(Boolean).length;

  const stats = {
    trainingEntries: knowledgeBase ? 1 : 0,
    qaPairs: 0, // Reserved for future chat training
    personalityTraits: hasIdentity ? 1 : 0,
    knowledgeItems: completedSections,
  };

  return <DashboardWrapper user={session.user} stats={stats} />;
}

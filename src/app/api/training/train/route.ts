import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get userId with fallback
    let userId: string | undefined = session.user.id;
    if (!userId && session.user.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "User ID not found" },
        { status: 400 }
      );
    }

    // Fetch the knowledge base
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { userId },
    });

    if (!knowledgeBase) {
      return NextResponse.json(
        { ok: false, error: "No knowledge base found. Please complete your training first." },
        { status: 404 }
      );
    }

    // Format the knowledge base into a structured prompt
    const trainedPrompt = formatKnowledgeBasePrompt(knowledgeBase);

    // Update the knowledge base with training status
    await prisma.knowledgeBase.update({
      where: { userId },
      data: {
        isModelTrained: true,
        trainedPrompt,
        lastTrainedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Virtual self trained successfully!",
      trainedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Training error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to train model" },
      { status: 500 }
    );
  }
}

// Helper function to format knowledge base into a structured prompt
function formatKnowledgeBasePrompt(kb: any): string {
  const sections: string[] = [];

  // Identity Section
  if (kb.fullName || kb.birthDate || kb.birthPlace || kb.currentLocation) {
    sections.push("# Identity");
    if (kb.fullName) sections.push(`Name: ${kb.fullName}`);
    if (kb.birthDate) sections.push(`Birth: ${kb.birthDate}`);
    if (kb.birthPlace) sections.push(`Birth Place: ${kb.birthPlace}`);
    if (kb.currentLocation) sections.push(`Location: ${kb.currentLocation}`);
    if (kb.languages) sections.push(`Languages: ${kb.languages}`);
    if (kb.bio) sections.push(`Bio: ${kb.bio}`);
    if (kb.relationshipStatus) sections.push(`Relationship Status: ${kb.relationshipStatus}`);
    if (kb.hobbies) sections.push(`Hobbies: ${kb.hobbies}`);
    if (kb.favoriteFood) sections.push(`Favorite Food: ${kb.favoriteFood}`);
    sections.push("");
  }

  // Education Section
  if (kb.education) {
    sections.push("# Education");
    sections.push(kb.education);
    sections.push("");
  }

  // Experience Section
  if (kb.experience) {
    sections.push("# Experience");
    sections.push(kb.experience);
    sections.push("");
  }

  // Skills Section
  if (kb.skills) {
    sections.push("# Skills");
    sections.push(kb.skills);
    sections.push("");
  }

  // Projects Section
  if (kb.projects) {
    sections.push("# Projects");
    sections.push(kb.projects);
    sections.push("");
  }

  // Awards Section
  if (kb.awards) {
    sections.push("# Awards");
    sections.push(kb.awards);
    sections.push("");
  }

  // Social Links Section
  if (kb.socialLinks) {
    sections.push("# Social Links");
    sections.push(kb.socialLinks);
    sections.push("");
  }

  // Social Updates Section
  if (kb.socialUpdates) {
    sections.push("# Social (Updates)");
    sections.push(kb.socialUpdates);
    sections.push("");
  }

  return sections.join("\n");
}

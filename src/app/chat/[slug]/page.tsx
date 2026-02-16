import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SharedChatClient from "@/components/SharedChatClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SharedChatPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch the virtual self by share slug
  const knowledgeBase = await prisma.knowledgeBase.findUnique({
    where: { shareSlug: slug },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
    },
  });

  if (!knowledgeBase || !knowledgeBase.isPubliclyShared || !knowledgeBase.isModelTrained) {
    notFound();
  }

  // Determine if this is a personal or organization virtual self
  const isOrganization = !!knowledgeBase.organizationId;
  const entityId = isOrganization ? knowledgeBase.organizationId! : knowledgeBase.userId!;
  const entityName = isOrganization 
    ? (knowledgeBase.organization?.displayName || knowledgeBase.organization?.name || "Organization")
    : (knowledgeBase.user?.name || "User");

  // Increment view count
  await prisma.knowledgeBase.update({
    where: { shareSlug: slug },
    data: {
      shareViews: {
        increment: 1,
      },
    },
  });

  return (
    <SharedChatClient
      virtualSelf={{
        id: entityId,
        name: entityName,
        image: knowledgeBase.user?.image,
        slug: slug,
      }}
    />
  );
}

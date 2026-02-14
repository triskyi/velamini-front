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
    },
  });

  if (!knowledgeBase || !knowledgeBase.isPubliclyShared || !knowledgeBase.isModelTrained) {
    notFound();
  }

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
        id: knowledgeBase.userId,
        name: knowledgeBase.user.name || "User",
        image: knowledgeBase.user.image,
        slug: slug,
      }}
    />
  );
}

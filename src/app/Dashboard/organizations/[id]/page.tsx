import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OrgWrapper from "@/components/organization/wrapper";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const organization = await prisma.organization.findFirst({
    where: { id, ownerId: session.user.id },
    include: {
      knowledgeBase: true,
      _count: { select: { chats: true } },
    },
  });

  if (!organization) {
    redirect("/Dashboard/organizations");
  }

  const [conversationCount, messageCount, recentChats] = await Promise.all([
    prisma.chat.count({ where: { organizationId: id } }),
    prisma.message.count({ where: { chat: { organizationId: id }, role: "user" } }),
    prisma.chat.findMany({
      where: { organizationId: id },
      include: {
        messages: { where: { role: "user" }, orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { messages: { where: { role: "user" } } } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  const usagePercentage =
    organization.monthlyMessageLimit > 0
      ? Math.round((organization.monthlyMessageCount / organization.monthlyMessageLimit) * 100)
      : 0;

  const stats = {
    totalConversations: conversationCount,
    totalMessages: messageCount,
    monthlyMessageCount: organization.monthlyMessageCount,
    monthlyMessageLimit: organization.monthlyMessageLimit,
    usagePercentage,
    recentConversations: recentChats.map((chat) => ({
      id: chat.id,
      userId: chat.userId ?? "",
      lastMessage: chat.messages[0]?.content || "No messages",
      lastMessageAt: (chat.messages[0]?.createdAt ?? chat.createdAt).toISOString(),
      messageCount: chat._count.messages,
    })),
  };

  // Serialize org dates for the client component
  const serializedOrg = {
    ...organization,
    knowledgeBase: organization.knowledgeBase
      ? {
          ...organization.knowledgeBase,
          createdAt: organization.knowledgeBase.createdAt.toISOString(),
          updatedAt: organization.knowledgeBase.updatedAt.toISOString(),
          lastTrainedAt: organization.knowledgeBase.lastTrainedAt?.toISOString() ?? null,
        }
      : null,
  };

  return (
    <OrgWrapper
      orgId={id}
      initialOrg={serializedOrg as any}
      initialStats={stats}
    />
  );
}
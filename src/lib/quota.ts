import { prisma } from "@/lib/prisma";

export type QuotaResult =
  | { allowed: true;  remaining: number; orgId: string }
  | { allowed: false; reason: "limit_reached" | "org_inactive" };

/**
 * Check whether an organisation has messages remaining this month.
 * Call this AFTER key validation, BEFORE the DeepSeek request.
 */
export async function checkQuota(orgId: string): Promise<QuotaResult> {
  const org = await prisma.organization.findUnique({
    where:  { id: orgId },
    select: { isActive: true, monthlyMessageCount: true, monthlyMessageLimit: true },
  });

  if (!org || !org.isActive) {
    return { allowed: false, reason: "org_inactive" };
  }

  if (org.monthlyMessageCount >= org.monthlyMessageLimit) {
    return { allowed: false, reason: "limit_reached" };
  }

  return {
    allowed:   true,
    remaining: org.monthlyMessageLimit - org.monthlyMessageCount,
    orgId,
  };
}

import { prisma } from "@/lib/prisma";

const ALLOW_SIGNUPS_KEY = "allowSignups";

export async function areSignupsAllowed(): Promise<boolean> {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: ALLOW_SIGNUPS_KEY },
      select: { value: true },
    });

    if (!setting) return true;
    return setting.value !== "false";
  } catch {
    // Fail open if settings cannot be read so transient DB issues do not block auth.
    return true;
  }
}

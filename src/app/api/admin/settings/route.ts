import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { setMaintenanceCache } from "@/lib/maintenance-cache";
import type { Session } from "next-auth";

const DEFAULTS: Record<string, string> = {
  allowSignups:       "true",
  requireEmailVerify: "true",
  maintenanceMode:    "false",
  aiEnabled:          "true",
  moderationAI:       "true",
  emailNotifs:        "true",
  slackNotifs:        "false",
  publicProfiles:     "true",
  analyticsTracking:  "true",
  rateLimit:          "100",
  maxQaPairs:         "500",
  platformName:       "Velamini",
  supportEmail:       "support@velamini.com",
};

let settingsFallbackCache: Record<string, string> = { ...DEFAULTS };

function isAdmin(session: Session | null): boolean {
  const user = session?.user as ({ isAdminAuth?: boolean } | undefined);
  return user?.isAdminAuth === true;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const rows = await prisma.platformSetting.findMany();
    const saved: Record<string, string> = {};
    for (const r of rows) saved[r.key] = r.value;

    // Merge DB values over defaults and refresh process fallback cache.
    const settings = { ...DEFAULTS, ...saved };
    settingsFallbackCache = settings;
    return NextResponse.json({ ok: true, settings, source: "db" });
  } catch {
    // If DB is unreachable, keep admin UI usable using the latest in-memory snapshot.
    return NextResponse.json({
      ok: true,
      settings: settingsFallbackCache,
      source: "memory-fallback",
    });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as Record<string, unknown>;
  const normalizedBody: Record<string, string> = {};
  for (const [key, val] of Object.entries(body)) {
    normalizedBody[key] = String(val);
  }

  // Update in-memory snapshot first so toggles still work when DB is transiently down.
  settingsFallbackCache = { ...settingsFallbackCache, ...normalizedBody };

  if (typeof normalizedBody.maintenanceMode !== "undefined") {
    setMaintenanceCache(normalizedBody.maintenanceMode === "true", 30_000);
  }

  try {
    // Upsert each key
    await Promise.all(
      Object.entries(normalizedBody).map(([key, val]) =>
        prisma.platformSetting.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val },
        })
      )
    );

    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    // Do not block admin flow for transient DB outages; we already updated memory fallback.
    return NextResponse.json({ ok: true, persisted: false, source: "memory-fallback" });
  }
}

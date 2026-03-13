import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getLastMaintenanceCacheValue,
  getMaintenanceCache,
  setMaintenanceCache,
} from "@/lib/maintenance-cache";

// Public endpoint — no auth required.
// Called by the middleware on every page request to check maintenance mode.
const MAINTENANCE_CACHE_TTL_MS = 30_000;

export async function GET() {
  const now = Date.now();
  const cachedOn = getMaintenanceCache(now);
  if (cachedOn !== null) {
    return NextResponse.json({ on: cachedOn });
  }

  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "maintenanceMode" },
    });
    const on = setting?.value === "true";
    setMaintenanceCache(on, MAINTENANCE_CACHE_TTL_MS);
    return NextResponse.json({ on });
  } catch {
    // If DB is unreachable, use the most recent known value from process memory.
    const fallbackOn = getLastMaintenanceCacheValue();
    if (fallbackOn !== null) {
      return NextResponse.json({ on: fallbackOn });
    }
    return NextResponse.json({ on: false });
  }
}

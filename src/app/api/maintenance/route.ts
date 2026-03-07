import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required.
// Called by the middleware on every page request to check maintenance mode.
export async function GET() {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "maintenanceMode" },
    });
    const on = setting?.value === "true";
    return NextResponse.json({ on });
  } catch {
    // If DB is unreachable, don't block the site
    return NextResponse.json({ on: false });
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

async function getMaintenanceMode(): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/maintenance`, {
      cache: "no-store",
    });
    if (response.ok) {
      const data = await response.json();
      return data.on === true;
    }
  } catch {
    // If we can't reach the API, assume no maintenance
  }
  return false;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Paths that should bypass maintenance mode
  const bypassPaths = [
    "/maintenance",
    "/api/maintenance",
    "/api/admin",
    "/_next",
    "/favicon.ico",
    "/api/auth",
    "/auth",
    "/admin",
  ];

  const shouldBypass = bypassPaths.some((path) => pathname.startsWith(path));

  // Allow bypass paths through
  if (shouldBypass) {
    return NextResponse.next();
  }

  // Check if maintenance mode is enabled
  const isMaintenanceMode = await getMaintenanceMode();

  // If not in maintenance mode, allow through
  if (!isMaintenanceMode) {
    return NextResponse.next();
  }

  // Maintenance mode is ON - check if user is admin
  const sessionToken = request.cookies.get("next-auth.session-token") || 
                      request.cookies.get("__Secure-next-auth.session-token");

  // No session - redirect to maintenance
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // Has session - check if admin
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`, {
      cache: "no-store",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    const sessionData = await sessionResponse.json();

    // If not admin, redirect to maintenance
    if (sessionData?.user?.isAdminAuth !== true) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  } catch {
    // If we can't check session, allow through
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};

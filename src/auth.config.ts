import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

const MAINTENANCE_FETCH_TIMEOUT_MS = 5000;
const MAINTENANCE_CACHE_TTL_MS = 10_000;

let maintenanceCache: { on: boolean; expiresAt: number } | null = null;

async function readMaintenanceMode(origin: string): Promise<boolean> {
  const now = Date.now();
  if (maintenanceCache && maintenanceCache.expiresAt > now) {
    return maintenanceCache.on;
  }

  try {
    const res = await fetch(`${origin}/api/maintenance`, {
      cache: "no-store",
      signal: AbortSignal.timeout(MAINTENANCE_FETCH_TIMEOUT_MS),
    });

    if (!res.ok) {
      return maintenanceCache?.on ?? false;
    }

    const data = await res.json() as { on?: boolean };
    const on = data.on === true;
    maintenanceCache = { on, expiresAt: now + MAINTENANCE_CACHE_TTL_MS };
    return on;
  } catch {
    return maintenanceCache?.on ?? false;
  }
}

function normalizeDashboardPath(pathname: string): string {
  if (pathname === "/dashboard") return "/Dashboard";
  if (pathname.startsWith("/dashboard/")) {
    return `/Dashboard/${pathname.slice("/dashboard/".length)}`;
  }
  return pathname;
}

function getSafeCallbackPath(
  rawCallbackUrl: string | null,
  fallback: string
): string {
  if (!rawCallbackUrl) return fallback;
  if (!rawCallbackUrl.startsWith("/")) return fallback;
  if (rawCallbackUrl.startsWith("//")) return fallback;
  return normalizeDashboardPath(rawCallbackUrl);
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET, // Added this line
  basePath: "/api/auth",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    // Map custom JWT fields into session.user so the middleware's authorized callback
    // can read them. No DB calls here — just pass-through from token.
    async session({ session, token }) {
      const sessionUser = session.user as any;

      if (token.id) sessionUser.id = token.id as string;
      if (token.isAdminAuth) sessionUser.isAdminAuth = token.isAdminAuth as boolean;
      if (token.status) sessionUser.status = token.status as string;
      sessionUser.emailVerified = token.emailVerified ? String(token.emailVerified) : null;
      sessionUser.accountType = token.accountType as string | undefined;
      sessionUser.onboardingComplete = token.onboardingComplete as boolean | undefined;
      return session;
    },

    async authorized({ auth, request: { nextUrl } }) {
      const authUser = auth?.user
      const isLoggedIn  = !!authUser
      const isAdminUser = !!authUser?.isAdminAuth
      const pathname    = nextUrl.pathname
      const isLoggedOutRedirect = nextUrl.searchParams.get("loggedOut") === "1"
      const normalizedPathname = normalizeDashboardPath(pathname)

      if (normalizedPathname !== pathname) {
        const dest = new URL(nextUrl)
        dest.pathname = normalizedPathname
        return Response.redirect(dest)
      }

      const isOnAuth       = pathname.startsWith("/auth")
      const isOnAdminLogin = pathname.startsWith("/admin/auth")
      const isOnMaintenance = pathname === "/maintenance"
      const isOnVerifyEmail = pathname === "/verify-email"
      const isVerified = !!authUser?.emailVerified

      // Maintenance page and admin-auth pages are always accessible
      if (isOnMaintenance) return true
      if (isOnAdminLogin)  return true
      if (isOnVerifyEmail) {
        if (!isLoggedIn) {
          return Response.redirect(new URL("/auth/signin?callbackUrl=/verify-email", nextUrl))
        }
        if (isVerified) {
          const nextPath = getSafeCallbackPath(nextUrl.searchParams.get("next"), "/Dashboard")
          return Response.redirect(new URL(nextPath, nextUrl))
        }
        return true
      }

      // Block banned users from every page (they already can't log in,
      // but this catches anyone banned while already having a valid session)
      if (!isAdminUser && authUser?.status === "banned") {
        return Response.redirect(new URL("/auth/signin?error=banned", nextUrl))
      }

      // Check maintenance mode for non-admin users.
      // Auth pages (/auth/*) are skipped so the admin can still sign in to disable it.
      if (!isAdminUser && !isOnAuth) {
        const maintenanceOn = await readMaintenanceMode(nextUrl.origin);
        if (maintenanceOn) {
          return Response.redirect(new URL("/maintenance", nextUrl))
        }
      }

      // Public routes that don't require authentication
      const isPublicRoute =
        pathname === "/" || pathname === "/chat" || pathname === "/logout"

      const isOnProtected =
        pathname.startsWith("/Dashboard") ||
        pathname.startsWith("/training") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings")

      if (isOnAuth) {
        // Always allow explicit logout redirect pages to render the login form,
        // even if a stale session cookie still exists.
        if (isLoggedOutRedirect) return true

        // /auth/org/* pages are accessible even when logged in — they handle org creation
        // for users who already have a personal account
        if (pathname.startsWith("/auth/org")) return true

        if (isLoggedIn) {
          // Preserve ?create=org so authenticated users can still create an organisation
          const callbackPath = getSafeCallbackPath(
            nextUrl.searchParams.get("callbackUrl"),
            "/Dashboard"
          )
          const dest = new URL(callbackPath, nextUrl)
          // If org creation was requested, pass it through
          if (nextUrl.searchParams.get("create") === "org" && !dest.searchParams.has("create")) {
            dest.searchParams.set("create", "org")
          }
          return Response.redirect(dest)
        }
        return true
      }

      if (isPublicRoute) return true

      if (isOnProtected) {
        if (isLoggedIn) {
          if (!isAdminUser && !isVerified) {
            const dest = new URL("/verify-email", nextUrl)
            const nextValue = pathname + nextUrl.search
            if (nextValue.startsWith("/")) dest.searchParams.set("next", nextValue)
            return Response.redirect(dest)
          }
          return true
        }
        return Response.redirect(
          new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl)
        )
      }

      return true
    },
  },
}

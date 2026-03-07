import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET, // Added this line
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
      if (token.id)          (session.user as any).id          = token.id;
      if (token.isAdminAuth) (session.user as any).isAdminAuth = token.isAdminAuth;
      if (token.status)      (session.user as any).status      = token.status;
      return session;
    },

    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn  = !!auth?.user
      const isAdminUser = !!(auth?.user as any)?.isAdminAuth
      const pathname    = nextUrl.pathname

      const isOnAuth       = pathname.startsWith("/auth")
      const isOnAdminLogin = pathname.startsWith("/admin/auth")
      const isOnMaintenance = pathname === "/maintenance"

      // Maintenance page and admin-auth pages are always accessible
      if (isOnMaintenance) return true
      if (isOnAdminLogin)  return true

      // Block banned users from every page (they already can't log in,
      // but this catches anyone banned while already having a valid session)
      if (!isAdminUser && (auth?.user as any)?.status === "banned") {
        return Response.redirect(new URL("/auth/signin?error=banned", nextUrl))
      }

      // Check maintenance mode for non-admin users.
      // Auth pages (/auth/*) are skipped so the admin can still sign in to disable it.
      if (!isAdminUser && !isOnAuth) {
        try {
          const res  = await fetch(`${nextUrl.origin}/api/maintenance`, { cache: "no-store" })
          const data = await res.json() as { on: boolean }
          if (data.on) {
            return Response.redirect(new URL("/maintenance", nextUrl))
          }
        } catch {
          // If the check fails, allow through — don't block the site
        }
      }

      // Public routes that don't require authentication
      const isPublicRoute =
        pathname === "/" || pathname === "/chat" || pathname === "/logout"

      const isOnProtected =
        pathname.startsWith("/Dashboard") ||
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/training") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings")

      if (isOnAuth) {
        if (isLoggedIn) {
          const callbackUrl = nextUrl.searchParams.get("callbackUrl") || "/Dashboard"
          return Response.redirect(new URL(callbackUrl, nextUrl))
        }
        return true
      }

      if (isPublicRoute) return true

      if (isOnProtected) {
        if (isLoggedIn) return true
        return Response.redirect(
          new URL(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl)
        )
      }

      return true
    },
  },
}

import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig = {
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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAuth = nextUrl.pathname.startsWith("/auth")
      
      // Public routes that don't require authentication
      const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname === "/chat" || nextUrl.pathname === "/logout"
      
      const isOnProtected =
        nextUrl.pathname.startsWith("/Dashboard") ||
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/training") ||
        nextUrl.pathname.startsWith("/profile") ||
        nextUrl.pathname.startsWith("/settings")

      if (isOnAuth) {
        if (isLoggedIn) {
          // Respect callbackUrl if provided, otherwise go to Dashboard
          const callbackUrl = nextUrl.searchParams.get("callbackUrl") || "/Dashboard"
          return Response.redirect(new URL(callbackUrl, nextUrl))
        }
        return true
      }

      // Allow access to public routes without authentication
      if (isPublicRoute) {
        return true
      }

      if (isOnProtected) {
        if (isLoggedIn) return true
        // Redirect to sign in with callback URL
        return Response.redirect(
          new URL(`/auth/signin?callbackUrl=${encodeURIComponent(nextUrl.pathname)}`, nextUrl)
        )
      }

      return true
    },
  },
} satisfies NextAuthConfig

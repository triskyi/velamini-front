import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

export default NextAuth(authConfig).auth

export const config = {
  // Targeted whitelist — only run auth middleware on routes that need it.
  // A broad catch-all pattern intercepts Next.js internal dev-server paths
  // (webpack-hmr, RSC prefetches, _next/*) and causes all pages to 404.
  matcher: [
    // Protected app areas
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
}

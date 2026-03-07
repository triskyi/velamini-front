import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"

const adminCredentialsProvider = Credentials({
  id: "admin-credentials",
  name: "Admin Login",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const email = (credentials?.email as string)?.toLowerCase().trim();
    const password = credentials?.password as string;

    if (!email || !password) return null;

    // Look up user in DB — must have role "admin" and a passwordHash
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "admin" || !user.passwordHash) return null;

    // Verify password with bcrypt
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;

    return { id: user.id, email: user.email, name: user.name, image: user.image };
  },
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  providers: [
    ...authConfig.providers,
    adminCredentialsProvider,
  ],
  callbacks: {
    ...authConfig.callbacks,

    // Block banned users from signing in at all
    async signIn({ user, account }) {
      // Always allow admin credentials through (admins can't be banned)
      if (account?.provider === "admin-credentials") return true;
      if (!user?.email) return false;
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { status: true },
      });
      if (dbUser?.status === "banned") return "/auth/signin?error=banned";
      return true;
    },

    async jwt({ token, user, account }) {
      // When user signs in, add their database ID to the token
      if (user) {
        token.id = user.id;
      }
      // Mark as admin-authenticated only when using admin credentials
      if (account?.provider === "admin-credentials") {
        token.isAdminAuth = true;
      }
      // If token doesn't have ID yet, fetch it from database
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, status: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.status = dbUser.status;
        }
      } else if (token.id) {
        // Re-fetch status on every token refresh so bans take effect immediately
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { status: true },
        });
        token.status = dbUser?.status ?? "active";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      if (token.isAdminAuth) {
        session.user.isAdminAuth = true;
      }
      session.user.status = token.status;
      return session;
    },
  },
})

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"

const TOKEN_DB_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

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

const orgCredentialsProvider = Credentials({
  id: "org-credentials",
  name: "Organisation Login",
  credentials: {
    email:    { label: "Email",    type: "email"    },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const email    = (credentials?.email    as string)?.toLowerCase().trim();
    const password =  credentials?.password as string;
    if (!email || !password) return null;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.accountType !== "organization" || !user.passwordHash) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    return { id: user.id, email: user.email, name: user.name, image: user.image };
  },
});

const userCredentialsProvider = Credentials({
  id: "user-credentials",
  name: "Personal Login",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const email = (credentials?.email as string)?.toLowerCase().trim();
    const password = credentials?.password as string;
    if (!email || !password) return null;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.accountType !== "personal" || !user.passwordHash) return null;
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
    orgCredentialsProvider,
    userCredentialsProvider,
  ],
  callbacks: {
    // Block banned users from signing in at all
    async signIn({ user, account }) {
      // Always allow admin credentials through (admins can't be banned)
      if (account?.provider === "admin-credentials") return true;
      if (!user?.email) return false;
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { status: true },
        });
        if (dbUser?.status === "banned") return "/auth/signin?error=banned";
      } catch {
        // Fail-open for sign-in callback when DB is temporarily unavailable.
        // Session callbacks still enforce auth shape and route guards.
      }
      return true;
    },

    async jwt({ token, user, account, trigger }) {
      const jwtToken = token as typeof token & {
        idLookupAt?: number;
        statusCheckedAt?: number;
      };
      const now = Date.now();
      // When user signs in, add their database ID to the token
      if (user) {
        token.id = user.id;
      }
      // Mark as admin-authenticated only when using admin credentials
      if (account?.provider === "admin-credentials") {
        token.isAdminAuth = true;
      }
      // If token doesn't have ID yet, fetch it from database
      try {
        if (!token.id && token.email) {
          const lastIdLookupAt =
            typeof jwtToken.idLookupAt === "number" ? jwtToken.idLookupAt : 0;
          const shouldLookupId =
            !!user || trigger === "update" || now - lastIdLookupAt >= TOKEN_DB_REFRESH_MS;
          if (!shouldLookupId) return token;

          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, status: true, emailVerified: true, accountType: true, onboardingComplete: true },
          });
          jwtToken.idLookupAt = now;
          if (dbUser) {
            token.id = dbUser.id;
            token.status = dbUser.status;
            token.emailVerified = dbUser.emailVerified ? String(dbUser.emailVerified) : null;
            token.accountType = dbUser.accountType;
            token.onboardingComplete = dbUser.onboardingComplete;
            jwtToken.statusCheckedAt = now;
          }
        } else if (token.id) {
          const lastStatusCheckedAt =
            typeof jwtToken.statusCheckedAt === "number" ? jwtToken.statusCheckedAt : 0;
          const shouldRefreshStatus =
            !!user || trigger === "update" || now - lastStatusCheckedAt >= TOKEN_DB_REFRESH_MS;
          if (!shouldRefreshStatus) return token;

          // Re-fetch status periodically so bans take effect quickly
          // without hitting the DB on every /session request.
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { status: true, emailVerified: true, accountType: true, onboardingComplete: true },
          });
          jwtToken.statusCheckedAt = now;
          if (!dbUser) {
            token.id = undefined;
            token.status = undefined;
            token.emailVerified = undefined;
            token.accountType = undefined;
            token.onboardingComplete = undefined;
          } else {
            token.status = dbUser.status;
            token.emailVerified = dbUser.emailVerified ? String(dbUser.emailVerified) : null;
            token.accountType = dbUser.accountType;
            token.onboardingComplete = dbUser.onboardingComplete;
          }
        }
      } catch {
        // DB outage should not crash session decoding.
        // Keep last known token values until DB recovers.
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
      session.user.status = token.status as string | undefined;
      if (token.emailVerified instanceof Date) {
        session.user.emailVerified = token.emailVerified;
      } else if (typeof token.emailVerified === "string") {
        session.user.emailVerified = new Date(token.emailVerified);
      } else {
        session.user.emailVerified = null;
      }
      session.user.accountType = token.accountType as string | undefined;
      session.user.onboardingComplete = token.onboardingComplete as boolean | undefined;
      return session;
    },
  },
})

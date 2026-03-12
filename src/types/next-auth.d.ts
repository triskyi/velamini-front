import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdminAuth?: boolean;
      status?: string;
      emailVerified?: Date | null;
      accountType?: string;
      onboardingComplete?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isAdminAuth?: boolean;
    status?: string;
    emailVerified?: Date | null;
    accountType?: string;
    onboardingComplete?: boolean;
  }
}

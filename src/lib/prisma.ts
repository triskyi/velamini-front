import { PrismaClient } from "@prisma/client";

/**
 * Singleton pattern for PrismaClient. 
 * Prevents multiple instances in development and works with standard Postgres/Prisma Postgres.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"] as const,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

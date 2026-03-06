import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prismaVelamini: PrismaClient | undefined };

const connectionString = process.env.DATABASE_URL!;

// Strip sslmode from the URL — we pass ssl options explicitly below, which
// avoids the pg v8 "SECURITY WARNING" about 'require' being an alias for verify-full.
function stripSslMode(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.delete("sslmode");
    return u.toString();
  } catch {
    return url;
  }
}

const pool = new Pool({
  connectionString: stripSslMode(connectionString),
  ssl: { rejectUnauthorized: true }, // explicit verify-full — silences pg SSL deprecation warning
});
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prismaVelamini ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaVelamini = prisma;
// Re-export for type safety
export * from "@prisma/client";

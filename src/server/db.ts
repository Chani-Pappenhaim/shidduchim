import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL, max: env.DATABASE_POOL_SIZE });
  // Generous limits so a slow local database or a busy single connection does not abort transactions
  return new PrismaClient({ adapter, transactionOptions: { maxWait: 15_000, timeout: 20_000 } });
}

// Single shared client, reused across hot reloads in development
export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// A single PrismaClient reused across hot reloads (dev) and warm serverless
// invocations (Vercel) — mirrors the globalThis singleton already used by the
// scan job store. Instantiating a client per import would exhaust Neon's
// connection limit.
//
// Prisma 7 runs without a Rust engine, so the runtime connection goes through
// the Neon driver adapter (DATABASE_URL — use the pooled endpoint in prod).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — add it to web/.env (see prisma.config.ts).");
  }

  const adapter = new PrismaNeon({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

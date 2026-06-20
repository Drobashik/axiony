// Quick Neon connectivity check: `npm run db:check`.
// Loads .env via Node's --env-file flag, opens a connection through the Neon
// driver adapter, and prints the Postgres version so you can confirm the
// database is reachable.
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("✗ DATABASE_URL is not set. Run with: node --env-file=.env scripts/db-check.mjs");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
  const [row] = await prisma.$queryRaw`SELECT version()`;
  console.log("✓ Connected to Neon Postgres");
  console.log(" ", row.version);
} catch (error) {
  console.error("✗ Database connection failed:");
  console.error(" ", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

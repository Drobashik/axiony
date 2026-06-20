import { defineConfig, env } from "prisma/config";

// Prisma 7 does NOT auto-load `.env` before evaluating this config file, so we
// load it ourselves with Node's built-in loader. On platforms like Vercel
// there is no `.env` file (env vars are already in the environment), so a
// missing file is ignored.
try {
  process.loadEnvFile();
} catch {
  // no local .env — assume DATABASE_URL/DIRECT_URL are already in process.env
}

// Prisma 7 config. Replaces the `url`/`directUrl` that used to live in the
// datasource block.
//
// Migrations and introspection run over DIRECT_URL (the unpooled Neon
// endpoint). The runtime connection (DATABASE_URL) is handled separately by
// the Neon driver adapter in `src/lib/db.ts`.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrations/introspection use the unpooled DIRECT_URL. Fall back to
    // DATABASE_URL so `prisma generate` on Vercel (which needs no migration
    // URL) doesn't require DIRECT_URL to be set — but still fail loudly if no
    // database URL exists at all.
    url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
  },
});

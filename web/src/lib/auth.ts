import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

// Server-side BetterAuth instance. Sessions are cookie-based; the user,
// session, account and verification rows live in Postgres via the Prisma
// adapter. BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from the
// environment (see .env.local).
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // OAuth providers (Google/GitHub) are added in a later step.
});

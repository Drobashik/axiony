import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db";

const withHttps = (hostOrUrl: string): string => {
  if (/^https?:\/\//.test(hostOrUrl)) return hostOrUrl;
  return `https://${hostOrUrl}`;
};

const productionUrl =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? withHttps(process.env.VERCEL_PROJECT_PRODUCTION_URL)
    : "http://localhost:3000");

const previewAllowedHosts =
  process.env.BETTER_AUTH_ALLOWED_HOSTS?.split(",")
    .map((host) => host.trim())
    .filter(Boolean) ?? (process.env.VERCEL_ENV === "preview" ? ["*.vercel.app"] : []);

const allowedHosts = [new URL(productionUrl).host, ...previewAllowedHosts];

// Server-side BetterAuth instance. Sessions are cookie-based; the user,
// session, account and verification rows live in Postgres via the Prisma
// adapter. Preview deployments resolve their base URL from the current Vercel
// host after it matches the allowed host list.
export const auth = betterAuth({
  baseURL: {
    allowedHosts,
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
    fallback: productionUrl,
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  // OAuth providers (Google/GitHub) are added in a later step.
});

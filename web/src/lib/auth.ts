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

// Social sign-in providers, enabled only when their credentials are present —
// so a missing OAuth app never breaks startup (CI, or before secrets are set).
// Each provider's callback is /api/auth/callback/<provider>.
type SocialProviders = NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]>;

function resolveSocialProviders(): SocialProviders {
  const providers: SocialProviders = {};
  const env = process.env;

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  }
  if (env.GITLAB_CLIENT_ID && env.GITLAB_CLIENT_SECRET) {
    providers.gitlab = {
      clientId: env.GITLAB_CLIENT_ID,
      clientSecret: env.GITLAB_CLIENT_SECRET,
      ...(env.GITLAB_ISSUER ? { issuer: env.GITLAB_ISSUER } : {}),
    };
  }

  return providers;
}

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
  socialProviders: resolveSocialProviders(),
  account: {
    // Link a social sign-in to an existing account with the same email — but
    // only for these providers AND only when that existing account is already
    // email-verified (BetterAuth's requireLocalEmailVerified gate stays on by
    // default). There's no email-verification flow yet, so password accounts
    // won't auto-link to social until one is added.
    accountLinking: {
      trustedProviders: ["google", "github", "gitlab"],
    },
  },
  // Fallback for OAuth failures with no per-flow errorCallbackURL: send them to
  // our login page (?error=<code>) instead of BetterAuth's built-in error page.
  // `signIn.social()` passes errorCallbackURL for the normal sign-in flow.
  onAPIError: {
    errorURL: "/login",
  },
});

import { PLAN_DEFINITIONS, PLAN_ENTITLEMENTS } from "@/lib/billing";
import type { BillingPlan } from "@/lib/billing";
import type { PricingTier } from "./types";

// Marketing-curated copy per plan. The numbers (price, domains, scans) come
// straight from the billing model so this section can never drift from what
// the dashboard actually grants.
interface TierCopy {
  audience: string;
  inherits?: string;
  highlights: readonly string[];
  cta: string;
  href: string;
}

const COPY: Record<BillingPlan, TierCopy> = {
  free: {
    audience: "Prove the workflow on one site.",
    highlights: [
      "Open-source CLI, unlimited local runs",
      "A plain-English fix for every issue",
      "Baseline file — new issues fail CI",
    ],
    cta: "Scan your site free",
    href: "/scan",
  },
  pro: {
    audience: "For solo devs, QA & product.",
    inherits: "Everything in Free, plus",
    highlights: [
      "Scheduled scans with full history",
      "Compare any two runs · email alerts",
      "AI fix suggestions · exportable reports",
    ],
    cta: "Get Pro",
    href: "/signup",
  },
  team: {
    audience: "For product & engineering teams.",
    inherits: "Everything in Pro, plus",
    highlights: [
      "Members, roles & shared baselines",
      "GitHub / GitLab checks + PR comments",
      "Branch baselines · Slack alerts",
    ],
    cta: "Get Team",
    href: "/signup",
  },
};

export const PRICING_TIERS: readonly PricingTier[] = PLAN_DEFINITIONS.map((plan) => ({
  id: plan.id,
  name: plan.name,
  accent: plan.accent,
  featured: plan.featured,
  priceMonthly: plan.priceMonthly,
  priceAnnual: plan.priceAnnual,
  domains: PLAN_ENTITLEMENTS[plan.id].domainLimit,
  scans: PLAN_ENTITLEMENTS[plan.id].monthlyScans,
  ...COPY[plan.id],
}));

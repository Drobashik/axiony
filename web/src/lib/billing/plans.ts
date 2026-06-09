import type { BillingPlan, BillingState, PlanDefinition, PlanEntitlements } from "./types";

export const PLAN_ORDER: Record<BillingPlan, number> = {
  free: 0,
  pro: 1,
  team: 2,
};

export const PLAN_ENTITLEMENTS: Record<BillingPlan, PlanEntitlements> = {
  free: {
    domainLimit: 1,
    monthlyScans: 5,
    issueManagement: false,
    reports: false,
    alerts: false,
    teamWorkspace: false,
  },
  pro: {
    domainLimit: 5,
    monthlyScans: 1000,
    issueManagement: true,
    reports: true,
    alerts: true,
    teamWorkspace: false,
  },
  team: {
    domainLimit: 50,
    monthlyScans: 10000,
    issueManagement: true,
    reports: true,
    alerts: true,
    teamWorkspace: true,
  },
};

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    audience: "For developers proving the workflow.",
    limit: "1 domain project · 5 hosted scans / month",
    cta: "Current plan",
    accent: "green",
    entitlements: PLAN_ENTITLEMENTS.free,
    features: [
      { label: "1 domain project", tier: "free" },
      { label: "5 hosted scans per month", tier: "free" },
      { label: "Plain-English issue explanations", tier: "free" },
      { label: "Read-only scan results", tier: "free" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 19,
    priceAnnual: 190,
    audience: "For solo devs, QA, and product teams.",
    limit: "5 domain projects · 1,000 hosted scans / month",
    cta: "Upgrade to Pro",
    accent: "blue",
    featured: true,
    entitlements: PLAN_ENTITLEMENTS.pro,
    features: [
      { label: "Everything in Free", tier: "free" },
      { label: "5 domain projects", tier: "pro" },
      { label: "1,000 hosted scans per month", tier: "pro" },
      { label: "Save and triage issues", tier: "pro" },
      { label: "Scheduled scans and full history", tier: "pro" },
      { label: "Scan comparison and email alerts", tier: "pro" },
      { label: "Exportable accessibility reports", tier: "pro" },
      { label: "AI fix suggestions for every issue", tier: "pro" },
    ],
  },
  {
    id: "team",
    name: "Team",
    priceMonthly: 79,
    priceAnnual: 790,
    audience: "For product and engineering teams.",
    limit: "50 domains · 10,000 hosted scans / month",
    cta: "Upgrade to Team",
    accent: "violet",
    entitlements: PLAN_ENTITLEMENTS.team,
    features: [
      { label: "Everything in Pro", tier: "pro" },
      { label: "50 tracked domains", tier: "team" },
      { label: "10,000 hosted scans per month", tier: "team" },
      { label: "Team members, roles, and shared ownership", tier: "team" },
      { label: "GitHub and GitLab status checks", tier: "team" },
      { label: "PR/MR comments and branch baselines", tier: "team" },
      { label: "Slack alerts and team routing", tier: "team" },
    ],
  },
];

export const planDefinition = (plan: BillingPlan): PlanDefinition =>
  PLAN_DEFINITIONS.find((definition) => definition.id === plan) ?? PLAN_DEFINITIONS[0];

export const canAccessPlan = (current: BillingPlan, required: BillingPlan): boolean =>
  PLAN_ORDER[current] >= PLAN_ORDER[required];

export const entitlementsForPlan = (plan: BillingPlan): PlanEntitlements => PLAN_ENTITLEMENTS[plan];

export const formatPlanPrice = (plan: BillingPlan, cycle: "monthly" | "annual"): string => {
  const definition = planDefinition(plan);
  const price = cycle === "annual" ? definition.priceAnnual : definition.priceMonthly;
  if (price === 0) return "$0";
  return `$${price}`;
};

export const remainingScans = (billing: BillingState): number =>
  Math.max(0, entitlementsForPlan(billing.plan).monthlyScans - billing.usage.scansUsed);

export const canManageIssues = (billing: BillingState): boolean =>
  entitlementsForPlan(billing.plan).issueManagement;

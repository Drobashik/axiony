import type { PricingTier } from "./types";

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    audience: "For developers who want local checks.",
    limit: "Unlimited local · 5 hosted / month",
    features: [
      "Open-source CLI",
      "Local reports + baseline file",
      "Plain-English explanations",
      "Hosted scans to try the cloud",
    ],
    cta: "Start free",
    accent: "green",
  },
  {
    name: "Pro",
    price: "$19",
    period: "/ month",
    audience: "For solo devs, QA & product teams.",
    limit: "Up to 1,000 hosted scans / month",
    features: [
      "Hosted scanner + dashboard",
      "Scheduled scans & full history",
      "Scan comparison + email alerts",
      "AI fix suggestions",
      "Exportable reports",
    ],
    cta: "Join the waitlist",
    featured: true,
    planned: true,
    accent: "blue",
  },
  {
    name: "Team",
    price: "$79",
    period: "/ month",
    audience: "For product & engineering teams.",
    limit: "Higher scan limits",
    inherits: "Everything in Pro, plus",
    features: [
      "GitHub & GitLab + CI checks",
      "PR / MR + AI comments",
      "Shared baselines & branch tracking",
      "Members, roles & Slack alerts",
    ],
    cta: "Join the waitlist",
    planned: true,
    accent: "violet",
  },
];

import { AccentColor } from "@/types";

// =====================================================================
// Home page data
// ---------------------------------------------------------------------
// Static content extracted from JSX so the components stay focused on
// rendering, not on holding copy.
// =====================================================================

export type ProblemDemo = "contrast" | "screenReader" | "keyboard" | "color";

export interface ProblemItem {
  number: string;
  /** Visceral, second-person tab title. */
  title: string;
  /** One-line summary shown under the tab title. */
  description: string;
  /** Engaging prompt shown above the interactive demo. */
  headline: string;
  /** Spec reference surfaced in the demo (axe rule id or WCAG criterion). */
  spec: string;
  /** Which interactive demo this tab renders. */
  demo: ProblemDemo;
}

export const PROBLEMS: readonly ProblemItem[] = [
  {
    number: "01",
    title: "Text you can barely read",
    description:
      "Low-contrast text is the single most common accessibility failure on the web.",
    headline: "Can you actually read this?",
    spec: "color-contrast",
    demo: "contrast",
  },
  {
    number: "02",
    title: "Buttons that say nothing",
    description:
      "Icon-only controls that a screen reader can only announce as 'button, button, button.'",
    headline: "What does a screen reader hear?",
    spec: "button-name",
    demo: "screenReader",
  },
  {
    number: "03",
    title: "Things you can't reach without a mouse",
    description:
      "Custom controls that keyboard users tab straight past and can never operate.",
    headline: "Reach 'Pay' using only the keyboard.",
    spec: "focus-order",
    demo: "keyboard",
  },
  {
    number: "04",
    title: "Meaning hidden in colour",
    description:
      "Status shown only through red and green disappears for colour-blind users.",
    headline: "Which of these services are down?",
    spec: "WCAG 1.4.1",
    demo: "color",
  },
];

export interface SolutionLayer {
  /** Plan the layer belongs to. */
  tier: "Free" | "Pro" | "Team";
  name: string;
  /** Who the plan is for. */
  audience: string;
  /** Scan-quota highlight. */
  limit: string;
  /** Key capabilities shown on the card. */
  points: readonly string[];
  /** Optional "Everything in Pro" style lead-in. */
  inherits?: string;
  /** Optional command shown for the CLI layer. */
  command?: string;
  accent: AccentColor;
}

export const SOLUTION_LAYERS: readonly SolutionLayer[] = [
  {
    tier: "Free",
    name: "Axiony CLI",
    audience: "For developers who want local accessibility checks.",
    limit: "5 web scans / month",
    command: "axiony scan localhost:3000",
    points: [
      "CLI with local reports",
      "Baseline file to track from",
      "Plain-English issue explanations",
      "Hosted scans to try the cloud",
    ],
    accent: "green",
  },
  {
    tier: "Pro",
    name: "Web Scanner + Dashboard",
    audience: "For individuals and small projects that need monitoring.",
    limit: "Up to 1,000 scans / month",
    points: [
      "Hosted scanner across multiple projects",
      "Scheduled scans with full history",
      "Compare any two runs · email alerts",
      "AI fix suggestions for every issue",
      "Exportable reports",
    ],
    accent: "blue",
  },
  {
    tier: "Team",
    name: "Team workspace",
    audience: "For teams that want accessibility inside their workflow.",
    limit: "Higher scan limits",
    inherits: "Everything in Pro, plus",
    points: [
      "GitHub & GitLab integrations",
      "CI/CD status checks + PR / MR comments",
      "AI comments right in the pull request",
      "Shared baselines & branch tracking",
      "Team members, roles & Slack alerts",
    ],
    accent: "violet",
  },
];

/**
 * Honest credibility strip — the tooling and standards Axiony is built
 * on, instead of borrowed customer logos.
 */
export const BUILT_WITH = [
  "axe-core",
  "Playwright",
  "WCAG 2.2",
  "GitHub Actions",
  "GitLab CI",
  "MIT licensed",
] as const;

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  /** Who the tier is for. */
  audience: string;
  /** Scan-quota highlight. */
  limit: string;
  features: readonly string[];
  /** Optional "Everything in Pro" lead-in. */
  inherits?: string;
  cta: string;
  /** Highlights the recommended tier. */
  featured?: boolean;
  /** Marks tiers that aren't billable yet. */
  planned?: boolean;
  accent: AccentColor;
}

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    audience: "For developers who want local checks.",
    limit: "5 web scans / month",
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
    audience: "For solo devs & small projects.",
    limit: "Up to 1,000 scans / month",
    features: [
      "Hosted scanner + dashboard",
      "Scheduled scans & full history",
      "Scan comparison + email alerts",
      "AI fix suggestions",
      "Exportable reports",
    ],
    cta: "Start Pro",
    featured: true,
    planned: true,
    accent: "blue",
  },
  {
    name: "Team",
    price: "$79",
    period: "/ month",
    audience: "For teams shipping together.",
    limit: "Higher scan limits",
    inherits: "Everything in Pro, plus",
    features: [
      "GitHub & GitLab + CI checks",
      "PR / MR + AI comments",
      "Shared baselines & branch tracking",
      "Members, roles & Slack alerts",
    ],
    cta: "Start Team",
    planned: true,
    accent: "violet",
  },
];

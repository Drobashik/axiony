import type { SolutionLayer, WorkflowStep } from "./types";

export const SOLUTION_LAYERS: readonly SolutionLayer[] = [
  {
    tier: "Free",
    name: "Axiony CLI",
    audience: "For developers who want local accessibility checks.",
    limit: "Unlimited local · 5 hosted / month",
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
    audience: "For solo devs, QA, and product teams that need visibility.",
    limit: "Up to 1,000 hosted scans / month",
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
    audience: "For product & engineering teams shipping together.",
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

export const LAYER_STEPS = ["Catch it", "See it", "Prevent it"] as const;

export const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    key: "scan",
    n: "01",
    label: "First scan",
    tag: "CLI · local & CI",
    title: "Start from where your product is today.",
    detail:
      "Your first scan records every existing issue as a baseline — your known accessibility debt. There's nothing to fix on day one, and nothing blocking your releases.",
    roleLabel: "Developers",
    roleText: "run it locally or in CI — no account needed.",
    points: [78, 78, 78],
    statusKind: "idle",
    statusText: "Baseline created · 47 existing issues tracked as known debt.",
    stats: { tracked: 47, flagged: 0, merged: 0 },
  },
  {
    key: "pr",
    n: "02",
    label: "New PR",
    tag: "CI · pull request",
    title: "Catch new regressions before they ship.",
    detail:
      "A new pull request introduces 2 issues that aren't in your baseline. Axiony flags them in CI and comments on the PR, so they're caught in review — and can block merge when set as a required check.",
    roleLabel: "QA & reviewers",
    roleText: "see exactly what changed, right in the pull request.",
    points: [78, 78, 78],
    statusKind: "block",
    statusText: "2 new regressions flagged on PR #1843 · caught before merge.",
    stats: { tracked: 47, flagged: 2, merged: 0 },
  },
  {
    key: "improve",
    n: "03",
    label: "Fix & improve",
    tag: "Cloud · dashboard",
    title: "Improve a little with every release.",
    detail:
      "The team fixes the regressions and chips away at the backlog. The baseline moves up to the new bar, and the dashboard shows the score trending up over time.",
    roleLabel: "Product & stakeholders",
    roleText: "watch the score trend up — no audit required.",
    points: [78, 81, 84, 87, 90],
    statusKind: "merge",
    statusText: "Baseline updated · score up to 90 and trending up.",
    stats: { tracked: 41, flagged: 0, merged: 6 },
  },
];

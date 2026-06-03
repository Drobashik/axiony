import type { SolutionLayer } from "./types";

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

export const LAYER_STEPS = ["Catch it", "Cover it", "Never regress"] as const;

export const INITIAL_POINTS = [66, 72, 78, 85, 90];

export const MAX_POINTS = 9;

import type { AuthCopy, AuthMode, OAuthProvider } from "./types";

/**
 * Value-panel copy shown beside each form. The aim is that by the time a
 * user finishes the form they understand *why* the account exists: to save
 * a scan, lock a baseline, watch the score, and bring the team into one
 * accessibility workflow.
 */
export const AUTH_COPY: Record<AuthMode, AuthCopy> = {
  signup: {
    eyebrow: "Create your workspace",
    title: "Turn one scan into a workflow",
    subtitle:
      "Axiony saves every scan, locks a baseline, and watches each pull request — so accessibility stops regressing instead of piling up.",
    points: [
      {
        icon: "baseline",
        title: "Lock a baseline",
        desc: "Freeze today's issues as tracked debt and block new ones from merging.",
      },
      {
        icon: "trend",
        title: "Track your score",
        desc: "Watch the accessibility score trend across every scan and project.",
      },
      {
        icon: "git",
        title: "Guard pull requests",
        desc: "Connect GitHub & GitLab to catch regressions before they ship.",
      },
      {
        icon: "spark",
        title: "AI fix suggestions",
        desc: "Get plain-English fixes and ready-to-paste code for every issue.",
      },
    ],
    trust: ["No credit card", "WCAG 2.2", "SOC 2 Ready"],
  },
  login: {
    eyebrow: "Welcome back",
    title: "Pick up where you left off",
    subtitle:
      "Your baselines, scan history, and team workflow are right where you left them — sign in to keep your accessibility score moving.",
    points: [
      {
        icon: "baseline",
        title: "Your baseline is held",
        desc: "Tracked debt and new-issue protection stay locked between visits.",
      },
      {
        icon: "trend",
        title: "See what moved",
        desc: "Review score changes and fresh scans since you were last here.",
      },
      {
        icon: "team",
        title: "Team activity",
        desc: "Catch up on what your team scanned, fixed, and merged.",
      },
    ],
    trust: ["WCAG 2.2", "SOC 2 Ready", "SSO available"],
  },
};

export const OAUTH_PROVIDERS: OAuthProvider[] = [
  { id: "google", label: "Google", featured: true },
  { id: "github", label: "GitHub" },
  { id: "gitlab", label: "GitLab" },
];

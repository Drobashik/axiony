import type { StepDef } from "./types";

export const STEPS: readonly StepDef[] = [
  {
    key: "site",
    n: "01",
    title: "Scan the whole site",
    tag: "Cloud · Pro",
    accent: "blue",
    caption:
      "Axiony Cloud scans your whole site on a schedule, keeps full history so you can compare any two runs, emails alerts on regressions — and suggests an AI fix for every issue.",
  },
  {
    key: "team",
    n: "02",
    title: "Roll out to the team",
    tag: "Cloud · Team",
    accent: "violet",
    caption:
      "One baseline, shared across every repo and branch. Axiony blocks new issues right in the pull request, suggests the fix, and pings the owner in Slack — so the whole team's score only goes up. Watch a week go by:",
  },
];

export const STEP_MS = 5600;

export const HISTORY = [
  { when: "Today · 09:14", trigger: "on deploy", score: 92, delta: "+2", dir: "up" },
  { when: "Yesterday", trigger: "scheduled", score: 90, delta: "0", dir: "flat" },
  { when: "Sun · 02:00", trigger: "scheduled", score: 90, delta: "−1", dir: "down" },
  { when: "Fri · 14:20", trigger: "manual", score: 91, delta: "+3", dir: "up" },
] as const;

export const STORED = [
  {
    sev: "critical",
    rule: "color-contrast",
    where: ".cta-banner",
    status: "Open",
    tone: "open",
    ai: true,
  },
  {
    sev: "serious",
    rule: "link-name",
    where: "footer nav",
    status: "Assigned",
    tone: "assigned",
    ai: true,
  },
  {
    sev: "moderate",
    rule: "heading-order",
    where: "/pricing",
    status: "Snoozed",
    tone: "snoozed",
    ai: false,
  },
] as const;

// ── Step 3 · Shared team baseline ────────────────────────────────────
// The team workspace, alive: three repos on one baseline, members with
// roles, and a week of real activity (a blocked PR, an AI fix, a new
// hire, a clean MR). Every score ratchets up — hand-tuned, same story
// every play. See TeamViz.

import type { TeamEvent, TeamMember, TeamRepo } from "./types";

export const TEAM_REPOS: readonly TeamRepo[] = [
  { name: "acme/web", branches: 4, from: 74, to: 82 },
  { name: "acme/app", branches: 3, from: 80, to: 85 },
  { name: "acme/docs", branches: 2, from: 69, to: 78 },
];

// Sofia is hired mid-week — she's the one the "joined" event reveals.
export const TEAM_MEMBERS: readonly TeamMember[] = [
  { initials: "MK", name: "Maria", role: "owner" },
  { initials: "DV", name: "Dmytro", role: "admin" },
  { initials: "LP", name: "Lev", role: "dev" },
  { initials: "SO", name: "Sofia", role: "dev" },
];

export const TEAM_EVENTS: readonly TeamEvent[] = [
  {
    actor: "MK",
    repo: "acme/web",
    ref: "PR #128",
    text: "Add checkout banner",
    detail: "axiony · 2 new issues — merge blocked",
    kind: "blocked",
    slack: "#a11y",
  },
  {
    actor: "DV",
    repo: "acme/web",
    ref: "PR #128",
    text: "Applied AI fix · color-contrast",
    detail: "resolved · merged to main — web ↑",
    kind: "fixed",
  },
  {
    actor: "SO",
    repo: "workspace",
    ref: "+ member",
    text: "Sofia joined as dev",
    detail: "shared baseline applied to all 3 repos",
    kind: "joined",
    slack: "#general",
  },
  {
    actor: "LP",
    repo: "acme/app",
    ref: "MR !54",
    text: "feat/onboarding",
    detail: "checked vs shared baseline · 0 new — clean",
    kind: "clean",
  },
];

// The headline number: average team score before → after the week.
export const TEAM_SCORE_FROM = 74;
export const TEAM_SCORE_TO = 82;

// Delay between feed events; the whole story fits inside one auto-play turn.
export const TEAM_STEP_MS = 1000;

import type { StepDef } from "./types";
import type {
  WorkflowActivity,
  WorkflowColumn,
  WorkflowMetric,
  WorkflowPipelineItem,
} from "./types";

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

// ── New landing workflow snapshot ───────────────────────────────────
export const WORKFLOW_PIPELINE: readonly WorkflowPipelineItem[] = [
  {
    label: "CLI",
    title: "Scan anywhere",
    detail: "Run the CLI locally, in GitHub Actions, or in a GitLab pipeline.",
    meta: "$ axiony scan acme.com",
    accent: "green",
  },
  {
    label: "Cloud",
    title: "Create the baseline",
    detail: "Old issues become tracked debt. New regressions become work.",
    meta: "92 score · 17 open",
    accent: "blue",
  },
  {
    label: "Team",
    title: "Ship through the board",
    detail: "AI fixes, PR checks, and kanban status keep the fix moving.",
    meta: "GitHub · GitLab",
    accent: "violet",
  },
];

export const WORKFLOW_METRICS: readonly WorkflowMetric[] = [
  { value: "92", label: "workspace score", tone: "green" },
  { value: "17", label: "tracked issues", tone: "blue" },
  { value: "+8", label: "fixed this week", tone: "violet" },
];

export const WORKFLOW_COLUMNS: readonly WorkflowColumn[] = [
  {
    title: "New",
    count: "3",
    cards: [
      {
        rule: "button-name",
        title: "Search icon button has no accessible name",
        owner: "Frontend",
        meta: "PR #128 · checkout",
        tone: "serious",
        ai: true,
      },
      {
        rule: "color-contrast",
        title: "Promo banner text fails AA",
        owner: "Design",
        meta: "/pricing",
        tone: "critical",
        ai: true,
      },
    ],
  },
  {
    title: "In progress",
    count: "2",
    cards: [
      {
        rule: "focus-order",
        title: "Country selector is skipped by keyboard",
        owner: "Payments",
        meta: "PaymentForm.tsx",
        tone: "moderate",
      },
    ],
  },
  {
    title: "Resolved",
    count: "8",
    cards: [
      {
        rule: "link-name",
        title: "Footer social link now has a clear label",
        owner: "Lev",
        meta: "merged · baseline +2",
        tone: "resolved",
      },
    ],
  },
];

export const WORKFLOW_ACTIVITY: readonly WorkflowActivity[] = [
  {
    source: "GitHub",
    title: "PR #128 blocked",
    detail: "2 new issues above baseline",
    tone: "blocked",
  },
  {
    source: "AI fix",
    title: "Patch suggested",
    detail: "aria-label for icon button",
    tone: "scheduled",
  },
  {
    source: "GitLab",
    title: "MR !54 clean",
    detail: "0 new issues · merge allowed",
    tone: "merged",
  },
];

export const WORKFLOW_TABS = [
  {
    key: "run",
    n: "01",
    label: "Run scan",
    title: "Run from CLI, CI, or Cloud.",
    text: "Run axiony scan, CI, or a cloud schedule. Axiony crawls the rendered UI and uploads one run against the baseline.",
    status: "baseline saved",
    accent: "green",
  },
  {
    key: "review",
    n: "02",
    label: "Review issues",
    title: "Issues land in the dashboard.",
    text: "Each finding becomes a board card with severity, owner, page or component, rule context, history, status, and whether an AI fix is ready.",
    status: "17 issues tracked",
    accent: "blue",
  },
  {
    key: "fix",
    n: "03",
    label: "Apply fix",
    title: "Apply AI patches and PR gates.",
    text: "Review the AI explanation, accept the suggested patch, re-scan, and let GitHub or GitLab block only regressions above the baseline.",
    status: "PR gate clean",
    accent: "violet",
  },
] as const;

// Looping CLI scene: scan a site, surface an issue, generate an AI fix
// (shown as a diff), then re-scan clean. `delay` is the pause before the
// line appears, in ms. The whole thing cycles — see ScanTerminal.
export type ScanLineType = "cmd" | "muted" | "run" | "ok" | "warn" | "add" | "remove" | "done";

export type ScanLine = {
  type: ScanLineType;
  text: string;
  delay: number;
};

export const SCAN_SEQUENCE: readonly ScanLine[] = [
  { type: "cmd", text: "axiony scan https://acme.com --fix", delay: 320 },
  { type: "muted", text: "workspace acme · branch checkout-refresh", delay: 420 },
  { type: "run", text: "crawling rendered UI…", delay: 500 },
  { type: "ok", text: "scanned 47 pages · 132 UI states", delay: 760 },
  { type: "ok", text: "ran axe-core + keyboard + contrast", delay: 620 },
  { type: "ok", text: "diffed against baseline · main @ 84", delay: 580 },
  { type: "warn", text: "3 new issues · 1 critical, 2 serious", delay: 700 },
  { type: "muted", text: "↳ button-name · src/SearchButton.tsx:12", delay: 420 },
  { type: "run", text: "generating AI fix…", delay: 560 },
  { type: "remove", text: '<button className="iconBtn">', delay: 760 },
  { type: "add", text: '<button className="iconBtn" aria-label="Search">', delay: 360 },
  { type: "ok", text: "patch applied · re-scan passed", delay: 700 },
  { type: "ok", text: "PR #128 gate green · GitHub", delay: 600 },
  { type: "done", text: "0 regressions · baseline 84 → 92", delay: 560 },
];

export const RUN_SUMMARY = [
  { value: "47", label: "pages scanned" },
  { value: "92", label: "score saved" },
  { value: "0", label: "new regressions" },
] as const;

export const AI_PATCH_LINES = [
  { type: "keep", code: "const SearchButton = () => (" },
  { type: "remove", code: '  <button className="iconBtn">' },
  { type: "add", code: '  <button className="iconBtn" aria-label="Search issues">' },
  { type: "keep", code: "    <SearchIcon />" },
  { type: "keep", code: "  </button>" },
  { type: "keep", code: ");" },
] as const;

export const PR_CHECKS = [
  { name: "GitHub", title: "PR #128", detail: "2 issues fixed · re-scan passing", tone: "clean" },
  { name: "GitLab", title: "MR !54", detail: "0 new issues above baseline", tone: "clean" },
  { name: "CI", title: "main", detail: "baseline updated to 92", tone: "saved" },
] as const;

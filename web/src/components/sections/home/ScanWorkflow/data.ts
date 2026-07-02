import type { WorkflowActivity, WorkflowColumn, WorkflowMetric } from "./types";

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
    hint: "CLI · CI · Cloud",
    path: "/acme/runs",
    title: "Run from CLI, CI, or Cloud.",
    text: "One command — locally, in CI, or on a cloud schedule. Axiony crawls the rendered UI and diffs the run against your baseline.",
    status: "baseline saved",
    accent: "green",
  },
  {
    key: "review",
    n: "02",
    label: "Review issues",
    hint: "severity · owner · status",
    path: "/acme/issues",
    title: "Issues land in the dashboard.",
    text: "Every finding becomes a board card with severity, an owner, rule context — and whether an AI fix is already waiting for review.",
    status: "17 issues tracked",
    accent: "blue",
  },
  {
    key: "fix",
    n: "03",
    label: "Apply fix",
    hint: "patch · re-scan · gate",
    path: "/acme/pull-requests",
    title: "Apply AI patches and PR gates.",
    text: "Accept the suggested patch, re-scan, and let GitHub or GitLab block only what is new above the baseline — never your old debt.",
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
  { value: "47", label: "pages scanned", note: "132 UI states" },
  { value: "92", label: "score saved", note: "baseline updated" },
  { value: "0", label: "new regressions", note: "merge allowed" },
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

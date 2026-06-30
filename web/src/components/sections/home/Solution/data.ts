import type {
  AiFixLine,
  CommandIssue,
  IntegrationCheck,
  SimRelease,
  SolutionStat,
  SolutionStep,
} from "./types";

// ── Release simulator script ─────────────────────────────────────────
// Ten identical releases, shipped through two pipelines. Both sides
// start at score 78. Ungated: every new issue lands (score drifts to
// 61). Gated: new issues bounce with exit 1, paid-down debt ratchets
// the score up to 91. Hand-tuned, not random — the demo should tell
// the same story every time.

export const START_SCORE = 78;

export const RELEASES: readonly SimRelease[] = [
  { ship: 2, fix: 0 },
  { ship: 1, fix: 1 },
  { ship: 3, fix: 0 },
  { ship: 1, fix: 2 },
  { ship: 2, fix: 2 },
  { ship: 1, fix: 0 },
  { ship: 3, fix: 3 },
  { ship: 1, fix: 2 },
  { ship: 2, fix: 2 },
  { ship: 1, fix: 1 },
];

/** Cumulative score per point (index 0 = before the first release). */
const accumulate = (step: (release: SimRelease) => number): readonly number[] => {
  const scores = [START_SCORE];
  for (const release of RELEASES) {
    scores.push(scores[scores.length - 1] + step(release));
  }
  return scores;
};

export const UNGATED_SCORES = accumulate((release) => -release.ship);
export const GATED_SCORES = accumulate((release) => release.fix);

// ── Product story: why Axiony is useful after the first scan ─────────
export const SOLUTION_STATS: readonly SolutionStat[] = [
  {
    value: "AI fixes",
    label: "Suggested patches with the broken UI and rule context attached.",
  },
  {
    value: "One board",
    label: "Owners, status, priority, and baseline debt in the same place.",
  },
  {
    value: "PR gates",
    label: "GitHub and GitLab checks stop new regressions before merge.",
  },
];

export const SOLUTION_STEPS: readonly SolutionStep[] = [
  {
    tag: "01",
    title: "Scan",
    text: "Find barriers in the rendered UI, then group them by page, component, rule, and severity.",
  },
  {
    tag: "02",
    title: "Triage",
    text: "Track each issue like product work: owner, status, baseline debt, AI fix, and history.",
  },
  {
    tag: "03",
    title: "Fix",
    text: "Use AI suggestions to turn vague audit output into the exact code change to review.",
  },
  {
    tag: "04",
    title: "Ship",
    text: "GitHub and GitLab checks block new issues while the dashboard shows the baseline improving.",
  },
];

export const COMMAND_ISSUES: readonly CommandIssue[] = [
  {
    rule: "button-name",
    title: "Icon button has no accessible name",
    target: "CheckoutHeader.tsx",
    status: "AI fix ready",
    owner: "Frontend",
    tone: "new",
  },
  {
    rule: "color-contrast",
    title: "Billing notice fails AA contrast",
    target: "/pricing",
    status: "In review",
    owner: "Design",
    tone: "ready",
  },
  {
    rule: "focus-order",
    title: "Country selector is skipped by Tab",
    target: "PaymentForm.tsx",
    status: "Baseline debt",
    owner: "Product",
    tone: "debt",
  },
];

export const AI_FIX_LINES: readonly AiFixLine[] = [
  { type: "keep", code: "const SearchButton = () => (" },
  { type: "remove", code: '  <button className="iconBtn">' },
  { type: "add", code: '  <button className="iconBtn" aria-label="Search issues">' },
  { type: "keep", code: "    <SearchIcon />" },
  { type: "keep", code: "  </button>" },
  { type: "keep", code: ");" },
];

export const INTEGRATION_CHECKS: readonly IntegrationCheck[] = [
  {
    name: "GitHub",
    label: "PR #128",
    status: "2 new issues blocked",
    tone: "blocked",
  },
  {
    name: "GitLab",
    label: "MR !54",
    status: "0 new issues · clean",
    tone: "clean",
  },
  {
    name: "CI",
    label: "main",
    status: "baseline saved",
    tone: "ready",
  },
];

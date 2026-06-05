import { blank, txt } from "@/components/ui";
import type { TerminalLine } from "@/components/ui";
import type { StepDef } from "./types";

export const SCAN_LINES: TerminalLine[] = [
  [txt("$", "prompt"), txt(" "), txt("npx axiony-cli scan https://acme.com --ci", "cmd")],
  [txt("  Axiony CLI v0.3.0 · axe-core + Playwright · free & open-source", "dim")],
  blank,
  [txt("  ✓ Loaded page · waited for stable DOM", "output")],
  [txt("  ✓ Ran axe-core ruleset · 142 checks", "success")],
  [txt("  ✓ Compared against baseline · 47 known issues", "output")],
  blank,
  [txt("  2 new issues", "output"), txt("   · 47 known (tracked, not blocking)", "dim")],
  [txt("  ├─ ", "dim"), txt("1 critical", "error"), txt("   color-contrast", "output")],
  [txt("  └─ ", "dim"), txt("1 serious", "warn"), txt("    button-name", "output")],
  blank,
  [txt("  Exit 1", "warn"), txt("  · new issues found — fails this check", "dim")],
  [txt("  (set as a required check to block the merge)", "dim")],
];

export const STEPS: readonly StepDef[] = [
  {
    key: "scan",
    n: "01",
    title: "Scan in CI",
    tag: "CLI · Free",
    accent: "green",
    caption:
      "Every push runs the free, open-source CLI in your pipeline. It scans the real DOM with axe-core, compares against your baseline, and fails the check only on new issues — so known debt never blocks a release. No account needed.",
  },
  {
    key: "site",
    n: "02",
    title: "Scan the whole site",
    tag: "Cloud · Pro",
    accent: "blue",
    caption:
      "Axiony Cloud scans your whole site on a schedule, keeps full history so you can compare any two runs, emails alerts on regressions — and suggests an AI fix for every issue.",
  },
  {
    key: "team",
    n: "03",
    title: "Roll out to the team",
    tag: "Cloud · Team",
    accent: "violet",
    caption:
      "Connect GitHub and GitLab for CI/CD status checks and PR / MR comments, share baselines across branches, route issues to owners, and get AI PR comments plus Slack alerts.",
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

export const TEAM_OPTS = [
  "AI comments in pull requests",
  "Shared baselines",
  "Branch & commit tracking",
  "Team members & roles",
  "CI/CD status checks",
  "Higher scan limits",
] as const;

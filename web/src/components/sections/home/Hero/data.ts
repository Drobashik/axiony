export const TITLE_LINE_ONE = "Today is the last day";
export const TITLE_LINE_TWO = "your accessibility";
export const TITLE_LINE_THREE = "gets";
export const TITLE_WORD_SQUIGGLED = "worse.";

export const SUBTITLE =
  "An accessibility scanner that runs in CI. It locks today's issues as your " +
  "baseline, then blocks any new ones from merging.";

export const VALUE_POINTS = [
  "free & open-source to start",
  "hosted scans + AI fixes",
  "PR checks for your team",
] as const;

export const INSTALL_COMMAND = "npm i -g axiony-cli";

// ── Demo terminal script ─────────────────────────────────────────────
// The hero terminal "runs" this scan on mount: the command is typed
// character by character, then each line streams in after its delay.

export const SCAN_COMMAND = "axiony scan https://acme.com";

export type TerminalSeverity = "critical" | "serious" | "moderate";

export type TerminalLineKind = "info" | "success" | "error" | "finding" | "section" | "exit";

export interface TerminalLine {
  kind: TerminalLineKind;
  /** Milliseconds after the previous line appears. */
  delay: number;
  text?: string;
  /** Dim annotation — right-aligned, except on `exit` lines where it trails the text. */
  aside?: string;
  /** Section rule only: append today's real date ("locked jun 10"). */
  withDate?: boolean;
  sev?: TerminalSeverity;
  rule?: string;
  where?: string;
}

export const TERMINAL_SCRIPT: readonly TerminalLine[] = [
  { kind: "info", delay: 480, text: "crawling acme.com", aside: "14 pages" },
  { kind: "success", delay: 850, text: "scan complete", aside: "14/14 · 3.8s" },
  { kind: "section", delay: 420, text: "findings" },
  { kind: "finding", delay: 220, sev: "critical", rule: "color-contrast", where: ".cta-banner" },
  { kind: "finding", delay: 170, sev: "serious", rule: "button-name", where: "header" },
  { kind: "finding", delay: 170, sev: "moderate", rule: "heading-order", where: "/pricing" },
  { kind: "section", delay: 430, text: "baseline", withDate: true },
  { kind: "success", delay: 240, text: "9 known issues", aside: "tracked · not blocking" },
  { kind: "error", delay: 380, text: "2 new issues since main" },
  { kind: "exit", delay: 540, text: "exit 1", aside: "— merge blocked" },
];

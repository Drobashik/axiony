export const TITLE_LINE_ONE = "Find barriers.";
export const TITLE_ACCENT_TEXT = "Prevent";
export const TITLE_WORD_SQUIGGLED = "regressions.";

export const SUBTITLE =
  "See barriers in context, get AI-suggested fixes, and protect your baseline in every pull request.";

export const VALUE_POINTS = ["CLI", "Cloud + AI", "PR gates"] as const;

export const INSTALL_COMMAND = "npm i -g axiony-cli";

// ── Live site-scan demo ──────────────────────────────────────────────
// The hero's right column renders a miniature landing page inside a
// browser and audits it on load: a scan line sweeps top → bottom, the
// percentage climbs, and real a11y issues get flagged on the page.
//
// Each flag is visually justified by the mock page itself (the flagged
// menu links really are faint, the flagged button really is unlabelled), so
// it reads as a genuine audit rather than a decoration.

export const SCAN_HOST = "acme.com";

export type Severity = "critical" | "serious" | "moderate";

/** How the affected person perceives the page: screen reader vs. low vision. */
export type AssistiveVia = "sr" | "eye";

export interface ScanIssue {
  /** Plain-language flag a non-technical visitor understands. */
  label: string;
  sev: Severity;
  /** Progress (%) at which the scan line reaches it. */
  at: number;
  via: AssistiveVia;
  /** The actual broken output assistive tech gives — what the user gets. */
  heard: string;
  /** Compact proof shown in the audit rail. */
  evidence: string;
  /** Who it blocks, in plain language — the real-world consequence. */
  impact: string;
}

export const SCAN_ISSUES: readonly ScanIssue[] = [
  {
    label: "low contrast",
    sev: "critical",
    at: 12,
    via: "eye",
    heard: "1.9 : 1",
    evidence: "1.9:1 · needs 4.5:1",
    impact: "The menu links disappear into the header for many low-vision visitors.",
  },
  {
    label: "no alt text",
    sev: "serious",
    at: 48,
    via: "sr",
    heard: "image",
    evidence: 'screen reader: "image"',
    impact: "A blind visitor gets no description of the product preview.",
  },
  {
    label: "no button name",
    sev: "serious",
    at: 67,
    via: "sr",
    heard: "button",
    evidence: 'screen reader: "button"',
    impact: "The icon looks clear, but its purpose is invisible to assistive tech.",
  },
  {
    label: "missing label",
    sev: "moderate",
    at: 86,
    via: "sr",
    heard: "edit, blank",
    evidence: 'screen reader: "edit, blank"',
    impact: "The placeholder disappears while typing, leaving the field unidentified.",
  },
];

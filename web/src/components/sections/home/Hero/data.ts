export const TITLE_LINE_ONE = "Find barriers.";
export const TITLE_ACCENT_TEXT = "Prevent";
export const TITLE_WORD_SQUIGGLED = "regressions.";

export const SUBTITLE =
  "See barriers in context, get AI-suggested fixes, and protect your baseline in every pull request.";

export const VALUE_POINTS = ["CLI", "Cloud + AI", "PR gates"] as const;

export const SCAN_HOST = "acme.com";

export type Severity = "critical" | "serious" | "moderate";

export type AssistiveVia = "sr" | "eye";

export interface ScanIssue {
  label: string;
  sev: Severity;
  at: number;
  via: AssistiveVia;
  heard: string;
  evidence: string;
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

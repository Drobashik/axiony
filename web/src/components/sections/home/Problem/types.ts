export type ProblemDemo = "contrast" | "screenReader" | "keyboard" | "color";

export type ProblemSeverity = "critical" | "serious" | "moderate";

export interface ProblemItem {
  /** Axe rule / WCAG criterion shown as the finding id. */
  rule: string;
  sev: ProblemSeverity;
  title: string;
  /** Compact label for the mobile chip rail. */
  short: string;
  description: string;
  headline: string;
  demo: ProblemDemo;
}

export type RGB = [number, number, number];

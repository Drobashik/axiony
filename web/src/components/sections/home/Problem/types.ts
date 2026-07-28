export type ProblemDemo = "contrast" | "screenReader" | "keyboard" | "color";

export type ProblemSeverity = "critical" | "serious" | "moderate";

export interface ProblemItem {
  rule: string;
  sev: ProblemSeverity;
  title: string;
  short: string;
  description: string;
  headline: string;
  demo: ProblemDemo;
}

export type RGB = [number, number, number];

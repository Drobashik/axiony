export const TITLE_LINE_ONE = "Catch accessibility issues";
export const TITLE_LINE_TWO = "before your users do.";

export const VALUE_POINTS = [
  "Free CLI to start",
  "Scans in CI & the cloud",
  "Regressions can't merge",
] as const;

export interface HeroIssue {
  sev: "critical" | "serious" | "moderate";
  rule: string;
  where: string;
}

export const HERO_ISSUES: readonly HeroIssue[] = [
  { sev: "critical", rule: "color-contrast", where: ".cta-banner" },
  { sev: "serious", rule: "button-name", where: "header" },
  { sev: "moderate", rule: "heading-order", where: "/pricing" },
];

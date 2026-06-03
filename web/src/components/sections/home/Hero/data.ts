export const TITLE_LINE_ONE = "Find, track, and prevent";
export const TITLE_LINE_TWO = "accessibility regressions.";

export const VALUE_POINTS = [
  "Free, open-source CLI",
  "Scans in CI & the cloud",
  "Blocks new regressions before merge",
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

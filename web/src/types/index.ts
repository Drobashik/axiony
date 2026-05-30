/**
 * Shared TypeScript types used across the app.
 *
 * Kept narrow on purpose — page-specific types live next to their page.
 */

export type Severity = "critical" | "serious" | "moderate" | "minor";

export type AccentColor = "blue" | "green" | "violet";

export type IconName =
  | "scan"
  | "check"
  | "arrow"
  | "terminal"
  | "ci"
  | "report"
  | "team"
  | "bolt"
  | "code"
  | "selector"
  | "globe"
  | "json";

export interface NavLink {
  href: string;
  label: string;
  /** Marks the link as active when the current page matches. */
  match?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

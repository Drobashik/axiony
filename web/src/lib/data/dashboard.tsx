import { ReactNode } from "react";
import { Severity } from "@/types";

// =====================================================================
// Static dataset that powers the dashboard demo.
// =====================================================================

export type ProjectStatus = "passing" | "warning" | "failing" | "scanning";

export interface Project {
  id: number;
  name: string;
  url: string;
  path: string;
  score: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  status: ProjectStatus;
  schedule: string;
  lastScan: string;
  trend: number[];
  pages: number;
}

export const PROJECTS: readonly Project[] = [
  {
    id: 1,
    name: "Main Site",
    url: "acme.com",
    path: "/",
    score: 72,
    critical: 3,
    serious: 8,
    moderate: 12,
    minor: 5,
    status: "warning",
    schedule: "Every 6h",
    lastScan: "14 min ago",
    trend: [55, 60, 58, 62, 68, 70, 72],
    pages: 24,
  },
  {
    id: 2,
    name: "Marketing",
    url: "acme.com",
    path: "/marketing",
    score: 91,
    critical: 0,
    serious: 1,
    moderate: 3,
    minor: 2,
    status: "passing",
    schedule: "Daily",
    lastScan: "2h ago",
    trend: [80, 82, 85, 88, 89, 90, 91],
    pages: 8,
  },
  {
    id: 3,
    name: "Checkout Flow",
    url: "acme.com",
    path: "/checkout",
    score: 44,
    critical: 7,
    serious: 11,
    moderate: 9,
    minor: 4,
    status: "failing",
    schedule: "On deploy",
    lastScan: "45 min ago",
    trend: [60, 55, 50, 48, 46, 45, 44],
    pages: 5,
  },
  {
    id: 4,
    name: "Design System",
    url: "storybook.acme.com",
    path: "/",
    score: 88,
    critical: 0,
    serious: 2,
    moderate: 5,
    minor: 8,
    status: "passing",
    schedule: "On PR",
    lastScan: "1h ago",
    trend: [75, 78, 80, 83, 85, 87, 88],
    pages: 142,
  },
  {
    id: 5,
    name: "Help Center",
    url: "help.acme.com",
    path: "/",
    score: 63,
    critical: 2,
    serious: 5,
    moderate: 8,
    minor: 3,
    status: "warning",
    schedule: "Daily",
    lastScan: "Scanning...",
    trend: [60, 61, 63, 62, 64, 63, 63],
    pages: 67,
  },
  {
    id: 6,
    name: "Blog",
    url: "acme.com",
    path: "/blog",
    score: 95,
    critical: 0,
    serious: 0,
    moderate: 2,
    minor: 1,
    status: "passing",
    schedule: "Weekly",
    lastScan: "3h ago",
    trend: [90, 91, 92, 93, 94, 95, 95],
    pages: 312,
  },
];

export type IssueStatus = "open" | "in-progress" | "resolved";

export interface DashboardIssue {
  id: number;
  title: string;
  rule: string;
  severity: Severity;
  project: string;
  assignee: string | null;
  assigneeColor?: string;
  count: number;
  status: IssueStatus;
}

export const ISSUES: readonly DashboardIssue[] = [
  {
    id: 1,
    title: "Images missing alt text",
    rule: "wcag-1.1.1",
    severity: "critical",
    project: "Checkout Flow",
    assignee: "MK",
    assigneeColor: "var(--blue)",
    count: 7,
    status: "open",
  },
  {
    id: 2,
    title: "Keyboard trap in modal",
    rule: "wcag-2.1.2",
    severity: "critical",
    project: "Main Site",
    assignee: "SR",
    assigneeColor: "var(--violet)",
    count: 1,
    status: "in-progress",
  },
  {
    id: 3,
    title: "Insufficient color contrast",
    rule: "wcag-1.4.3",
    severity: "serious",
    project: "Checkout Flow",
    assignee: null,
    count: 11,
    status: "open",
  },
  {
    id: 4,
    title: "Form inputs without labels",
    rule: "wcag-1.3.1",
    severity: "critical",
    project: "Checkout Flow",
    assignee: "AP",
    assigneeColor: "var(--green)",
    count: 4,
    status: "open",
  },
  {
    id: 5,
    title: "Focus indicator not visible",
    rule: "wcag-2.4.11",
    severity: "serious",
    project: "Main Site",
    assignee: "MK",
    assigneeColor: "var(--blue)",
    count: 6,
    status: "in-progress",
  },
  {
    id: 6,
    title: "Heading levels skipped",
    rule: "wcag-1.3.1",
    severity: "moderate",
    project: "Help Center",
    assignee: null,
    count: 8,
    status: "open",
  },
  {
    id: 7,
    title: "Ambiguous link text",
    rule: "wcag-2.4.4",
    severity: "minor",
    project: "Blog",
    assignee: null,
    count: 3,
    status: "open",
  },
  {
    id: 8,
    title: "Empty button accessible name",
    rule: "wcag-4.1.2",
    severity: "serious",
    project: "Design System",
    assignee: "SR",
    assigneeColor: "var(--violet)",
    count: 2,
    status: "resolved",
  },
  {
    id: 9,
    title: "No skip navigation link",
    rule: "wcag-2.4.1",
    severity: "moderate",
    project: "Main Site",
    assignee: null,
    count: 1,
    status: "open",
  },
  {
    id: 10,
    title: "Animation missing reduced-motion",
    rule: "wcag-2.3.3",
    severity: "minor",
    project: "Marketing",
    assignee: "AP",
    assigneeColor: "var(--green)",
    count: 2,
    status: "in-progress",
  },
];

export interface ActivityItem {
  icon: string;
  background: string;
  text: ReactNode;
  time: string;
}

export const ACTIVITY: readonly ActivityItem[] = [
  {
    icon: "🔴",
    background: "oklch(0.62 0.22 20 / 0.15)",
    text: (
      <>
        <strong>3 new critical issues</strong> found in Checkout Flow — keyboard trap, missing
        labels
      </>
    ),
    time: "14 min ago",
  },
  {
    icon: "✓",
    background: "var(--green-dim)",
    text: (
      <>
        <strong>Sarah R.</strong> resolved &quot;Empty button name&quot; in Design System
      </>
    ),
    time: "1h ago",
  },
  {
    icon: "🔁",
    background: "var(--blue-dim)",
    text: (
      <>
        <strong>Scheduled scan</strong> completed for Marketing — score improved to 91
      </>
    ),
    time: "2h ago",
  },
  {
    icon: "👤",
    background: "oklch(0.62 0.20 290 / 0.15)",
    text: (
      <>
        <strong>Arjun P.</strong> assigned &quot;Color contrast&quot; issue to themselves
      </>
    ),
    time: "3h ago",
  },
  {
    icon: "🚀",
    background: "var(--green-dim)",
    text: (
      <>
        <strong>Design System</strong> scan triggered by PR #284 — 0 critical issues
      </>
    ),
    time: "4h ago",
  },
];

export interface TrendDataset {
  label: string;
  color: string;
  values: number[];
}

export const TREND_WEEKS: readonly string[] = [
  "Mar 1",
  "Mar 8",
  "Mar 15",
  "Mar 22",
  "Mar 29",
  "Apr 5",
  "Apr 12",
  "Apr 19",
];

export const TREND_DATASETS: readonly TrendDataset[] = [
  { label: "Critical", color: "oklch(0.72 0.20 20)", values: [8, 10, 9, 12, 8, 6, 5, 3] },
  { label: "Serious", color: "oklch(0.72 0.18 50)", values: [22, 20, 24, 22, 19, 17, 14, 11] },
  { label: "Moderate", color: "oklch(0.75 0.15 80)", values: [30, 28, 32, 30, 29, 27, 25, 24] },
];

export type DashboardTab =
  | "overview"
  | "projects"
  | "issues"
  | "scan"
  | "reports"
  | "alerts"
  | "team"
  | "settings";

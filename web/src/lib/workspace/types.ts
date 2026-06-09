import type { Severity } from "@/types";
import type { SeverityCounts } from "@/lib/scan/issues";

// =====================================================================
// Mock "workspace" model (v2 — multi-project).
// ---------------------------------------------------------------------
// A workspace holds one or more projects (one per domain/host). Each
// project holds one or more pages (one per path). Each page tracks its
// own baseline + scan history, so a new scan never overwrites another:
//   • new domain        → new project
//   • new path (same domain) → new page on that project
//   • same path again   → a follow-up scan on that page
//
// Client-only, persisted to localStorage via `store.ts`. Swap that module
// for a real API later; these shapes stay the same.
// =====================================================================

export type WcagLevel = "A" | "AA" | "AAA";

/** Triage status the user can set on a tracked issue. */
export type IssueStatus = "open" | "in-progress" | "resolved" | "ignored";

/** One tracked issue, including the scan details needed by the dashboard dialog. */
export interface TrackedIssue {
  id: string;
  title: string;
  severity: Severity;
  rule: string;
  /** Occurrences found on the page. */
  count: number;
  status: IssueStatus;
  /** ISSUE_POOL template id for the detail view (defaults to `id`). */
  templateId?: string;
  description?: string;
  wcag?: string[];
  nodes?: string[];
  fix?: string;
  whatHappened?: string;
  whyItMatters?: string;
  suggestedFix?: string;
  beforeCode?: string;
  afterCode?: string;
  code?: string;
}

/** A scan result captured at the point the user chose to save it. */
export interface PendingScan {
  url: string;
  host: string;
  path: string;
  level: WcagLevel;
  score: number;
  counts: SeverityCounts;
  total: number;
  issues: TrackedIssue[];
  scannedAt: string; // ISO
}

export interface WorkspaceAccount {
  name: string;
  email: string;
  initials: string;
  createdAt: string; // ISO
}

/** One point in a page's scan history, compared to its baseline. */
export interface ScanRecord {
  id: string;
  score: number;
  counts: SeverityCounts;
  total: number;
  /** Issues fixed since the previous scan of this page. */
  resolved: number;
  /** Titles of new issues not present in the page baseline (regressions). */
  regressions: string[];
  scannedAt: string; // ISO
}

/** The frozen starting point for a page. */
export interface PageBaseline {
  score: number;
  counts: SeverityCounts;
  total: number;
  issues: TrackedIssue[];
  createdAt: string; // ISO
}

/** A single tracked page (one path on a project's domain). */
export interface ProjectPage {
  id: string;
  path: string; // "/", "/pricing"
  url: string; // full URL
  level: WcagLevel;
  baseline: PageBaseline;
  /** Live set of currently-open issues (starts equal to the baseline). */
  open: TrackedIssue[];
  /** Chronological history; the first entry mirrors the baseline. */
  scans: ScanRecord[];
}

/** A project — everything tracked for one domain/host. */
export interface Project {
  id: string;
  host: string; // "acme.com"
  createdAt: string; // ISO
  pages: ProjectPage[];
}

export type OnboardingStepId = "baseline" | "connect" | "ci" | "invite";

/** What was just created, to drive the one-time celebration. */
export interface JustCreated {
  kind: "project" | "page";
  host: string;
  path: string;
}

export interface OnboardingState {
  justCreated: JustCreated | null;
  steps: Record<OnboardingStepId, boolean>;
}

export interface Workspace {
  version: 3;
  account: WorkspaceAccount;
  projects: Project[];
  onboarding: OnboardingState;
}

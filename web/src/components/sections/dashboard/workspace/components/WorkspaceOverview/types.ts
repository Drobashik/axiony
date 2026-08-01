import type { IconName, Severity } from "@/types";
import type { SeverityCounts } from "@/lib/scan/issues";
import type { Project, ProjectPage, TrendPoint, WorkspaceChangeDigest } from "@/lib/workspace";

export type OverviewTone = "good" | "watch" | "risk" | "neutral";

export interface NextAction {
  title: string;
  text: string;
  label: string;
  icon: IconName;
  target: "issues" | "scan";
  tone: OverviewTone;
}

export interface PriorityFix {
  key: string;
  title: string;
  rule: string;
  severity: Severity;
  occurrences: number;
  pages: number;
  isRegression: boolean;
}

export interface ProjectInsight {
  id: string;
  title: string;
  text: string;
  icon: IconName;
  tone: OverviewTone;
}

export type FreshnessStatus = "fresh" | "aging" | "stale" | "baseline";

export interface PageHealthRow {
  page: ProjectPage;
  score: number;
  scoreDelta: number;
  openIssues: number;
  regressions: number;
  lastScannedAt: string;
  freshness: FreshnessStatus;
}

export interface ProjectActivityItem {
  id: string;
  page: ProjectPage;
  scannedAt: string;
  score: number;
  scoreDelta: number;
  resolved: number;
  regressions: number;
  isBaseline: boolean;
}

export interface ProjectOverviewModel {
  project: Project;
  scopePage: ProjectPage | null;
  isPageScope: boolean;
  label: string;
  url: string;
  score: number;
  baselineScore: number;
  scoreDelta: number;
  openIssues: number;
  severityCounts: SeverityCounts;
  pageCount: number;
  scanCount: number;
  lastScannedAt: string;
  healthTitle: string;
  healthText: string;
  digest: WorkspaceChangeDigest;
  nextAction: NextAction;
  priorities: PriorityFix[];
  insights: ProjectInsight[];
  pages: PageHealthRow[];
  freshPages: number;
  trend: TrendPoint[];
  baselineTrendScore: number;
  baselineTrendTotal: number;
  activity: ProjectActivityItem[];
}

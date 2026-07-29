import type {
  LocatedIssue,
  Project,
  WorkspaceChangeDigest,
  WorkspaceSummary,
} from "@/lib/workspace";

export type WindowDays = 7 | 30 | 90;

export interface ProjectHealthRow {
  project: Project;
  score: number;
  scoreDelta: number;
  openIssues: number;
  critical: number;
  serious: number;
  regressions: number;
  resolved: number;
  movementScore: number;
  recentPages: number;
  pageCount: number;
  lastScannedAt: string;
  attentionPriority: number;
  attentionReason: string | null;
}

export interface PortfolioOverviewModel {
  summary: WorkspaceSummary;
  digest: WorkspaceChangeDigest;
  rows: ProjectHealthRow[];
  issues: LocatedIssue[];
  attention: ProjectHealthRow[];
  latestScan: string;
  scoreDelta: number;
  support: string;
  movementParts: string[];
}

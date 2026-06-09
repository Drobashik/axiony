import type { Issue, SeverityCounts } from "@/lib/scan/issues";

export type WcagLevel = "A" | "AA" | "AAA";

export type StudioState = "idle" | "scanning" | "results" | "failed";

export interface ScanPhase {
  key: string;
  label: string;
  detail: string;
}

export interface ScanReport {
  url: string;
  level: WcagLevel;
  scannedAt: Date;
  issues: Issue[];
  counts: SeverityCounts;
  /** Severity-weighted accessibility score (0–100). */
  score: number;
}

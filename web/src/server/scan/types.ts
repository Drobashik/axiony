import type { Issue, SeverityCounts } from "@/lib/scan/issues";

export type WcagLevel = "A" | "AA" | "AAA";

export type ScanJobStatus = "queued" | "scanning" | "complete" | "failed";

export interface ScanReportPayload {
  url: string;
  level: WcagLevel;
  scannedAt: string;
  issues: Issue[];
  counts: SeverityCounts;
  score: number;
}

export interface ScanJobSnapshot {
  jobId: string;
  status: ScanJobStatus;
  url: string;
  level: WcagLevel;
  progress: number;
  lines: string[];
  createdAt: string;
  updatedAt: string;
  report?: ScanReportPayload;
  error?: string;
}

export interface CliScanIssue {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  snippets?: string[];
  tags: string[];
  selectors: string[];
}

export interface CliScanResult {
  url: string;
  timestamp: string;
  metadata?: {
    selector?: string;
    warnings?: string[];
  };
  issues: CliScanIssue[];
  manualChecks: CliScanIssue[];
}

export type ScanRunnerEvent =
  | { type: "progress"; message: string }
  | { type: "result"; result: CliScanResult }
  | { type: "error"; message: string };

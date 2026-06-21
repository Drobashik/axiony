export type WcagLevel = "A" | "AA" | "AAA";
export type ScanJobStatus = "queued" | "scanning" | "complete" | "failed";
export type Severity = "critical" | "serious" | "moderate" | "minor";

export type SeverityCounts = Record<Severity, number>;

export interface Issue {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  rule: string;
  wcag: string[];
  nodes: string[];
  fix: string;
  whatHappened?: string;
  whyItMatters?: string;
  suggestedFix?: string;
  beforeCode?: string;
  afterCode?: string;
  code?: string;
  animationDelay: number;
}

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

export interface MutableScanJob extends ScanJobSnapshot {
  report?: ScanReportPayload;
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

export interface ScanUrlOptions {
  onProgressPrint?: (message: string) => void;
  selector?: string;
}

export interface JobStats {
  active: number;
  queued: number;
  total: number;
  concurrency: number;
}

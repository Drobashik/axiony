import type { Severity } from "@/types";
import type { SeverityCounts } from "@/lib/scan/issues";
import { SEVERITY_WEIGHT } from "@/lib/scan/issues";
import type {
  PendingScan,
  Project,
  ProjectPage,
  TrackedIssue,
  WcagLevel,
  Workspace,
} from "./types";

// =====================================================================
// Pure helpers — no storage, no React. Easy to test and reuse.
// =====================================================================

export const hostFromUrl = (url: string): string => {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return (
      url
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0] || url
    );
  }
};

export const pathFromUrl = (url: string): string => {
  let path = "/";
  try {
    path = new URL(url).pathname || "/";
  } catch {
    const m = url.replace(/^https?:\/\//, "").match(/\/.*/);
    path = m ? m[0] : "/";
  }
  // Normalise a trailing slash (but keep the root "/").
  return path.length > 1 ? path.replace(/\/+$/, "") : "/";
};

/** Compact display label for a tracked page, e.g. "example.com/pricing". */
export const pageLabel = (host: string, path: string): string =>
  `${host}${path === "/" ? "" : path}`;

export const initialsFromName = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Severity- and occurrence-weighted score — the exact formula `computeScore`
 * uses for real scans, so a saved baseline and a simulated re-scan stay on the
 * same scale (re-scanning unchanged issues yields the same score).
 */
export const scoreFromIssues = (issues: { severity: Severity; count: number }[]): number => {
  const penalty = issues.reduce(
    (sum, i) => sum + SEVERITY_WEIGHT[i.severity] * (1 + Math.min(i.count - 1, 3) * 0.1),
    0,
  );
  return Math.max(45, Math.round(100 - penalty));
};

export const countsFromIssues = (issues: TrackedIssue[]): SeverityCounts => ({
  critical: issues.filter((i) => i.severity === "critical").length,
  serious: issues.filter((i) => i.severity === "serious").length,
  moderate: issues.filter((i) => i.severity === "moderate").length,
  minor: issues.filter((i) => i.severity === "minor").length,
});

const sumCounts = (list: SeverityCounts[]): SeverityCounts =>
  list.reduce(
    (acc, c) => ({
      critical: acc.critical + c.critical,
      serious: acc.serious + c.serious,
      moderate: acc.moderate + c.moderate,
      minor: acc.minor + c.minor,
    }),
    { critical: 0, serious: 0, moderate: 0, minor: 0 },
  );

const ACTIONABLE_STATUSES = new Set(["open", "in-progress"]);

const actionableIssues = (issues: TrackedIssue[]): TrackedIssue[] =>
  issues.filter((issue) => ACTIONABLE_STATUSES.has(issue.status));

const normalizeIssueKeyPart = (value: string | number | undefined): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const stableHash = (value: string): string => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
};

export const issuePersistenceKey = (issue: TrackedIssue): string => {
  if (issue.issueKey) return issue.issueKey;

  const nodeSignature = issue.nodes?.slice(0, 3).map(normalizeIssueKeyPart).join("|");
  const identity = [
    issue.templateId,
    issue.id,
    issue.rule,
    issue.title,
    issue.severity,
    nodeSignature,
    issue.count,
  ]
    .map(normalizeIssueKeyPart)
    .join("|");

  return stableHash(identity);
};

/** Minimal shape the scan page passes in — structurally typed so this
 * module never imports the scan component types. */
interface ReportLike {
  url: string;
  level: WcagLevel;
  score: number;
  counts: SeverityCounts;
  scannedAt: Date;
  issues: {
    id: string;
    title: string;
    severity: Severity;
    rule: string;
    description?: string;
    wcag?: string[];
    nodes: string[];
    fix?: string;
    whatHappened?: string;
    whyItMatters?: string;
    suggestedFix?: string;
    beforeCode?: string;
    afterCode?: string;
    code?: string;
  }[];
}

export const pendingFromReport = (report: ReportLike): PendingScan => {
  const scannedAt = report.scannedAt.toISOString();

  return {
    url: report.url,
    host: hostFromUrl(report.url),
    path: pathFromUrl(report.url),
    level: report.level,
    score: report.score,
    counts: report.counts,
    total: report.issues.length,
    issues: report.issues.map((source) => {
      const issue: TrackedIssue = {
        id: source.id,
        title: source.title,
        severity: source.severity,
        rule: source.rule,
        count: source.nodes.length,
        status: "open" as const,
        description: source.description,
        wcag: source.wcag,
        nodes: source.nodes,
        fix: source.fix,
        whatHappened: source.whatHappened,
        whyItMatters: source.whyItMatters,
        suggestedFix: source.suggestedFix,
        beforeCode: source.beforeCode,
        afterCode: source.afterCode,
        code: source.code,
        createdAt: scannedAt,
      };

      return { ...issue, issueKey: issuePersistenceKey(issue) };
    }),
    scannedAt,
  };
};

// ── Page / project / workspace roll-ups ──────────────────────────────
export interface TrendPoint {
  score: number;
  total: number;
  counts: SeverityCounts;
  scannedAt: string;
}

export interface PageModel {
  latestScore: number;
  baselineScore: number;
  baselineTotal: number;
  scoreDelta: number;
  openIssues: number;
  debt: number;
  hasFollowups: boolean;
  scanCount: number;
  trendScores: number[];
  trend: TrendPoint[];
  regressionsCaught: number;
  resolvedTotal: number;
  lastScannedAt: string;
  counts: SeverityCounts;
}

export const pageModel = (page: ProjectPage): PageModel => {
  const latest = page.scans[page.scans.length - 1];
  const followups = page.scans.slice(1);
  return {
    latestScore: latest.score,
    baselineScore: page.baseline.score,
    baselineTotal: page.baseline.total,
    scoreDelta: latest.score - page.baseline.score,
    openIssues: actionableIssues(page.open).length,
    debt: page.baseline.total,
    hasFollowups: followups.length > 0,
    scanCount: page.scans.length,
    trendScores: page.scans.map((s) => s.score),
    trend: page.scans.map((s) => ({
      score: s.score,
      total: s.total,
      counts: s.counts,
      scannedAt: s.scannedAt,
    })),
    regressionsCaught: followups.reduce((sum, s) => sum + s.regressions.length, 0),
    resolvedTotal: followups.reduce((sum, s) => sum + s.resolved, 0),
    lastScannedAt: latest.scannedAt,
    counts: countsFromIssues(actionableIssues(page.open)),
  };
};

export interface ProjectModel {
  host: string;
  pageCount: number;
  avgScore: number;
  openIssues: number;
  debt: number;
  regressionsCaught: number;
  counts: SeverityCounts;
  lastScannedAt: string;
}

export const projectModel = (project: Project): ProjectModel => {
  const models = project.pages.map(pageModel);
  const avgScore = models.length
    ? Math.round(models.reduce((s, m) => s + m.latestScore, 0) / models.length)
    : 0;
  return {
    host: project.host,
    pageCount: project.pages.length,
    avgScore,
    openIssues: models.reduce((s, m) => s + m.openIssues, 0),
    debt: models.reduce((s, m) => s + m.debt, 0),
    regressionsCaught: models.reduce((s, m) => s + m.regressionsCaught, 0),
    counts: sumCounts(models.map((m) => m.counts)),
    lastScannedAt: models.reduce((a, m) => (m.lastScannedAt > a ? m.lastScannedAt : a), ""),
  };
};

export interface WorkspaceSummary {
  projectCount: number;
  pageCount: number;
  avgScore: number;
  debt: number;
  openIssues: number;
  regressionsCaught: number;
  resolvedTotal: number;
  counts: SeverityCounts;
}

export const allPages = (ws: Workspace): ProjectPage[] => ws.projects.flatMap((p) => p.pages);

export const totalOpenIssues = (ws: Workspace): number =>
  allPages(ws).reduce((sum, page) => sum + actionableIssues(page.open).length, 0);

export const workspaceSummary = (ws: Workspace): WorkspaceSummary | null => {
  const pages = allPages(ws);
  if (pages.length === 0) return null;

  const models = pages.map(pageModel);
  return {
    projectCount: ws.projects.length,
    pageCount: pages.length,
    avgScore: Math.round(models.reduce((s, m) => s + m.latestScore, 0) / models.length),
    debt: models.reduce((s, m) => s + m.debt, 0),
    openIssues: models.reduce((s, m) => s + m.openIssues, 0),
    regressionsCaught: models.reduce((s, m) => s + m.regressionsCaught, 0),
    resolvedTotal: models.reduce((s, m) => s + m.resolvedTotal, 0),
    counts: sumCounts(models.map((m) => m.counts)),
  };
};

export interface WorkspaceChangeEvent {
  id: string;
  host: string;
  path: string;
  label: string;
  scannedAt: string;
  previousScannedAt: string;
  score: number;
  previousScore: number;
  scoreDelta: number;
  resolved: number;
  regressions: number;
}

export interface WorkspaceChangeDigest {
  windowDays: number;
  resolved: number;
  regressions: number;
  netScoreDelta: number;
  changedPages: number;
  followupScans: number;
  latestEvent: WorkspaceChangeEvent | null;
  strongestScoreEvent: WorkspaceChangeEvent | null;
  events: WorkspaceChangeEvent[];
  hasFollowups: boolean;
}

const DAYS_TO_MS = 24 * 60 * 60 * 1000;

const scanTime = (iso: string): number => {
  const time = new Date(iso).getTime();
  return Number.isFinite(time) ? time : 0;
};

/** A return-visit summary: follow-up scans in the selected window, compared to each page's previous scan. */
export const workspaceChangeDigest = (
  ws: Workspace,
  windowDays = 7,
  nowMs = Date.now(),
): WorkspaceChangeDigest => {
  const cutoff = nowMs - windowDays * DAYS_TO_MS;
  const allEvents: WorkspaceChangeEvent[] = [];

  for (const project of ws.projects) {
    for (const page of project.pages) {
      for (let index = 1; index < page.scans.length; index += 1) {
        const previous = page.scans[index - 1];
        const scan = page.scans[index];
        allEvents.push({
          id: scan.id,
          host: project.host,
          path: page.path,
          label: pageLabel(project.host, page.path),
          scannedAt: scan.scannedAt,
          previousScannedAt: previous.scannedAt,
          score: scan.score,
          previousScore: previous.score,
          scoreDelta: scan.score - previous.score,
          resolved: scan.resolved,
          regressions: scan.regressions.length,
        });
      }
    }
  }

  const sortedEvents = allEvents.sort((a, b) => scanTime(b.scannedAt) - scanTime(a.scannedAt));
  const events = sortedEvents.filter((event) => scanTime(event.scannedAt) >= cutoff);
  const pageKeys = new Set(events.map((event) => `${event.host}${event.path}`));
  const strongestScoreEvent =
    events
      .filter((event) => event.scoreDelta !== 0)
      .sort((a, b) => Math.abs(b.scoreDelta) - Math.abs(a.scoreDelta))[0] ?? null;

  return {
    windowDays,
    resolved: events.reduce((sum, event) => sum + event.resolved, 0),
    regressions: events.reduce((sum, event) => sum + event.regressions, 0),
    netScoreDelta: events.reduce((sum, event) => sum + event.scoreDelta, 0),
    changedPages: pageKeys.size,
    followupScans: events.length,
    latestEvent: sortedEvents[0] ?? null,
    strongestScoreEvent,
    events,
    hasFollowups: sortedEvents.length > 0,
  };
};

export interface LocatedPage {
  project: Project;
  page: ProjectPage;
}

/** The most recently scanned page across the whole workspace. */
export const latestScannedPage = (ws: Workspace): LocatedPage | null => {
  let best: LocatedPage | null = null;
  let bestAt = "";
  for (const project of ws.projects) {
    for (const page of project.pages) {
      const at = page.scans[page.scans.length - 1]?.scannedAt ?? "";
      if (!best || at > bestAt) {
        best = { project, page };
        bestAt = at;
      }
    }
  }
  return best;
};

export interface LocatedIssue {
  host: string;
  path: string;
  issue: TrackedIssue;
  isRegression: boolean;
  resolvedAt?: string;
}

export const locatedIssueKey = (located: LocatedIssue, index: number): string => {
  const { host, path, issue } = located;
  const nodeSignature = issue.nodes?.slice(0, 3).map(normalizeIssueKeyPart).join("|");
  const identity = [
    host,
    path,
    issue.templateId,
    issue.id,
    issue.rule,
    issue.title,
    issue.severity,
    nodeSignature,
    issue.count,
    located.resolvedAt,
  ]
    .map(normalizeIssueKeyPart)
    .join("|");

  return `issue:${stableHash(identity)}:${index}`;
};

/** Current scan issues across the workspace, worst-first. */
export const aggregateCurrentIssues = (ws: Workspace): LocatedIssue[] => {
  const rank: Record<Severity, number> = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const out: LocatedIssue[] = [];
  for (const project of ws.projects) {
    for (const page of project.pages) {
      const baselineTitles = new Set(page.baseline.issues.map((i) => i.title));
      for (const issue of page.open) {
        out.push({
          host: project.host,
          path: page.path,
          issue,
          isRegression: !baselineTitles.has(issue.title),
        });
      }
    }
  }
  return out.sort((a, b) => rank[a.issue.severity] - rank[b.issue.severity]);
};

/** Actionable currently-open issues across the workspace, worst-first. */
export const aggregateOpenIssues = (ws: Workspace): LocatedIssue[] =>
  aggregateCurrentIssues(ws).filter((located) => ACTIONABLE_STATUSES.has(located.issue.status));

/** Issues that disappeared during follow-up scans, newest resolution first. */
export const aggregateResolvedIssues = (ws: Workspace): LocatedIssue[] => {
  const out: LocatedIssue[] = [];

  for (const project of ws.projects) {
    for (const page of project.pages) {
      const baselineTitles = new Set(page.baseline.issues.map((i) => i.title));
      for (const scan of page.scans.slice(1)) {
        for (const issue of scan.resolvedIssues ?? []) {
          out.push({
            host: project.host,
            path: page.path,
            issue: { ...issue, status: "resolved" },
            isRegression: !baselineTitles.has(issue.title),
            resolvedAt: scan.scannedAt,
          });
        }
      }
    }
  }

  return out.sort((a, b) => (b.resolvedAt ?? "").localeCompare(a.resolvedAt ?? ""));
};

/** Current open issues plus resolved issue history for the Issues tab. */
export const aggregateTrackedIssues = (ws: Workspace): LocatedIssue[] => [
  ...aggregateCurrentIssues(ws),
  ...aggregateResolvedIssues(ws),
];

// ── Save preview (scan page) ─────────────────────────────────────────
export interface SavePreview {
  kind: "new-project" | "new-page" | "rescan";
  host: string;
  path: string;
  /** Comparison vs the page baseline (only for "rescan"). */
  diff?: { scoreDelta: number; resolved: number; regressions: number };
  /** Existing page baseline score (only for "rescan"). */
  baselineScore?: number;
  /** Pages already tracked on the project (for "new-page"). */
  existingPages?: number;
}

export const previewSave = (ws: Workspace | null, pending: PendingScan): SavePreview => {
  const project = ws?.projects.find((p) => p.host === pending.host);
  if (!project) return { kind: "new-project", host: pending.host, path: pending.path };

  const page = project.pages.find((pg) => pg.path === pending.path);
  if (!page) {
    return {
      kind: "new-page",
      host: pending.host,
      path: pending.path,
      existingPages: project.pages.length,
    };
  }

  const baselineTitles = new Set(page.baseline.issues.map((i) => i.title));
  const nextTitles = new Set(pending.issues.map((i) => i.title));
  return {
    kind: "rescan",
    host: pending.host,
    path: pending.path,
    baselineScore: page.baseline.score,
    diff: {
      scoreDelta: pending.score - page.baseline.score,
      resolved: page.open.filter((i) => !nextTitles.has(i.title)).length,
      regressions: pending.issues.filter((i) => !baselineTitles.has(i.title)).length,
    },
  };
};

/** Compact "2 min ago" style formatting for ISO timestamps. */
export const relativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
};

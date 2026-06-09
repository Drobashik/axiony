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

export const pendingFromReport = (report: ReportLike): PendingScan => ({
  url: report.url,
  host: hostFromUrl(report.url),
  path: pathFromUrl(report.url),
  level: report.level,
  score: report.score,
  counts: report.counts,
  total: report.issues.length,
  issues: report.issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    severity: issue.severity,
    rule: issue.rule,
    count: issue.nodes.length,
    status: "open" as const,
    description: issue.description,
    wcag: issue.wcag,
    nodes: issue.nodes,
    fix: issue.fix,
    whatHappened: issue.whatHappened,
    whyItMatters: issue.whyItMatters,
    suggestedFix: issue.suggestedFix,
    beforeCode: issue.beforeCode,
    afterCode: issue.afterCode,
    code: issue.code,
  })),
  scannedAt: report.scannedAt.toISOString(),
});

// ── Page / project / workspace roll-ups ──────────────────────────────
export interface PageModel {
  latestScore: number;
  baselineScore: number;
  scoreDelta: number;
  openIssues: number;
  debt: number;
  hasFollowups: boolean;
  scanCount: number;
  trendScores: number[];
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
    scoreDelta: latest.score - page.baseline.score,
    openIssues: page.open.length,
    debt: page.baseline.total,
    hasFollowups: followups.length > 0,
    scanCount: page.scans.length,
    trendScores: page.scans.map((s) => s.score),
    regressionsCaught: followups.reduce((sum, s) => sum + s.regressions.length, 0),
    resolvedTotal: followups.reduce((sum, s) => sum + s.resolved, 0),
    lastScannedAt: latest.scannedAt,
    counts: latest.counts,
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
}

export const allPages = (ws: Workspace): ProjectPage[] => ws.projects.flatMap((p) => p.pages);

export const totalOpenIssues = (ws: Workspace): number =>
  allPages(ws).reduce((sum, page) => sum + page.open.length, 0);

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
}

/** All currently-open issues across the workspace, worst-first. */
export const aggregateOpenIssues = (ws: Workspace): LocatedIssue[] => {
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

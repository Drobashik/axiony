import {
  aggregateOpenIssues,
  pageModel,
  projectModel,
  workspaceChangeDigest,
  workspaceSummary,
} from "@/lib/workspace";
import type { LocatedIssue, Project, Workspace, WorkspaceChangeDigest } from "@/lib/workspace";
import type { Severity } from "@/types";
import type { PortfolioOverviewModel, ProjectHealthRow, WindowDays } from "./types";

const severityRank: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

export const plural = (value: number, singular: string, pluralForm = `${singular}s`): string =>
  `${value} ${value === 1 ? singular : pluralForm}`;

export const signed = (value: number): string =>
  value === 0 ? "±0" : `${value > 0 ? "+" : ""}${value}`;

export const scoreStatus = (score: number): string => {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  return "Needs attention";
};

export const movementTone = (
  event: WorkspaceChangeDigest["events"][number],
): "good" | "alert" | "neutral" => {
  if (event.regressions > 0) return "alert";
  if (event.resolved > 0 || event.scoreDelta > 0) return "good";
  return "neutral";
};

export const movementSummary = (event: WorkspaceChangeDigest["events"][number]): string => {
  const parts: string[] = [];
  if (event.resolved > 0) parts.push(`${event.resolved} fixed`);
  if (event.regressions > 0) parts.push(plural(event.regressions, "new regression"));
  if (event.scoreDelta !== 0) parts.push(`score ${signed(event.scoreDelta)}`);
  return parts.length > 0 ? parts.join(" · ") : "No issue movement";
};

export const movementLabel = (row: ProjectHealthRow): string => {
  if (row.regressions > 0) return plural(row.regressions, "regression");
  if (row.resolved > 0) return `${row.resolved} fixed`;
  if (row.movementScore !== 0) return `Score ${signed(row.movementScore)}`;
  return "Stable";
};

const baselineAverage = (project: Project): number => {
  if (project.pages.length === 0) return 0;
  return Math.round(
    project.pages.reduce((sum, page) => sum + page.baseline.score, 0) / project.pages.length,
  );
};

const attentionFor = ({
  regressions,
  critical,
  serious,
  recentPages,
  pageCount,
  score,
}: Pick<
  ProjectHealthRow,
  "regressions" | "critical" | "serious" | "recentPages" | "pageCount" | "score"
>): Pick<ProjectHealthRow, "attentionPriority" | "attentionReason"> => {
  if (regressions > 0) {
    return {
      attentionPriority: 5000 + regressions * 100,
      attentionReason: plural(regressions, "new regression"),
    };
  }
  if (critical > 0) {
    return {
      attentionPriority: 4000 + critical * 100,
      attentionReason: plural(critical, "critical issue"),
    };
  }
  if (score < 80) {
    return {
      attentionPriority: 3000 + (80 - score),
      attentionReason: `Score ${score} is below target`,
    };
  }
  if (recentPages < pageCount) {
    return {
      attentionPriority: 2000 + (pageCount - recentPages) * 10,
      attentionReason: plural(
        pageCount - recentPages,
        "page needs a fresh scan",
        "pages need a fresh scan",
      ),
    };
  }
  if (serious > 0) {
    return {
      attentionPriority: 1000 + serious,
      attentionReason: plural(serious, "serious issue"),
    };
  }
  return { attentionPriority: 0, attentionReason: null };
};

const buildProjectRows = (
  workspace: Workspace,
  digest: WorkspaceChangeDigest,
  windowDays: WindowDays,
): ProjectHealthRow[] => {
  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;

  return workspace.projects.map((project) => {
    const model = projectModel(project);
    const events = digest.events.filter((event) => event.host === project.host);
    const regressions = events.reduce((sum, event) => sum + event.regressions, 0);
    const resolved = events.reduce((sum, event) => sum + event.resolved, 0);
    const movementScore = events.reduce((sum, event) => sum + event.scoreDelta, 0);
    const recentPages = project.pages.filter(
      (page) => new Date(pageModel(page).lastScannedAt).getTime() >= cutoff,
    ).length;
    const attention = attentionFor({
      regressions,
      critical: model.counts.critical,
      serious: model.counts.serious,
      recentPages,
      pageCount: model.pageCount,
      score: model.avgScore,
    });

    return {
      project,
      score: model.avgScore,
      scoreDelta: model.avgScore - baselineAverage(project),
      openIssues: model.openIssues,
      critical: model.counts.critical,
      serious: model.counts.serious,
      regressions,
      resolved,
      movementScore,
      recentPages,
      pageCount: model.pageCount,
      lastScannedAt: model.lastScannedAt,
      ...attention,
    };
  });
};

const priorityIssues = (issues: LocatedIssue[]): LocatedIssue[] =>
  [...issues].sort((left, right) => {
    if (left.isRegression !== right.isRegression) return left.isRegression ? -1 : 1;
    const severity = severityRank[left.issue.severity] - severityRank[right.issue.severity];
    if (severity !== 0) return severity;
    return right.issue.count - left.issue.count;
  });

export const buildPortfolioOverviewModel = (
  workspace: Workspace,
  windowDays: WindowDays,
): PortfolioOverviewModel | null => {
  const summary = workspaceSummary(workspace);
  if (!summary) return null;

  const digest = workspaceChangeDigest(workspace, windowDays);
  const rows = buildProjectRows(workspace, digest, windowDays);
  const issues = priorityIssues(aggregateOpenIssues(workspace));
  const baselineScore = Math.round(
    workspace.projects.reduce(
      (sum, project) =>
        sum + project.pages.reduce((pageSum, page) => pageSum + page.baseline.score, 0),
      0,
    ) / summary.pageCount,
  );
  const attention = rows
    .filter((row) => row.attentionPriority > 0)
    .sort((left, right) => right.attentionPriority - left.attentionPriority);
  const healthyCount = rows.length - attention.length;
  const latestScan = rows.reduce(
    (latest, row) => (row.lastScannedAt > latest ? row.lastScannedAt : latest),
    "",
  );
  const support =
    attention.length === 0
      ? `All ${plural(rows.length, "project")} are stable.`
      : `${plural(healthyCount, "project")} stable · ${plural(attention.length, "project")} ${attention.length === 1 ? "needs" : "need"} attention.`;
  const movementParts = [
    digest.resolved > 0 ? `${digest.resolved} fixed` : null,
    digest.regressions > 0 ? plural(digest.regressions, "new regression") : null,
    digest.netScoreDelta !== 0 ? `score ${signed(digest.netScoreDelta)}` : null,
  ].filter((part): part is string => Boolean(part));

  return {
    summary,
    digest,
    rows,
    issues,
    attention,
    latestScan,
    scoreDelta: summary.avgScore - baselineScore,
    support,
    movementParts,
  };
};

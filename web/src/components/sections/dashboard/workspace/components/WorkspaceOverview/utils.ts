import type { SeverityCounts } from "@/lib/scan/issues";
import { aggregateOpenIssues, pageLabel, pageModel, workspaceChangeDigest } from "@/lib/workspace";
import type { ProjectPage, ScanRecord, TrendPoint, Workspace } from "@/lib/workspace";
import type { Severity } from "@/types";
import type {
  FreshnessStatus,
  NextAction,
  PageHealthRow,
  PriorityFix,
  ProjectActivityItem,
  ProjectInsight,
  ProjectOverviewModel,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

const SEVERITIES: readonly Severity[] = ["critical", "serious", "moderate", "minor"];

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  serious: 3,
  moderate: 2,
  minor: 1,
};

const plural = (value: number, word: string): string => `${value} ${word}${value === 1 ? "" : "s"}`;

const freshnessFor = (page: ProjectPage, nowMs: number): FreshnessStatus => {
  if (page.scans.length <= 1) return "baseline";

  const latestAt = new Date(page.scans[page.scans.length - 1]?.scannedAt ?? 0).getTime();

  const ageDays = Math.max(0, (nowMs - latestAt) / DAY_MS);

  if (ageDays <= 7) return "fresh";

  if (ageDays <= 30) return "aging";

  return "stale";
};

const average = (values: number[]): number =>
  values.length > 0 ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

const sumCounts = (counts: Iterable<SeverityCounts>): SeverityCounts => {
  const total: SeverityCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };

  for (const value of counts) {
    for (const severity of SEVERITIES) {
      total[severity] += value[severity];
    }
  }

  return total;
};

interface TimedScan {
  pageId: string;
  scan: ScanRecord;
}

const projectTrend = (pages: ProjectPage[]): TrendPoint[] => {
  if (pages.length === 1) return pageModel(pages[0]).trend;

  const events: TimedScan[] = pages
    .flatMap((page) => page.scans.map((scan) => ({ pageId: page.id, scan })))
    .sort(
      (left, right) =>
        new Date(left.scan.scannedAt).getTime() - new Date(right.scan.scannedAt).getTime(),
    );

  const latestByPage = new Map<string, ScanRecord>();

  return events.map(({ pageId, scan }) => {
    latestByPage.set(pageId, scan);

    const current = [...latestByPage.values()];

    return {
      score: average(current.map((item) => item.score)),
      total: current.reduce((sum, item) => sum + item.total, 0),
      counts: sumCounts(current.map((item) => item.counts)),
      scannedAt: scan.scannedAt,
    };
  });
};

const buildPriorities = (workspace: Workspace): PriorityFix[] => {
  const groups = new Map<
    string,
    PriorityFix & { paths: Set<string>; severityRank: number; priority: number }
  >();

  for (const located of aggregateOpenIssues(workspace)) {
    const key = located.issue.rule || located.issue.title;

    const rank = SEVERITY_RANK[located.issue.severity];

    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        key,
        title: located.issue.title,
        rule: located.issue.rule,
        severity: located.issue.severity,
        occurrences: located.issue.count,
        pages: 1,
        paths: new Set([located.path]),
        isRegression: located.isRegression,
        severityRank: rank,
        priority: rank * 1000 + (located.isRegression ? 500 : 0) + located.issue.count,
      });
      continue;
    }

    current.occurrences += located.issue.count;
    current.paths.add(located.path);
    current.pages = current.paths.size;
    current.isRegression ||= located.isRegression;
    current.priority += located.issue.count + (located.isRegression ? 50 : 0);

    if (rank > current.severityRank) {
      current.severity = located.issue.severity;
      current.severityRank = rank;
    }
  }

  return [...groups.values()]
    .sort((left, right) => right.priority - left.priority)
    .slice(0, 3)
    .map((group) => ({
      key: group.key,
      title: group.title,
      rule: group.rule,
      severity: group.severity,
      occurrences: group.occurrences,
      pages: group.pages,
      isRegression: group.isRegression,
    }));
};

const healthCopy = (
  score: number,
  counts: SeverityCounts,
  openIssues: number,
  regressions: number,
): { title: string; text: string } => {
  if (openIssues === 0) {
    return {
      title: "Looking healthy",
      text: "No actionable issues are open in the current scope.",
    };
  }

  if (counts.critical > 0 || score < 65) {
    return {
      title: "Critical issues need attention",
      text: `${plural(counts.critical, "critical issue")} and ${plural(openIssues, "open issue")} are affecting this scope.`,
    };
  }

  if (regressions > 0 || counts.serious > 0) {
    return {
      title: "Good foundation, but needs attention",
      text:
        regressions > 0
          ? `${plural(regressions, "new regression")} should be reviewed before the next release.`
          : `${plural(counts.serious, "serious issue")} should be fixed first.`,
    };
  }

  return {
    title: score >= 90 ? "Strong accessibility health" : "Accessibility health is improving",
    text: `${plural(openIssues, "open issue")} remain, with no critical blockers detected.`,
  };
};

const nextActionFor = ({
  currentRegressions,
  criticalIssues,
  seriousIssues,
  stalePages,
  hasFollowups,
  openIssues,
}: {
  currentRegressions: number;
  criticalIssues: number;
  seriousIssues: number;
  stalePages: number;
  hasFollowups: boolean;
  openIssues: number;
}): NextAction => {
  if (currentRegressions > 0) {
    return {
      title: "Review new regressions",
      text: `${plural(currentRegressions, "regression")} appeared outside the saved baseline.`,
      label: "Review regressions",
      icon: "bolt",
      target: "issues",
      tone: "risk",
    };
  }

  if (criticalIssues > 0 || seriousIssues > 0) {
    const count = criticalIssues || seriousIssues;
    const severity = criticalIssues > 0 ? "critical" : "serious";
    return {
      title: `Fix ${severity} issues first`,
      text: `${plural(count, `${severity} issue`)} currently have the highest impact.`,
      label: "Open priority issues",
      icon: "bolt",
      target: "issues",
      tone: criticalIssues > 0 ? "risk" : "watch",
    };
  }

  if (stalePages > 0) {
    return {
      title: "Refresh stale results",
      text: `${plural(stalePages, "page")} no longer have a recent follow-up scan.`,
      label: "Run a fresh scan",
      icon: "scan",
      target: "scan",
      tone: "watch",
    };
  }

  if (!hasFollowups) {
    return {
      title: "Create the first comparison",
      text: "Run a follow-up scan to see what was fixed and what regressed.",
      label: "Run follow-up scan",
      icon: "scan",
      target: "scan",
      tone: "neutral",
    };
  }

  if (openIssues > 0) {
    return {
      title: "Keep reducing tracked debt",
      text: `${plural(openIssues, "open issue")} remain in the current scope.`,
      label: "Review open issues",
      icon: "check",
      target: "issues",
      tone: "neutral",
    };
  }

  return {
    title: "Keep the project monitored",
    text: "The current scope is clean. Re-scan after the next meaningful change.",
    label: "Run a new scan",
    icon: "scan",
    target: "scan",
    tone: "good",
  };
};

const buildActivity = (pages: ProjectPage[]): ProjectActivityItem[] =>
  pages
    .flatMap((page) =>
      page.scans.map((scan, index) => ({
        id: `${page.id}:${scan.id}`,
        page,
        scannedAt: scan.scannedAt,
        score: scan.score,
        scoreDelta: index > 0 ? scan.score - page.scans[index - 1].score : 0,
        resolved: scan.resolved,
        regressions: scan.regressions.length,
        isBaseline: index === 0,
      })),
    )
    .sort((left, right) => new Date(right.scannedAt).getTime() - new Date(left.scannedAt).getTime())
    .slice(0, 5);

const buildInsights = ({
  pages,
  priorities,
  stalePages,
}: {
  pages: PageHealthRow[];
  priorities: PriorityFix[];
  stalePages: number;
}): ProjectInsight[] => {
  const insights: ProjectInsight[] = [];

  const worstPage = pages.length > 1 ? [...pages].sort((a, b) => a.score - b.score)[0] : null;

  if (worstPage) {
    insights.push({
      id: "lowest-page",
      title: `${worstPage.page.path} needs the most attention`,
      text: `Lowest score at ${worstPage.score}, with ${plural(worstPage.openIssues, "open issue")}.`,
      icon: "globe",
      tone: worstPage.score < 70 ? "risk" : "watch",
    });
  }

  const recurring = priorities.find((priority) => priority.pages > 1);

  if (recurring) {
    insights.push({
      id: "recurring-rule",
      title: "Recurring pattern detected",
      text: `${recurring.rule} appears across ${plural(recurring.pages, "page")}.`,
      icon: "selector",
      tone: "watch",
    });
  }

  if (stalePages > 0) {
    insights.push({
      id: "scan-freshness",
      title: `${plural(stalePages, "page")} need a fresh scan`,
      text: "Refresh older results to keep project health trustworthy.",
      icon: "scan",
      tone: "neutral",
    });
  }

  return insights.slice(0, 3);
};

export const buildProjectOverviewModel = (
  workspace: Workspace,
  selectedPagePath: string | null,
  nowMs = Date.now(),
): ProjectOverviewModel | null => {
  const project = workspace.projects[0];

  if (!project || project.pages.length === 0) return null;

  const scopePage = selectedPagePath
    ? (project.pages.find((page) => page.path === selectedPagePath) ?? project.pages[0])
    : null;

  const pages = scopePage ? [scopePage] : project.pages;

  const scopedWorkspace = scopePage
    ? { ...workspace, projects: [{ ...project, pages: [scopePage] }] }
    : workspace;

  const models = pages.map(pageModel);

  const score = average(models.map((model) => model.latestScore));

  const baselineScore = average(pages.map((page) => page.baseline.score));

  const scoreDelta = score - baselineScore;

  const open = aggregateOpenIssues(scopedWorkspace);

  const counts = sumCounts(models.map((model) => model.counts));

  const currentRegressions = open.filter((issue) => issue.isRegression).length;

  const scanCount = models.reduce((sum, model) => sum + model.scanCount, 0);

  const digest = workspaceChangeDigest(scopedWorkspace);

  const pageRows: PageHealthRow[] = pages.map((page) => {
    const model = pageModel(page);

    return {
      page,
      score: model.latestScore,
      scoreDelta: model.scoreDelta,
      openIssues: model.openIssues,
      regressions: aggregateOpenIssues({
        ...workspace,
        projects: [{ ...project, pages: [page] }],
      }).filter((issue) => issue.isRegression).length,
      lastScannedAt: model.lastScannedAt,
      freshness: freshnessFor(page, nowMs),
    };
  });

  const stalePages = pageRows.filter(
    (row) => row.freshness === "aging" || row.freshness === "stale",
  ).length;

  const freshPages = pageRows.filter((row) => row.freshness === "fresh").length;

  const priorities = buildPriorities(scopedWorkspace);

  const health = healthCopy(score, counts, open.length, currentRegressions);

  const hasFollowups = models.some((model) => model.hasFollowups);

  const lastScannedAt = models.reduce(
    (latest, model) => (model.lastScannedAt > latest ? model.lastScannedAt : latest),
    "",
  );

  return {
    project,
    scopePage,
    isPageScope: scopePage !== null,
    label: scopePage ? pageLabel(project.host, scopePage.path) : project.host,
    url: scopePage?.url ?? project.pages[0]?.url ?? `https://${project.host}`,
    score,
    baselineScore,
    scoreDelta,
    openIssues: open.length,
    severityCounts: counts,
    pageCount: pages.length,
    scanCount,
    lastScannedAt,
    healthTitle: health.title,
    healthText: health.text,
    digest,
    nextAction: nextActionFor({
      currentRegressions,
      criticalIssues: counts.critical,
      seriousIssues: counts.serious,
      stalePages,
      hasFollowups,
      openIssues: open.length,
    }),
    priorities,
    insights: buildInsights({
      pages: pageRows,
      priorities,
      stalePages,
    }),
    pages: pageRows.sort((left, right) => left.score - right.score),
    freshPages,
    trend: projectTrend(pages),
    baselineTrendScore: baselineScore,
    baselineTrendTotal: pages.reduce((sum, page) => sum + page.baseline.total, 0),
    activity: buildActivity(pages),
  };
};

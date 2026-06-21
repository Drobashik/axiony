import type {
  CliScanIssue,
  CliScanResult,
  Issue,
  Severity,
  SeverityCounts,
  WcagLevel,
} from "../types";
import { resolveRepair } from "./repairs";

const SEVERITY_ORDER: readonly Severity[] = [
  "critical",
  "serious",
  "moderate",
  "minor",
];
const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 10,
  serious: 5,
  moderate: 2,
  minor: 1,
};

const impactToSeverity = (impact: string): Severity =>
  SEVERITY_ORDER.includes(impact as Severity) ? (impact as Severity) : "minor";

const formatWcagTag = (tag: string): string | null => {
  const normalized = tag.toLowerCase();
  if (!normalized.startsWith("wcag")) return null;

  const raw = normalized.slice(4);
  if (/^\d{2}a{1,3}$/.test(raw)) {
    const level = raw.match(/a{1,3}$/)?.[0].toUpperCase() ?? "";
    return `WCAG ${raw[0]}.${raw[1]} (${level})`;
  }
  if (/^\d+a{1,3}$/.test(raw)) {
    const version = raw.match(/^\d+/)?.[0] ?? "";
    const level = raw.match(/a{1,3}$/)?.[0].toUpperCase() ?? "";
    return `WCAG ${version}.0 (${level})`;
  }
  if (/^\d{3}$/.test(raw)) return `${raw[0]}.${raw[1]}.${raw[2]}`;
  if (/^\d{4}$/.test(raw)) return `${raw[0]}.${raw[1]}.${raw.slice(2)}`;

  return `WCAG ${raw.toUpperCase()}`;
};

const mapWcag = (tags: string[], helpUrl: string): string[] => {
  const wcag = tags
    .map(formatWcagTag)
    .filter((tag): tag is string => Boolean(tag));
  if (wcag.length > 0) return Array.from(new Set(wcag));
  return helpUrl ? [helpUrl] : ["axe-core"];
};

const mapIssue = (
  issue: CliScanIssue,
  index: number,
  manual = false,
): Issue => {
  const nodes = issue.snippets?.length ? issue.snippets : issue.selectors;
  const firstNode = nodes[0] ?? "No affected element selector was reported.";
  const repair = resolveRepair(issue, manual, firstNode);

  return {
    id: `${manual ? "manual-" : ""}${issue.id}-${index}`,
    severity: manual ? "minor" : impactToSeverity(issue.impact),
    title: repair.title,
    description: repair.description,
    rule: issue.id,
    wcag: mapWcag(issue.tags || [], issue.helpUrl),
    nodes: nodes.length > 0 ? nodes : [firstNode],
    fix: repair.suggestedFix,
    whatHappened: repair.whatHappened,
    whyItMatters: repair.whyItMatters,
    suggestedFix: repair.suggestedFix,
    beforeCode: repair.beforeCode,
    afterCode: repair.afterCode,
    code: issue.snippets?.[0],
    animationDelay: index * 60,
  };
};

const countBySeverity = (issues: Issue[]): SeverityCounts => ({
  critical: issues.filter((issue) => issue.severity === "critical").length,
  serious: issues.filter((issue) => issue.severity === "serious").length,
  moderate: issues.filter((issue) => issue.severity === "moderate").length,
  minor: issues.filter((issue) => issue.severity === "minor").length,
});

const computeScore = (issues: Issue[]): number => {
  const penalty = issues.reduce(
    (sum, issue) =>
      sum +
      SEVERITY_WEIGHT[issue.severity] *
        (1 + Math.min(issue.nodes.length - 1, 3) * 0.1),
    0,
  );

  return Math.max(45, Math.round(100 - penalty));
};

export const toScanReportPayload = (
  result: CliScanResult,
  level: WcagLevel,
) => {
  const issues = [
    ...result.issues.map((issue, index) => mapIssue(issue, index)),
    ...result.manualChecks.map((issue, index) =>
      mapIssue(issue, result.issues.length + index, true),
    ),
  ];

  return {
    url: result.url,
    level,
    scannedAt: result.timestamp || new Date().toISOString(),
    issues,
    counts: countBySeverity(issues),
    score: computeScore(issues),
  };
};

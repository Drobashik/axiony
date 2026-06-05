import type { Severity } from "@/types";
import {
  computeScore,
  countBySeverity,
  SEVERITY_ORDER,
  type Issue,
} from "@/lib/scan/issues";
import { resolveAxeRepair } from "@/lib/scan/repair-templates";
import type { CliScanIssue, CliScanResult, ScanReportPayload, WcagLevel } from "./types";

const impactToSeverity = (impact: string): Severity =>
  SEVERITY_ORDER.includes(impact as Severity) ? (impact as Severity) : "minor";

const titleCaseRule = (value: string): string =>
  value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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

  if (/^\d{3}$/.test(raw)) {
    return `${raw[0]}.${raw[1]}.${raw[2]}`;
  }

  if (/^\d{4}$/.test(raw)) {
    return `${raw[0]}.${raw[1]}.${raw.slice(2)}`;
  }

  return `WCAG ${raw.toUpperCase()}`;
};

const mapWcag = (tags: string[], helpUrl: string): string[] => {
  const wcag = tags
    .map(formatWcagTag)
    .filter((tag): tag is string => Boolean(tag));

  if (wcag.length > 0) return Array.from(new Set(wcag));
  return helpUrl ? [helpUrl] : ["axe-core"];
};

const mapIssue = (issue: CliScanIssue, index: number, manual = false): Issue => {
  const nodes = issue.snippets?.length ? issue.snippets : issue.selectors;
  const repair = resolveAxeRepair(issue, manual);
  const title = manual ? `Manual check: ${repair.title}` : repair.title || issue.help || titleCaseRule(issue.id);
  const firstNode = nodes[0] ?? "No affected element selector was reported.";

  return {
    id: `${manual ? "manual-" : ""}${issue.id}-${index}`,
    severity: manual ? "minor" : impactToSeverity(issue.impact),
    title,
    description: repair.description,
    rule: issue.id,
    wcag: mapWcag(issue.tags, issue.helpUrl),
    nodes: nodes.length > 0 ? nodes : [firstNode],
    fix: repair.fix,
    whatHappened: repair.whatHappened,
    whyItMatters: repair.whyItMatters,
    suggestedFix: repair.suggestedFix,
    beforeCode: repair.beforeCode,
    afterCode: repair.afterCode,
    code: issue.snippets?.[0],
    animationDelay: index * 60,
  };
};

export const toScanReportPayload = (
  result: CliScanResult,
  level: WcagLevel,
): ScanReportPayload => {
  const issues = [
    ...result.issues.map((issue, index) => mapIssue(issue, index)),
    ...result.manualChecks.map((issue, index) => mapIssue(issue, result.issues.length + index, true)),
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

import type {
  ScanIssue,
  ScanOutputFormat,
  ScanResult,
} from '../../core/scan/types';
import { text } from '../terminal/styles';

const severityOrder = ['critical', 'serious', 'moderate', 'minor', 'unknown'];

const severityStyle = (severity: string): ((value: string) => string) => {
  switch (severity) {
    case 'critical':
    case 'serious':
      return text.danger;
    case 'moderate':
      return text.warning;
    case 'minor':
      return text.info;
    default:
      return text.muted;
  }
};

const titleCase = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1);

const sortIssues = (issues: ScanIssue[]): ScanIssue[] =>
  [...issues].sort((left, right) => {
    const severityDelta =
      severityOrder.indexOf(left.impact) - severityOrder.indexOf(right.impact);

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return left.id.localeCompare(right.id);
  });

const formatSelectors = (selectors: string[]): string => {
  if (selectors.length <= 3) {
    return selectors.join(', ');
  }

  const preview = selectors.slice(0, 3).join(', ');
  return `${preview} ${text.muted(`+${selectors.length - 3} more`)}`;
};

const formatSeveritySummary = (issues: ScanIssue[]): string =>
  severityOrder
    .map((severity) => {
      const count = issues.filter((issue) => issue.impact === severity).length;
      if (count === 0) {
        return null;
      }

      return severityStyle(severity)(`${count} ${severity}`);
    })
    .filter((entry): entry is string => Boolean(entry))
    .join(text.muted('  |  '));

const groupIssuesBySeverity = (
  issues: ScanIssue[],
): ReadonlyArray<readonly [string, ScanIssue[]]> => {
  const grouped = new Map<string, ScanIssue[]>();

  for (const issue of sortIssues(issues)) {
    const bucket = grouped.get(issue.impact) ?? [];
    bucket.push(issue);
    grouped.set(issue.impact, bucket);
  }

  return severityOrder
    .map((severity) => [severity, grouped.get(severity) ?? []] as const)
    .filter(([, entries]) => entries.length > 0);
};

const formatIssue = (issue: ScanIssue): string => {
  const severity = severityStyle(issue.impact)(titleCase(issue.impact));

  return [
    `${severity} ${text.bold(issue.id)}`,
    `${text.muted('Fix:')} ${issue.help}`,
    `${text.muted('Why:')} ${issue.description}`,
    `${text.muted('Elements:')} ${formatSelectors(issue.selectors)}`,
  ].join('\n');
};

const formatManualCheck = (issue: ScanIssue): string =>
  [
    text.bold(issue.id),
    `${text.muted('Check:')} ${issue.help}`,
    `${text.muted('Elements:')} ${formatSelectors(issue.selectors)}`,
  ].join('\n');

export const formatScanReport = (result: ScanResult): string => {
  const issueCount = result.issues.length;
  const manualCheckCount = result.manualChecks.length;
  const elementCount = result.issues.reduce(
    (count, issue) => count + issue.selectors.length,
    0,
  );
  const statusLine =
    issueCount === 0
      ? `${text.success('PASS')} No accessibility issues detected`
      : `${text.warning('ISSUES FOUND')} ${issueCount} rule violation(s) across ${elementCount} element(s)`;

  const lines: string[] = [
    '',
    text.bold('Axiony Accessibility Scan'),
    `${text.muted('Target:')} ${result.url}`,
  ];

  if (result.metadata?.selector) {
    lines.push(`${text.muted('Selector:')} ${result.metadata.selector}`);
  }

  lines.push(`${text.muted('Status:')} ${statusLine}`);

  if (issueCount > 0) {
    lines.push(
      `${text.muted('Severity:')} ${formatSeveritySummary(result.issues)}`,
    );

    for (const [severity, issues] of groupIssuesBySeverity(result.issues)) {
      lines.push('');
      lines.push(
        `${severityStyle(severity)(text.bold(titleCase(severity)))} ${text.muted(`(${issues.length})`)}`,
      );

      for (const issue of issues) {
        lines.push(formatIssue(issue));
        lines.push('');
      }

      lines.pop();
    }
  }

  if (manualCheckCount > 0) {
    lines.push('');
    lines.push(
      `${text.info(text.bold('Manual checks'))} ${text.muted(`(${manualCheckCount})`)}`,
    );

    for (const issue of sortIssues(result.manualChecks)) {
      lines.push(formatManualCheck(issue));
      lines.push('');
    }

    lines.pop();
  }

  lines.push('');
  lines.push(
    issueCount === 0
      ? `${text.muted('Summary:')} ${text.success('Ready to ship with no axe violations.')}`
      : `${text.muted('Summary:')} Review the ${issueCount} highlighted rule violation(s) and re-run ${text.bold('axiony scan')} after fixes.`,
  );

  return lines.join('\n');
};

export const formatScanOutput = (
  result: ScanResult,
  format: ScanOutputFormat,
): string => {
  if (format === 'json') {
    return JSON.stringify(result, null, 2);
  }

  return formatScanReport(result);
};

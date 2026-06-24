"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui";
import { SEVERITY_LABEL, SEVERITY_ORDER, scoreGrade, sortIssues } from "@/lib/scan/issues";
import type { FilterValue } from "@/lib/scan/issues";
import type { ScanReport } from "../types";
import { BaselineCallout } from "./BaselineCallout";
import { CopyButton } from "./CopyButton";
import { IssueExplorer } from "./IssueExplorer";
import { ScoreDial } from "./ScoreDial";
import { SeverityBar } from "./SeverityBar";
import { StatTiles } from "./StatTiles";
import { DownloadIcon, RefreshIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface ReportViewProps {
  report: ScanReport;
  reduce: boolean;
  onRescan: () => void;
  /** In the dashboard the scan is auto-saved, so the in-report "save
   * baseline" callout is hidden (the dashboard shows its own confirmation). */
  embedded?: boolean;
  guestPreview?: boolean;
  onCreateAccount?: () => void;
}

const guestPreviewIssueIds = (report: ScanReport): string[] => {
  const sorted = sortIssues(report.issues, "severity");
  return SEVERITY_ORDER.map(
    (severity) => sorted.find((issue) => issue.severity === severity)?.id,
  ).filter((id): id is string => Boolean(id));
};

const buildSummary = (report: ScanReport): string => {
  const grade = scoreGrade(report.score);
  const lines = [
    `Axiony cloud scan — ${report.url}`,
    `Score: ${report.score}/100 (${grade.letter} · ${grade.label}) · WCAG ${report.level}`,
    `${report.issues.length} issues found:`,
    ...SEVERITY_ORDER.map((s) => `  • ${report.counts[s]} ${SEVERITY_LABEL[s]}`),
  ];
  return lines.join("\n");
};

export const ReportView = ({
  report,
  reduce,
  onRescan,
  embedded,
  guestPreview,
  onCreateAccount,
}: ReportViewProps) => {
  const [filter, setFilter] = useState<FilterValue>("all");

  const total = report.issues.length;
  const previewIssueIds = useMemo(
    () => (guestPreview ? guestPreviewIssueIds(report) : undefined),
    [guestPreview, report],
  );
  const lockedIssueCount = previewIssueIds
    ? Math.max(0, report.issues.length - previewIssueIds.length)
    : 0;

  const exportJson = () => {
    if (typeof window === "undefined") return;
    const data = {
      url: report.url,
      scannedAt: report.scannedAt.toISOString(),
      level: report.level,
      score: report.score,
      total,
      counts: report.counts,
      issues: report.issues.map(
        ({
          id,
          severity,
          title,
          description,
          rule,
          wcag,
          nodes,
          fix,
          whatHappened,
          whyItMatters,
          suggestedFix,
          beforeCode,
          afterCode,
        }) => ({
          id,
          severity,
          title,
          description,
          rule,
          wcag,
          nodes,
          fix,
          whatHappened,
          whyItMatters,
          suggestedFix,
          beforeCode,
          afterCode,
        }),
      ),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "axiony-report.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className={styles.report}>
      <div className={styles.reportHead}>
        <div className={styles.reportTarget}>
          <span className={styles.reportKicker}>
            Accessibility report
            <span className={styles.sampleBadge}>Live scan</span>
          </span>
          <span className={styles.reportUrl}>{report.url}</span>
          <span className={styles.reportMeta}>
            WCAG {report.level} ·{" "}
            {report.scannedAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>

        <div className={styles.reportActions}>
          {guestPreview && onCreateAccount ? (
            <Button variant="secondary" size="sm" onClick={onCreateAccount}>
              <DownloadIcon size={14} />
              Sign up to export
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={exportJson}>
              <DownloadIcon size={14} />
              Export JSON
            </Button>
          )}
          <CopyButton text={buildSummary(report)} label="Copy summary" />
          <Button variant="ghost" size="sm" onClick={onRescan}>
            <RefreshIcon size={14} />
            Rescan
          </Button>
        </div>
      </div>

      <div className={styles.scorePanel}>
        <ScoreDial score={report.score} reduce={reduce} />
        <SeverityBar counts={report.counts} total={total} />
      </div>

      <StatTiles counts={report.counts} total={total} filter={filter} onFilter={setFilter} />

      <IssueExplorer
        issues={report.issues}
        counts={report.counts}
        filter={filter}
        onFilter={setFilter}
        previewIssueIds={previewIssueIds}
        lockedIssueCount={lockedIssueCount}
        onCreateAccount={onCreateAccount}
      />

      {!embedded && <BaselineCallout report={report} />}
    </div>
  );
};

"use client";

import { useMemo, useState } from "react";
import cn from "classnames";
import { Select } from "@/components/ui";
import { SEVERITY_LABEL } from "@/lib/scan/issues";
import {
  aggregateTrackedIssues,
  issuePersistenceKey,
  locatedIssueKey,
  pageLabel,
} from "@/lib/workspace";
import type { IssueStatus, LocatedIssue, Workspace } from "@/lib/workspace";
import type { Severity } from "@/types";
import { STATUS_OPTIONS, statusMeta } from "./issue-status";
import { IssueDetail } from "./IssueDetail";
import styles from "./Workspace.module.scss";

type Filter = "open" | "resolved" | "all";

const FILTERS: ReadonlyArray<{ id: Filter; label: string }> = [
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
];

const SEVERITIES: readonly Severity[] = ["critical", "serious", "moderate", "minor"];
type SeverityFilter = Severity | "all";

interface DetailKey {
  rowKey: string;
}

type IssueRow = LocatedIssue & { rowKey: string };

const formatIssueDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

const OpenIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

interface WorkspaceIssuesProps {
  workspace: Workspace;
  refreshWorkspace: () => Promise<void>;
}

export const WorkspaceIssues = ({ workspace, refreshWorkspace }: WorkspaceIssuesProps) => {
  const [filter, setFilter] = useState<Filter>("open");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [search, setSearch] = useState("");
  const [detailKey, setDetailKey] = useState<DetailKey | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, IssueStatus>>({});
  const [statusError, setStatusError] = useState<string | null>(null);
  const baseIssues = useMemo(() => aggregateTrackedIssues(workspace), [workspace]);
  const keyedIssues = useMemo<IssueRow[]>(
    () =>
      baseIssues.map((located, index) => ({
        ...located,
        rowKey: locatedIssueKey(located, index),
      })),
    [baseIssues],
  );
  const issues = useMemo(
    () =>
      keyedIssues.map((located) => {
        const status = statusOverrides[located.rowKey];
        return status ? { ...located, issue: { ...located.issue, status } } : located;
      }),
    [keyedIssues, statusOverrides],
  );

  const statusFiltered = issues.filter(({ issue }) => {
    if (filter === "open" && (issue.status === "resolved" || issue.status === "ignored")) {
      return false;
    }
    if (filter === "resolved" && issue.status !== "resolved") return false;
    return true;
  });

  const filtered = statusFiltered.filter(({ host, path, issue, isRegression }) => {
    if (severityFilter !== "all" && issue.severity !== severityFilter) return false;

    const q = search.trim().toLowerCase();
    if (!q) return true;

    const project = pageLabel(host, path);
    const status = statusMeta(issue.status).label;
    const haystack = [
      issue.title,
      issue.rule,
      SEVERITY_LABEL[issue.severity],
      project,
      status,
      isRegression ? "new regression" : "",
      ...(issue.wcag ?? []),
      ...(issue.nodes ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });

  const detailLoc = detailKey && issues.find((l) => l.rowKey === detailKey.rowKey);

  const changeStatus = async (located: IssueRow, status: IssueStatus) => {
    const previous = statusOverrides[located.rowKey] ?? located.issue.status;
    setStatusError(null);
    setStatusOverrides((current) => ({
      ...current,
      [located.rowKey]: status,
    }));

    try {
      const response = await fetch("/api/workspace/issues/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: located.host,
          path: located.path,
          issueKey: located.issue.issueKey ?? issuePersistenceKey(located.issue),
          status,
          createdAt: located.issue.createdAt,
        }),
      });

      if (!response.ok) throw new Error("Status update failed.");
      await refreshWorkspace();
    } catch {
      setStatusOverrides((current) => ({
        ...current,
        [located.rowKey]: previous,
      }));
      setStatusError("Could not save status. Try again.");
    }
  };

  return (
    <div className={styles.tabWrap}>
      <header className={styles.tabHead}>
        <h2>Issues</h2>
        <p>
          Open issues across your projects. Triage with a status, or open an issue for the full fix.
          Resolved issues from follow-up scans stay in history instead of disappearing.
        </p>
      </header>

      <div className={styles.issueToolbar} data-tour="issues-filters">
        <div className={styles.issueSearch}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search issues"
          />
        </div>

        <div className={styles.issueFilterChips} role="group" aria-label="Filter issues">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={cn(styles.issueFilterChip, filter === f.id && styles.issueFilterActive)}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div
          className={styles.issueSeveritySummary}
          role="group"
          aria-label="Filter issues by severity"
        >
          <button
            type="button"
            className={cn(
              styles.issueSeverityFilter,
              severityFilter === "all" && styles.issueSeverityFilterActive,
            )}
            onClick={() => setSeverityFilter("all")}
          >
            <span className={styles.issueSeverityFilterText}>All types</span>
            <span className={styles.issueSeverityFilterCount}>{statusFiltered.length}</span>
          </button>
          {SEVERITIES.map((severity) => (
            <button
              key={severity}
              type="button"
              className={cn(
                styles.issueSeverityFilter,
                styles[`issueSeverityFilter_${severity}`],
                severityFilter === severity && styles.issueSeverityFilterActive,
              )}
              onClick={() => setSeverityFilter(severity)}
            >
              <span className={styles.issueSeverityFilterDot} aria-hidden="true" />
              <span className={styles.issueSeverityFilterText}>{SEVERITY_LABEL[severity]}</span>
              <span className={styles.issueSeverityFilterCount}>
                {statusFiltered.filter((l) => l.issue.severity === severity).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      {statusError && (
        <p className={styles.issueStatusError} role="status">
          {statusError}
        </p>
      )}

      <div className={styles.issueTableCard} data-tour="issues-table">
        <div className={styles.issueTableHeader}>
          {["Issue", "Project", "Assignee", "Status", ""].map((heading) => (
            <div key={heading} className={styles.issueTableHeaderCell}>
              {heading}
            </div>
          ))}
        </div>

        {issues.length === 0 ? (
          <p className={styles.issueTableEmpty}>No tracked issues yet.</p>
        ) : filtered.length === 0 ? (
          <p className={styles.issueTableEmpty}>
            {filter === "open"
              ? "No open issues. Resolved issues are saved in the Resolved filter."
              : "No issues match the current filter."}
          </p>
        ) : (
          <ul className={styles.issueList}>
            {filtered.map((located) => {
              const { rowKey, host, path, issue, isRegression, resolvedAt } = located;
              const project = pageLabel(host, path);
              const assignedToCurrentUser = issue.status === "in-progress";
              const createdLabel = issue.createdAt
                ? `Created ${formatIssueDate(issue.createdAt)}`
                : null;
              const resolvedLabel = resolvedAt ? `Resolved ${formatIssueDate(resolvedAt)}` : null;

              return (
                <li key={rowKey} className={styles.issueTableRow}>
                  <button
                    type="button"
                    className={styles.issueTableOpen}
                    onClick={() => setDetailKey({ rowKey })}
                    aria-label={`Open ${issue.title}`}
                  >
                    <span
                      className={cn(
                        styles.issueSeverityDot,
                        styles[`issueSeverity_${issue.severity}`],
                      )}
                      aria-hidden="true"
                    />
                    <span className={styles.issueTableText}>
                      <span className={styles.issueTableTitleLine}>
                        <span className={styles.issueTableTitle}>{issue.title}</span>
                        {isRegression && <span className={styles.newPill}>New</span>}
                        {resolvedAt && <span className={styles.resolvedPill}>Resolved</span>}
                      </span>
                      <span className={styles.issueTableRule}>
                        {issue.rule} · {issue.count} occurrence{issue.count === 1 ? "" : "s"}
                        {createdLabel && (
                          <>
                            {" "}
                            · <span className={styles.issueCreatedMeta}>{createdLabel}</span>
                          </>
                        )}
                        {resolvedLabel && (
                          <>
                            {" "}
                            · <span className={styles.issueResolvedMeta}>{resolvedLabel}</span>
                          </>
                        )}
                      </span>
                    </span>
                  </button>

                  <div className={styles.issueTableProject}>{project}</div>

                  <div className={styles.issueAssigneeCell}>
                    {assignedToCurrentUser ? (
                      <span className={styles.issueAssignee}>{workspace.account.initials}</span>
                    ) : (
                      <span className={cn(styles.issueAssignee, styles.issueAssigneeEmpty)}>-</span>
                    )}
                  </div>

                  <div className={styles.issueStatusCell}>
                    <Select
                      size="sm"
                      align="end"
                      value={issue.status}
                      options={STATUS_OPTIONS}
                      ariaLabel={`Status for ${issue.title}`}
                      onChange={(v) => void changeStatus(located, v as IssueStatus)}
                    />
                  </div>

                  <button
                    type="button"
                    className={styles.issueChevron}
                    onClick={() => setDetailKey({ rowKey })}
                    aria-label={`Open ${issue.title}`}
                  >
                    <OpenIcon />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {detailLoc && (
        <IssueDetail
          located={detailLoc}
          onClose={() => setDetailKey(null)}
          onStatus={(status) => void changeStatus(detailLoc, status)}
        />
      )}
    </div>
  );
};

"use client";

import { useState } from "react";
import cn from "classnames";
import { Select } from "@/components/ui";
import { SEVERITY_LABEL } from "@/lib/scan/issues";
import { aggregateOpenIssues, setIssueStatus } from "@/lib/workspace";
import type { IssueStatus, Workspace } from "@/lib/workspace";
import type { Severity } from "@/types";
import { STATUS_OPTIONS, statusMeta } from "./issue-status";
import { IssueDetail } from "./IssueDetail";
import styles from "./Workspace.module.scss";

const pageLabel = (host: string, path: string) => `${host}${path === "/" ? "" : path}`;
const FREE_DETAIL_LIMIT = 6;

type Filter = "open" | "resolved" | "all";

const FILTERS: ReadonlyArray<{ id: Filter; label: string }> = [
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
];

const SEVERITIES: readonly Severity[] = ["critical", "serious", "moderate", "minor"];
type SeverityFilter = Severity | "all";

interface DetailKey {
  host: string;
  path: string;
  issueId: string;
}

type LocatedIssues = ReturnType<typeof aggregateOpenIssues>;

const issueKey = (host: string, path: string, issueId: string) => `${host}::${path}::${issueId}`;

const freeDetailKeys = (located: LocatedIssues): Set<string> => {
  const selected: LocatedIssues = [];
  const selectedKeys = new Set<string>();

  for (const severity of ["critical", "serious"] as const) {
    for (const item of located.filter(({ issue }) => issue.severity === severity).slice(0, 3)) {
      const key = issueKey(item.host, item.path, item.issue.id);
      if (selectedKeys.has(key)) continue;
      selected.push(item);
      selectedKeys.add(key);
    }
  }

  if (selected.length < FREE_DETAIL_LIMIT) {
    for (const item of located) {
      const key = issueKey(item.host, item.path, item.issue.id);
      if (selectedKeys.has(key)) continue;
      selected.push(item);
      selectedKeys.add(key);
      if (selected.length >= FREE_DETAIL_LIMIT) break;
    }
  }

  return selectedKeys;
};

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
  canControlIssues: boolean;
  onUpgrade: (plan?: "pro" | "team") => void;
}

export const WorkspaceIssues = ({
  workspace,
  canControlIssues,
  onUpgrade,
}: WorkspaceIssuesProps) => {
  const issues = aggregateOpenIssues(workspace);
  const [filter, setFilter] = useState<Filter>("open");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [search, setSearch] = useState("");
  const [detailKey, setDetailKey] = useState<DetailKey | null>(null);
  const unlockedDetailKeys = canControlIssues ? null : freeDetailKeys(issues);

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
    const detailsLocked = Boolean(
      unlockedDetailKeys && !unlockedDetailKeys.has(issueKey(host, path, issue.id)),
    );
    const haystack = [
      issue.title,
      issue.rule,
      SEVERITY_LABEL[issue.severity],
      project,
      status,
      isRegression ? "new regression" : "",
      ...(issue.wcag ?? []),
      ...(detailsLocked ? [] : (issue.nodes ?? [])),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });

  const detailLoc =
    detailKey &&
    issues.find(
      (l) =>
        l.host === detailKey.host && l.path === detailKey.path && l.issue.id === detailKey.issueId,
    );

  const changeStatus = (host: string, path: string, issueId: string, status: IssueStatus) => {
    if (!canControlIssues) return;
    setIssueStatus(host, path, issueId, status);
  };

  return (
    <div className={styles.tabWrap}>
      <header className={styles.tabHead}>
        <h2>Issues</h2>
        <p>
          Open issues across your projects. Triage with a status, or open an issue for the full fix.
          New issues since a page&apos;s baseline are tagged as regressions.
        </p>
      </header>

      <div className={styles.issueToolbar}>
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

      <div className={styles.issueTableCard}>
        <div className={styles.issueTableHeader}>
          {["Issue", "Project", "Assignee", "Status", ""].map((heading) => (
            <div key={heading} className={styles.issueTableHeaderCell}>
              {heading}
            </div>
          ))}
        </div>

        {issues.length === 0 ? (
          <p className={styles.issueTableEmpty}>No open issues - your baselines are clean.</p>
        ) : filtered.length === 0 ? (
          <p className={styles.issueTableEmpty}>No issues match the current filter.</p>
        ) : (
          <ul className={styles.issueList}>
            {filtered.map(({ host, path, issue, isRegression }) => {
              const project = pageLabel(host, path);
              const assignedToCurrentUser = issue.status === "in-progress";
              const detailsLocked = Boolean(
                unlockedDetailKeys && !unlockedDetailKeys.has(issueKey(host, path, issue.id)),
              );

              return (
                <li key={`${host}${path}-${issue.id}`} className={styles.issueTableRow}>
                  <button
                    type="button"
                    className={styles.issueTableOpen}
                    onClick={() => setDetailKey({ host, path, issueId: issue.id })}
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
                        {detailsLocked && (
                          <span className={styles.issueProDetailsPill}>Pro details</span>
                        )}
                      </span>
                      <span className={styles.issueTableRule}>
                        {issue.rule} · {issue.count} occurrence{issue.count === 1 ? "" : "s"}
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
                    {canControlIssues ? (
                      <Select
                        size="sm"
                        align="end"
                        value={issue.status}
                        options={STATUS_OPTIONS}
                        ariaLabel={`Status for ${issue.title}`}
                        onChange={(v) => changeStatus(host, path, issue.id, v as IssueStatus)}
                      />
                    ) : (
                      <button
                        type="button"
                        className={styles.issueLockedStatus}
                        onClick={() => onUpgrade("pro")}
                      >
                        Upgrade to triage
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className={styles.issueChevron}
                    onClick={() => setDetailKey({ host, path, issueId: issue.id })}
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
          onStatus={(status) =>
            changeStatus(detailLoc.host, detailLoc.path, detailLoc.issue.id, status)
          }
          canControlIssues={canControlIssues}
          detailsLocked={Boolean(
            unlockedDetailKeys &&
            !unlockedDetailKeys.has(issueKey(detailLoc.host, detailLoc.path, detailLoc.issue.id)),
          )}
          onUpgrade={() => onUpgrade("pro")}
        />
      )}
    </div>
  );
};

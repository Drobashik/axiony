"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import cn from "classnames";
import { ISSUES, IssueStatus } from "@/lib/data/dashboard";
import { Severity } from "@/types";
import styles from "./IssuesTab.module.scss";

type Filter = "open" | "resolved" | "all";

const FILTERS: ReadonlyArray<{ id: Filter; label: string }> = [
  { id: "open", label: "Open" },
  { id: "resolved", label: "Resolved" },
  { id: "all", label: "All" },
];

const SEVERITIES: readonly Severity[] = ["critical", "serious", "moderate", "minor"];

const STATUS_LABEL: Record<IssueStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  resolved: "Resolved",
};

export function IssuesTab() {
  const [filter, setFilter] = useState<Filter>("open");
  const [search, setSearch] = useState("");

  const filtered = ISSUES.filter((issue) => {
    if (filter === "open" && issue.status === "resolved") return false;
    if (filter === "resolved" && issue.status !== "resolved") return false;

    if (search) {
      const q = search.toLowerCase();
      if (!issue.title.toLowerCase().includes(q) && !issue.project.toLowerCase().includes(q)) {
        return false;
      }
    }

    return true;
  });

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search issues"
          />
        </div>

        <div className={styles.chips}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={cn(styles.chip, filter === f.id && styles.chipActive)}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.summary}>
          {SEVERITIES.map((sev) => (
            <Badge key={sev} severity={sev}>
              {ISSUES.filter((i) => i.severity === sev).length} {sev}
            </Badge>
          ))}
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          {["Issue", "Project", "Assignee", "Status", ""].map((h, i) => (
            <div key={i} className={styles.tableHeaderCell}>
              {h}
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>No issues match your filter.</div>
        ) : (
          filtered.map((issue) => (
            <button
              key={issue.id}
              type="button"
              className={styles.row}
              aria-label={`Issue: ${issue.title}`}
            >
              <div className={styles.issue}>
                <span
                  className={cn(styles.dot, styles[`dot_${issue.severity}`])}
                  aria-hidden="true"
                />
                <div className={styles.issueText}>
                  <div className={styles.title}>{issue.title}</div>
                  <div className={styles.rule}>
                    {issue.rule} · {issue.count} occurrence{issue.count !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <div className={styles.project}>{issue.project}</div>
              <div>
                {issue.assignee ? (
                  <div
                    className={styles.assignee}
                    style={{
                      background: `${issue.assigneeColor}22`,
                      color: issue.assigneeColor,
                    }}
                  >
                    {issue.assignee}
                  </div>
                ) : (
                  <div className={cn(styles.assignee, styles.assigneeEmpty)}>—</div>
                )}
              </div>
              <div>
                <span className={cn(styles.statusTag, styles[`statusTag_${issue.status}`])}>
                  {STATUS_LABEL[issue.status]}
                </span>
              </div>
              <div className={styles.chevron}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}

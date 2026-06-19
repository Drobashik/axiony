"use client";

import { useMemo, useState } from "react";
import cn from "classnames";
import { Select } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import { SEVERITY_LABEL, SEVERITY_ORDER, sortIssues } from "@/lib/scan/issues";
import type { FilterValue, Issue, SeverityCounts, SortValue } from "@/lib/scan/issues";
import { IssueRow } from "./IssueRow";
import { SearchIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface IssueExplorerProps {
  issues: Issue[];
  counts: SeverityCounts;
  filter: FilterValue;
  onFilter: (filter: FilterValue) => void;
  previewIssueIds?: string[];
  lockedIssueCount?: number;
  onUpgrade?: () => void;
}

const FILTERS: ReadonlyArray<{ id: FilterValue; label: string }> = [
  { id: "all", label: "All" },
  ...SEVERITY_ORDER.map((id) => ({ id, label: SEVERITY_LABEL[id] })),
];

const SORTS: SelectOption[] = [
  {
    value: "severity",
    label: "Severity",
    hint: "worst first",
    color: "var(--severity-critical)",
  },
  {
    value: "rule",
    label: "Rule ID",
    hint: "A-Z",
    color: "var(--blue)",
  },
  {
    value: "occurrences",
    label: "Occurrences",
    hint: "most nodes",
    color: "var(--green)",
  },
] as const;

export const IssueExplorer = ({
  issues,
  counts,
  filter,
  onFilter,
  previewIssueIds,
  lockedIssueCount = 0,
  onUpgrade,
}: IssueExplorerProps) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("severity");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const previewSet = useMemo(
    () => (previewIssueIds ? new Set(previewIssueIds) : null),
    [previewIssueIds],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = issues.filter((issue) => {
      if (filter !== "all" && issue.severity !== filter) return false;
      if (!q) return true;
      const locked = previewSet ? !previewSet.has(issue.id) : false;
      const searchable = [
        issue.title,
        issue.rule,
        issue.description,
        ...issue.wcag,
        ...(locked ? [] : [issue.fix, ...issue.nodes]),
      ];
      return searchable.filter(Boolean).join(" ").toLowerCase().includes(q);
    });
    return sortIssues(matched, sort);
  }, [issues, filter, previewSet, search, sort]);

  const filterCount = (id: FilterValue): number => (id === "all" ? issues.length : counts[id]);

  const allOpen = visible.length > 0 && visible.every((i) => openIds.has(i.id));

  const toggleAll = () => setOpenIds(allOpen ? new Set() : new Set(visible.map((i) => i.id)));

  const toggleOne = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={styles.explorer}>
      <div className={styles.explorerBar}>
        <div className={styles.searchField}>
          <SearchIcon className={styles.searchIcon} size={15} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search issues…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search issues"
          />
        </div>

        <Select
          className={styles.sortSelect}
          size="sm"
          align="end"
          value={sort}
          options={SORTS}
          ariaLabel="Sort issues"
          onChange={(value) => setSort(value as SortValue)}
        />

        <button
          type="button"
          className={styles.expandAll}
          onClick={toggleAll}
          disabled={visible.length === 0}
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className={styles.filterChips} role="group" aria-label="Filter issues by severity">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            className={cn(styles.chip, filter === f.id && styles.chipActive)}
            onClick={() => onFilter(f.id)}
          >
            {f.label}
            <span className={styles.chipCount}>{filterCount(f.id)}</span>
          </button>
        ))}
      </div>

      {previewSet && lockedIssueCount > 0 && (
        <div className={styles.freePreviewNotice}>
          <div>
            <span className={styles.freePreviewKicker}>Free scan preview</span>
            <p>
              Full score, severity counts, and issue list are visible. Detailed affected elements,
              repair previews, and copyable fixes are unlocked for {previewSet.size} priority
              issues.
            </p>
          </div>
          {onUpgrade && (
            <button type="button" className={styles.freePreviewAction} onClick={onUpgrade}>
              Unlock all details
            </button>
          )}
        </div>
      )}

      <div className={styles.issueList}>
        {visible.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyMark} aria-hidden="true">
              ✓
            </span>
            No issues match the current filter.
          </div>
        ) : (
          visible.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              open={openIds.has(issue.id)}
              onToggle={toggleOne}
              locked={previewSet ? !previewSet.has(issue.id) : false}
              onUpgrade={onUpgrade}
            />
          ))
        )}
      </div>
    </div>
  );
};

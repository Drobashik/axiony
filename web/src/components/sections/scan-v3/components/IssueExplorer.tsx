"use client";

import { useMemo, useState } from "react";
import cn from "classnames";
import {
  SEVERITY_LABEL,
  SEVERITY_ORDER,
  sortIssues,
} from "@/lib/scan/issues";
import type { FilterValue, Issue, SeverityCounts, SortValue } from "@/lib/scan/issues";
import { IssueRow } from "./IssueRow";
import { SearchIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface IssueExplorerProps {
  issues: Issue[];
  counts: SeverityCounts;
  filter: FilterValue;
  onFilter: (filter: FilterValue) => void;
}

const FILTERS: ReadonlyArray<{ id: FilterValue; label: string }> = [
  { id: "all", label: "All" },
  ...SEVERITY_ORDER.map((id) => ({ id, label: SEVERITY_LABEL[id] })),
];

const SORTS: ReadonlyArray<{ id: SortValue; label: string }> = [
  { id: "severity", label: "Sort: Severity" },
  { id: "rule", label: "Sort: Rule ID" },
  { id: "occurrences", label: "Sort: Occurrences" },
];

export const IssueExplorer = ({ issues, counts, filter, onFilter }: IssueExplorerProps) => {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("severity");
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matched = issues.filter((issue) => {
      if (filter !== "all" && issue.severity !== filter) return false;
      if (!q) return true;
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.rule.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.fix.toLowerCase().includes(q) ||
        issue.wcag.some((tag) => tag.toLowerCase().includes(q)) ||
        issue.nodes.some((node) => node.toLowerCase().includes(q))
      );
    });
    return sortIssues(matched, sort);
  }, [issues, filter, search, sort]);

  const filterCount = (id: FilterValue): number =>
    id === "all" ? issues.length : counts[id];

  const allOpen = visible.length > 0 && visible.every((i) => openIds.has(i.id));

  const toggleAll = () =>
    setOpenIds(allOpen ? new Set() : new Set(visible.map((i) => i.id)));

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

        <select
          className={styles.sortSelect}
          aria-label="Sort issues"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortValue)}
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        <button type="button" className={styles.expandAll} onClick={toggleAll} disabled={visible.length === 0}>
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

      <div className={styles.issueList}>
        {visible.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyMark} aria-hidden="true">✓</span>
            No issues match the current filter.
          </div>
        ) : (
          visible.map((issue) => (
            <IssueRow key={issue.id} issue={issue} open={openIds.has(issue.id)} onToggle={toggleOne} />
          ))
        )}
      </div>
    </div>
  );
};

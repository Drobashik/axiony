"use client";

import { useId } from "react";
import { Badge } from "@/components/ui";
import cn from "classnames";
import { SEVERITY_LABEL } from "@/lib/scan/issues";
import type { Issue } from "@/lib/scan/issues";
import { CopyButton } from "./CopyButton";
import { ChevronIcon, SparkleIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface IssueRowProps {
  issue: Issue;
  open: boolean;
  onToggle: (id: string) => void;
}

export const IssueRow = ({ issue, open, onToggle }: IssueRowProps) => {
  const bodyId = useId();

  return (
    <div className={cn(styles.issue, styles[`issue_${issue.severity}`])}>
      <button
        type="button"
        className={styles.issueHead}
        onClick={() => onToggle(issue.id)}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <Badge severity={issue.severity}>{SEVERITY_LABEL[issue.severity]}</Badge>
        <span className={styles.issueTitleWrap}>
          <span className={styles.issueTitle}>{issue.title}</span>
          <span className={styles.issueRule}>
            {issue.rule} · {issue.nodes.length} occurrence{issue.nodes.length !== 1 ? "s" : ""}
          </span>
        </span>
        <ChevronIcon className={cn(styles.issueChevron, open && styles.issueChevronOpen)} />
      </button>

      <div id={bodyId} className={styles.issueBody} style={{ maxHeight: open ? 720 : 0 }} aria-hidden={!open}>
        <div className={styles.issueBodyInner}>
          <div>
            <div className={styles.issueSection}>Why it matters</div>
            <p className={styles.issueDesc}>{issue.description}</p>
          </div>

          <div>
            <div className={styles.issueSection}>Affected elements ({issue.nodes.length})</div>
            <div className={styles.issueNodes}>
              {issue.nodes.map((node, i) => (
                <code key={i} className={styles.issueNode}>{node}</code>
              ))}
            </div>
          </div>

          <div>
            <div className={styles.issueSection}>Suggested fix</div>
            <p className={styles.issueFix}>{issue.fix}</p>
          </div>

          {issue.code && (
            <div>
              <div className={styles.issueCodeHead}>
                <span className={styles.aiBadge}>
                  <SparkleIcon />
                  AI fix · Pro preview
                </span>
                <CopyButton text={issue.code} label="Copy code" />
              </div>
              <pre className={styles.issueCode}>
                <code>{issue.code}</code>
              </pre>
            </div>
          )}

          <div>
            <div className={styles.issueSection}>WCAG references</div>
            <div className={styles.wcagRow}>
              {issue.wcag.map((w) => (
                <span key={w} className={styles.wcagChip}>{w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

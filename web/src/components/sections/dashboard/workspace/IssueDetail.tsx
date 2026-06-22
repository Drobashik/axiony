"use client";

import { useEffect, useRef } from "react";
import { Badge, Select } from "@/components/ui";
import { SEVERITY_LABEL, getIssueTemplate } from "@/lib/scan/issues";
import { formatHtmlSnippet, looksLikeHtml, tokenizeHtmlLine } from "@/lib/scan/html-snippet";
import { CopyButton } from "@/components/sections/scan/components/CopyButton";
import type { IssueStatus, LocatedIssue } from "@/lib/workspace";
import { pageLabel } from "@/lib/workspace";
import { STATUS_OPTIONS } from "./issue-status";
import styles from "./Workspace.module.scss";

interface IssueDetailProps {
  located: LocatedIssue;
  onClose: () => void;
  onStatus: (status: IssueStatus) => void;
  canControlIssues: boolean;
  detailsLocked: boolean;
  onUpgrade: () => void;
}

const CodeSnippet = ({ value, lineNumbers = false }: { value: string; lineNumbers?: boolean }) => {
  const formatted = formatHtmlSnippet(value.trim());
  const html = looksLikeHtml(formatted);

  return (
    <>
      {formatted.split("\n").map((line, lineIndex) => (
        <span
          key={`${line}-${lineIndex}`}
          className={
            lineNumbers
              ? styles.dialogCodeLine
              : `${styles.dialogCodeLine} ${styles.dialogCodeLinePlain}`
          }
        >
          {lineNumbers && <span className={styles.dialogLineNo}>{lineIndex + 1}</span>}
          <span className={styles.dialogCodeText}>
            {line.length === 0
              ? " "
              : html
                ? tokenizeHtmlLine(line).map((token, tokenIndex) => (
                    <span
                      key={`${token.text}-${tokenIndex}`}
                      className={styles[`dialogHtml_${token.kind}`]}
                    >
                      {token.text}
                    </span>
                  ))
                : line}
          </span>
        </span>
      ))}
    </>
  );
};

const CloseIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const IssueDetail = ({
  located,
  onClose,
  onStatus,
  canControlIssues,
  detailsLocked,
  onUpgrade,
}: IssueDetailProps) => {
  const { host, path, issue } = located;
  const template = getIssueTemplate(issue.templateId ?? issue.id);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus the dialog, trap Escape, and lock body scroll while open.
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  // Prefer the saved live scan payload; sparse reports fall back to synthetic
  // templates or generic copy.
  const nodes = issue.nodes?.length ? issue.nodes : (template?.nodes ?? []);
  const wcag = issue.wcag?.length ? issue.wcag : (template?.wcag ?? []);
  const fallbackBefore = nodes[0] ?? "Affected element not reported.";
  const whatHappened =
    issue.whatHappened ??
    template?.whatHappened ??
    issue.description ??
    template?.description ??
    `${issue.count} affected element${issue.count === 1 ? "" : "s"} failed ${issue.rule}.`;
  const whyItMatters =
    issue.whyItMatters ??
    template?.whyItMatters ??
    issue.description ??
    template?.description ??
    "This issue blocks people who rely on assistive technology from using part of the page.";
  const suggestedFix =
    issue.suggestedFix ??
    template?.suggestedFix ??
    issue.fix ??
    template?.fix ??
    "Re-run the scan locally with the free CLI for an element-level fix.";
  const beforeCode = issue.beforeCode ?? template?.beforeCode ?? fallbackBefore;
  const afterCode =
    issue.afterCode ??
    template?.afterCode ??
    issue.code ??
    template?.code ??
    `<!-- Apply the fix -->\n${fallbackBefore}`;
  const occurrenceCount = Math.max(issue.count, nodes.length);
  const page = pageLabel(host, path);
  const primaryWcag = wcag[0];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={issue.title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.dialogHead}>
          <div className={styles.dialogTitleBlock}>
            <div className={styles.dialogEyebrow}>
              <Badge severity={issue.severity}>{SEVERITY_LABEL[issue.severity]}</Badge>
              <code className={styles.dialogRule}>{issue.rule}</code>
              {primaryWcag && <span className={styles.dialogWcagMini}>{primaryWcag}</span>}
            </div>
            <h3 className={styles.dialogTitle}>{issue.title}</h3>
          </div>
          <button type="button" className={styles.dialogClose} onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </header>

        <div className={styles.dialogMeta}>
          <div className={styles.dialogMetaItem}>
            <span className={styles.dialogMetaLabel}>Page</span>
            <span className={styles.dialogMetaValue}>{page}</span>
          </div>
          <div className={styles.dialogMetaItem}>
            <span className={styles.dialogMetaLabel}>Rule</span>
            <span className={styles.dialogMetaValue}>{issue.rule}</span>
          </div>
          <div className={styles.dialogMetaItem}>
            <span className={styles.dialogMetaLabel}>Occurrences</span>
            <span className={styles.dialogMetaValue}>{occurrenceCount}</span>
          </div>
          <div className={styles.dialogMetaStatus}>
            <span className={styles.dialogMetaLabel}>Status</span>
            {canControlIssues ? (
              <Select
                size="sm"
                value={issue.status}
                options={STATUS_OPTIONS}
                onChange={(v) => onStatus(v as IssueStatus)}
                ariaLabel="Issue status"
              />
            ) : (
              <button type="button" className={styles.issueLockedStatus} onClick={onUpgrade}>
                Upgrade to triage
              </button>
            )}
          </div>
        </div>

        {detailsLocked ? (
          <div className={styles.dialogBody}>
            <section className={styles.dialogLockedPanel}>
              <span className={styles.dialogLockedKicker}>Pro details</span>
              <h4>Unlock full issue details</h4>
              <p>
                Free shows the issue summary and priority details. Upgrade to view affected
                elements, suggested fixes, repair previews, WCAG tags, and copyable code for this
                issue.
              </p>
              <div className={styles.dialogLockedMeta}>
                <span>{occurrenceCount} affected elements</span>
                <span>{issue.rule}</span>
                {primaryWcag && <span>{primaryWcag}</span>}
              </div>
              <button type="button" className={styles.dialogLockedAction} onClick={onUpgrade}>
                Unlock all issue details
              </button>
            </section>
          </div>
        ) : (
          <div className={styles.dialogBody}>
            <div className={styles.dialogBriefGrid}>
              <section className={styles.dialogBriefCard}>
                <h4 className={styles.dialogSubhead}>What happened</h4>
                <p className={styles.dialogText}>{whatHappened}</p>
              </section>

              <section className={styles.dialogBriefCard}>
                <h4 className={styles.dialogSubhead}>Why it matters</h4>
                <p className={styles.dialogText}>{whyItMatters}</p>
              </section>
            </div>

            {nodes.length > 0 && (
              <section className={styles.dialogSectionCard}>
                <div className={styles.dialogSectionHead}>
                  <h4 className={styles.dialogSubhead}>Where</h4>
                  <span className={styles.dialogCountTag}>
                    {nodes.length} element{nodes.length === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className={styles.dialogNodes}>
                  {nodes.map((node, i) => (
                    <li key={`${node}-${i}`} className={styles.dialogNodeRow}>
                      <span className={styles.dialogNodeIndex}>{i + 1}</span>
                      <code className={styles.dialogNodeCode}>
                        <CodeSnippet value={node} />
                      </code>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className={styles.dialogFixCard}>
              <div className={styles.dialogFixIcon} aria-hidden="true">
                +
              </div>
              <div>
                <h4 className={styles.dialogSubhead}>Suggested fix</h4>
                <p className={styles.dialogText}>{suggestedFix}</p>
              </div>
            </section>

            <section className={styles.dialogSectionCard}>
              <div className={styles.dialogDiffHead}>
                <div>
                  <h4 className={styles.dialogSubhead}>Repair preview</h4>
                  <p className={styles.dialogHelper}>
                    Formatted preview of the failing pattern and suggested direction.
                  </p>
                </div>
                <CopyButton text={afterCode} label="Copy fix" />
              </div>
              <div className={styles.dialogDiff}>
                <div className={styles.dialogDiffCol}>
                  <div className={styles.dialogDiffLabel} data-tone="before">
                    <span>Before</span>
                    <span className={styles.dialogDiffNote}>Current failing pattern</span>
                  </div>
                  <pre className={styles.dialogCode}>
                    <code>
                      <CodeSnippet value={beforeCode} lineNumbers />
                    </code>
                  </pre>
                </div>
                <div className={styles.dialogDiffCol}>
                  <div className={styles.dialogDiffLabel} data-tone="after">
                    <span>After</span>
                    <span className={styles.dialogDiffNote}>Suggested direction</span>
                  </div>
                  <pre className={styles.dialogCode}>
                    <code>
                      <CodeSnippet value={afterCode} lineNumbers />
                    </code>
                  </pre>
                </div>
              </div>
            </section>

            {wcag.length > 0 && (
              <section className={styles.dialogSectionCard}>
                <h4 className={styles.dialogSubhead}>WCAG success criteria</h4>
                <div className={styles.dialogTags}>
                  {wcag.map((w) => (
                    <span key={w} className={styles.dialogTag}>
                      {w}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

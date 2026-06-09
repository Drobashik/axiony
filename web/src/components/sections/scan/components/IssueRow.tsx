"use client";

import { useId } from "react";
import { Badge } from "@/components/ui";
import cn from "classnames";
import { SEVERITY_LABEL } from "@/lib/scan/issues";
import type { Issue } from "@/lib/scan/issues";
import { formatHtmlSnippet, looksLikeHtml, tokenizeHtmlLine } from "@/lib/scan/html-snippet";
import { CopyButton } from "./CopyButton";
import { ChevronIcon, SparkleIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface IssueRowProps {
  issue: Issue;
  open: boolean;
  onToggle: (id: string) => void;
  locked?: boolean;
  onUpgrade?: () => void;
}

interface FormattedWcagTag {
  prefix: string;
  criterion?: string;
  label: string;
  level?: string;
}

const HtmlSnippet = ({ value }: { value: string }) => {
  const formatted = formatHtmlSnippet(value);

  if (!looksLikeHtml(formatted)) {
    return <>{formatted}</>;
  }

  return (
    <>
      {formatted.split("\n").map((line, lineIndex) => (
        <span key={`${line}-${lineIndex}`} className={styles.htmlLine}>
          {line.length === 0
            ? " "
            : tokenizeHtmlLine(line).map((token, tokenIndex) => (
                <span key={`${token.text}-${tokenIndex}`} className={styles[`html_${token.kind}`]}>
                  {token.text}
                </span>
              ))}
        </span>
      ))}
    </>
  );
};

const formatWcagTag = (value: string): FormattedWcagTag => {
  const trimmed = value.trim();
  const criterionMatch = trimmed.match(/^(?:WCAG\s*)?(\d+\.\d+(?:\.\d+)?)\s*(.*)$/i);

  if (criterionMatch) {
    const [, criterion, rest = ""] = criterionMatch;
    const levelMatch = rest.match(/\((A{1,3})\)\s*$/);
    const label = rest.replace(/\((A{1,3})\)\s*$/, "").trim();

    return {
      prefix: "WCAG",
      criterion,
      label: label || "Success criterion",
      level: levelMatch?.[1],
    };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return {
      prefix: "DOCS",
      label: "axe guidance",
    };
  }

  if (/^wcag/i.test(trimmed)) {
    return {
      prefix: "WCAG",
      label: trimmed.replace(/^wcag\s*/i, "").trim() || trimmed,
    };
  }

  return {
    prefix: "TAG",
    label: trimmed,
  };
};

const repairDetails = (issue: Issue) => {
  const fallbackBefore = issue.nodes[0] ?? "Affected element not reported.";

  return {
    whatHappened:
      issue.whatHappened ??
      `${issue.nodes.length} affected element${issue.nodes.length === 1 ? "" : "s"} failed ${issue.rule}.`,
    whyItMatters: issue.whyItMatters ?? issue.description,
    suggestedFix: issue.suggestedFix ?? issue.fix,
    beforeCode: issue.beforeCode ?? fallbackBefore,
    afterCode: issue.afterCode ?? issue.code ?? `<!-- Apply the fix -->\n${fallbackBefore}`,
  };
};

export const IssueRow = ({ issue, open, onToggle, locked, onUpgrade }: IssueRowProps) => {
  const bodyId = useId();
  const details = repairDetails(issue);
  const primaryWcag = issue.wcag[0] ? formatWcagTag(issue.wcag[0]) : null;

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
          <span className={styles.issueMeta}>
            <span className={styles.issueRule}>{issue.rule}</span>
            {primaryWcag && (
              <span className={styles.issueWcagMini}>
                {primaryWcag.criterion
                  ? `${primaryWcag.prefix} ${primaryWcag.criterion}`
                  : primaryWcag.label}
                {primaryWcag.level && <span>{primaryWcag.level}</span>}
              </span>
            )}
            <span>
              {issue.nodes.length} occurrence{issue.nodes.length !== 1 ? "s" : ""}
            </span>
            {locked && <span className={styles.issueLockedPill}>Pro details</span>}
          </span>
        </span>
        <ChevronIcon className={cn(styles.issueChevron, open && styles.issueChevronOpen)} />
      </button>

      <div
        id={bodyId}
        className={styles.issueBody}
        style={{ maxHeight: open ? 3200 : 0 }}
        aria-hidden={!open}
      >
        <div className={styles.issueBodyInner}>
          {locked ? (
            <section className={styles.issueLockedPanel}>
              <span className={styles.issueLockedKicker}>Detailed fix locked</span>
              <h3>{issue.title}</h3>
              <p>
                Upgrade to view affected elements, formatted code, suggested repair previews, and
                copyable fixes for this issue.
              </p>
              <div className={styles.issueLockedMeta}>
                <span>{issue.nodes.length} affected elements</span>
                <span>{issue.rule}</span>
                {issue.wcag[0] && <span>{issue.wcag[0]}</span>}
              </div>
              {onUpgrade && (
                <button type="button" className={styles.issueLockedAction} onClick={onUpgrade}>
                  Unlock all issue details
                </button>
              )}
            </section>
          ) : (
            <>
              <div className={styles.issueBriefGrid}>
                <section className={styles.issueBriefCard}>
                  <div className={styles.issueSection}>What happened</div>
                  <p className={styles.issueDesc}>{details.whatHappened}</p>
                </section>

                <section className={styles.issueBriefCard}>
                  <div className={styles.issueSection}>Why it matters</div>
                  <p className={styles.issueDesc}>{details.whyItMatters}</p>
                </section>
              </div>

              <section className={styles.issueWhere}>
                <div className={styles.issueSection}>Where</div>
                <div className={styles.issueNodes}>
                  {issue.nodes.map((node, i) => (
                    <div key={`${node}-${i}`} className={styles.issueNodeRow}>
                      <span className={styles.issueNodeIndex}>{i + 1}</span>
                      <code className={styles.issueNode}>
                        <HtmlSnippet value={node} />
                      </code>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className={styles.issueSection}>Suggested fix</div>
                <div className={styles.issueFix}>
                  <SparkleIcon />
                  <p>{details.suggestedFix}</p>
                </div>
              </section>

              <section className={styles.issueRepair}>
                <div className={styles.issueCodeHead}>
                  <span className={styles.aiBadge}>
                    <SparkleIcon />
                    Repair preview
                  </span>
                  <CopyButton text={details.afterCode} label="Copy fix" />
                </div>

                <div className={styles.codeCompare}>
                  <div className={styles.codePane}>
                    <div className={styles.codePaneHead}>
                      <span>Before</span>
                      <span className={styles.codePaneNote}>Current failing pattern</span>
                    </div>
                    <pre className={cn(styles.issueCode, styles.issueCodeBefore)}>
                      <code>
                        <HtmlSnippet value={details.beforeCode} />
                      </code>
                    </pre>
                  </div>

                  <div className={styles.codePane}>
                    <div className={styles.codePaneHead}>
                      <span>After</span>
                      <span className={styles.codePaneNote}>Suggested direction</span>
                    </div>
                    <pre className={cn(styles.issueCode, styles.issueCodeAfter)}>
                      <code>
                        <HtmlSnippet value={details.afterCode} />
                      </code>
                    </pre>
                  </div>
                </div>
              </section>

              <section className={styles.issueReferences}>
                <div>
                  <div className={styles.issueSection}>Rule ID</div>
                  <code className={styles.ruleChip}>{issue.rule}</code>
                </div>
                {issue.wcag.length > 0 && (
                  <div>
                    <div className={styles.issueSection}>WCAG tags</div>
                    <div className={styles.wcagRow}>
                      {issue.wcag.map((w) => {
                        const tag = formatWcagTag(w);

                        return (
                          <span key={w} className={styles.wcagChip}>
                            <span className={styles.wcagPrefix}>{tag.prefix}</span>
                            {tag.criterion && (
                              <span className={styles.wcagCriterion}>{tag.criterion}</span>
                            )}
                            <span className={styles.wcagLabel}>{tag.label}</span>
                            {tag.level && <span className={styles.wcagLevel}>{tag.level}</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

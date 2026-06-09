"use client";

import { useEffect, useRef } from "react";
import { Badge, Select } from "@/components/ui";
import { SEVERITY_LABEL, getIssueTemplate } from "@/lib/scan/issues";
import { CopyButton } from "@/components/sections/scan-v3/components/CopyButton";
import type { IssueStatus, LocatedIssue } from "@/lib/workspace";
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

interface HtmlToken {
  kind: "punct" | "tag" | "attr" | "value" | "comment" | "text";
  text: string;
}

const HTML_TAG_BREAK_LENGTH = 88;
const HTML_TAG_BREAK_ATTRS = 3;

const VOID_HTML_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

const pageLabel = (host: string, path: string) => `${host}${path === "/" ? "" : path}`;

const looksLikeHtml = (value: string): boolean =>
  /<\/?[a-zA-Z][\w:-]*(?:\s|>|\/>)/.test(value.trim());

const getHtmlAttrs = (rawAttrs: string): string[] => {
  const attrs: string[] = [];
  const attrPattern = /(?:^|\s+)([^\s=/>]+)(?:=(".*?"|'.*?'|[^\s"'>]+))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(rawAttrs)) !== null) {
    const [, name, value] = match;
    attrs.push(value ? `${name}=${value}` : name);
  }

  return attrs;
};

const formatHtmlTagLine = (line: string, indent: string): string[] => {
  if (/^<\//.test(line) || /^<!/.test(line) || line.includes("</")) {
    return [`${indent}${line}`];
  }

  const match = line.match(/^<([a-zA-Z][\w:-]*)([\s\S]*?)(\/?)>$/);
  if (!match) return [`${indent}${line}`];

  const [, tagName, rawAttrs, slash] = match;
  if (!rawAttrs.trim() || rawAttrs.includes("<") || rawAttrs.includes(">")) {
    return [`${indent}${line}`];
  }

  const attrs = getHtmlAttrs(rawAttrs);
  const shouldBreak =
    `${indent}${line}`.length > HTML_TAG_BREAK_LENGTH ||
    attrs.length >= HTML_TAG_BREAK_ATTRS ||
    attrs.some((attr) => attr.length > 42);

  if (!shouldBreak || attrs.length === 0) {
    return [`${indent}${line}`];
  }

  return [
    `${indent}<${tagName}`,
    ...attrs.map((attr) => `${indent}  ${attr}`),
    `${indent}${slash ? "/>" : ">"}`,
  ];
};

const formatHtmlSnippet = (value: string): string => {
  const trimmed = value.trim();
  if (!looksLikeHtml(trimmed)) return value.trim();

  const expanded = trimmed.replace(/>\s*</g, ">\n<");
  let depth = 0;

  return expanded
    .split("\n")
    .map((rawLine) => {
      const line = rawLine.trim();
      if (!line) return "";

      const closing = /^<\//.test(line);
      if (closing) depth = Math.max(0, depth - 1);

      const indent = "  ".repeat(depth);
      const formatted = formatHtmlTagLine(line, indent);
      const openMatch = line.match(/^<([a-zA-Z][\w:-]*)\b/);
      const tagName = openMatch?.[1]?.toLowerCase();
      const selfClosing =
        /\/>$/.test(line) || /^<!/.test(line) || (tagName ? VOID_HTML_TAGS.has(tagName) : false);
      const closesOnSameLine = tagName ? new RegExp(`</${tagName}>$`, "i").test(line) : false;

      if (openMatch && !selfClosing && !closesOnSameLine) {
        depth += 1;
      }

      return formatted.join("\n");
    })
    .join("\n");
};

const tokenizeHtmlTag = (tag: string): HtmlToken[] => {
  if (tag.startsWith("<!--")) return [{ kind: "comment", text: tag }];

  const opening = tag.match(/^(<\/?)([a-zA-Z][\w:-]*)([\s\S]*?)(\/?>)$/);
  if (!opening) return [{ kind: "text", text: tag }];

  const [, open, tagName, rawAttrs, close] = opening;
  const tokens: HtmlToken[] = [
    { kind: "punct", text: open },
    { kind: "tag", text: tagName },
  ];

  const attrPattern = /(\s+)([^\s=/>]+)(?:=(".*?"|'.*?'|[^\s"'>]+))?/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(rawAttrs)) !== null) {
    const [full, space, name, value] = match;
    const unmatched = rawAttrs.slice(cursor, match.index);
    if (unmatched) tokens.push({ kind: "text", text: unmatched });

    tokens.push({ kind: "text", text: space });
    tokens.push({ kind: "attr", text: name });
    if (value) {
      tokens.push({ kind: "punct", text: "=" });
      tokens.push({ kind: "value", text: value });
    }

    cursor = match.index + full.length;
  }

  const remainder = rawAttrs.slice(cursor);
  if (remainder) tokens.push({ kind: "text", text: remainder });

  tokens.push({ kind: "punct", text: close });
  return tokens;
};

const tokenizeHtmlLine = (line: string): HtmlToken[] => {
  const openOnly = line.match(/^(\s*)<([a-zA-Z][\w:-]*)$/);
  if (openOnly) {
    return [
      { kind: "text", text: openOnly[1] },
      { kind: "punct", text: "<" },
      { kind: "tag", text: openOnly[2] },
    ];
  }

  const closeOnly = line.match(/^(\s*)(\/?>)$/);
  if (closeOnly) {
    return [
      { kind: "text", text: closeOnly[1] },
      { kind: "punct", text: closeOnly[2] },
    ];
  }

  const attrOnly = line.match(/^(\s*)([^\s=/>]+)(?:=(".*?"|'.*?'|[^\s"'>]+))?$/);
  if (attrOnly && !line.trim().startsWith("<")) {
    const [, space, name, value] = attrOnly;
    return [
      { kind: "text", text: space },
      { kind: "attr", text: name },
      ...(value
        ? [
            { kind: "punct" as const, text: "=" },
            { kind: "value" as const, text: value },
          ]
        : []),
    ];
  }

  const tokens: HtmlToken[] = [];
  const tagPattern = /<!--[\s\S]*?-->|<\/?[a-zA-Z][^<>]*?>/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(line)) !== null) {
    const text = line.slice(cursor, match.index);
    if (text) tokens.push({ kind: "text", text });
    tokens.push(...tokenizeHtmlTag(match[0]));
    cursor = match.index + match[0].length;
  }

  const rest = line.slice(cursor);
  if (rest) tokens.push({ kind: "text", text: rest });
  return tokens;
};

const CodeSnippet = ({ value, lineNumbers = false }: { value: string; lineNumbers?: boolean }) => {
  const formatted = formatHtmlSnippet(value);
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

  // Prefer the saved live scan payload; older localStorage records fall back
  // to synthetic templates or generic copy.
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

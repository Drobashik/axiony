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

interface FormattedWcagTag {
  prefix: string;
  criterion?: string;
  label: string;
  level?: string;
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

  const closing = slash ? "/>" : ">";

  return [
    `${indent}<${tagName}`,
    ...attrs.map((attr) => `${indent}  ${attr}`),
    `${indent}${closing}`,
  ];
};

const formatHtmlSnippet = (value: string): string => {
  const trimmed = value.trim();
  if (!looksLikeHtml(trimmed)) return value;

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
        /\/>$/.test(line) ||
        /^<!/.test(line) ||
        (tagName ? VOID_HTML_TAGS.has(tagName) : false);
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

export const IssueRow = ({ issue, open, onToggle }: IssueRowProps) => {
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
                {primaryWcag.criterion ? `${primaryWcag.prefix} ${primaryWcag.criterion}` : primaryWcag.label}
                {primaryWcag.level && <span>{primaryWcag.level}</span>}
              </span>
            )}
            <span>{issue.nodes.length} occurrence{issue.nodes.length !== 1 ? "s" : ""}</span>
          </span>
        </span>
        <ChevronIcon className={cn(styles.issueChevron, open && styles.issueChevronOpen)} />
      </button>

      <div id={bodyId} className={styles.issueBody} style={{ maxHeight: open ? 3200 : 0 }} aria-hidden={!open}>
        <div className={styles.issueBodyInner}>
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
                  <code><HtmlSnippet value={details.beforeCode} /></code>
                </pre>
              </div>

              <div className={styles.codePane}>
                <div className={styles.codePaneHead}>
                  <span>After</span>
                  <span className={styles.codePaneNote}>Suggested direction</span>
                </div>
                <pre className={cn(styles.issueCode, styles.issueCodeAfter)}>
                  <code><HtmlSnippet value={details.afterCode} /></code>
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
                        {tag.criterion && <span className={styles.wcagCriterion}>{tag.criterion}</span>}
                        <span className={styles.wcagLabel}>{tag.label}</span>
                        {tag.level && <span className={styles.wcagLevel}>{tag.level}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

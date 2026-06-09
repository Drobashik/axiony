// =====================================================================
// HTML snippet pretty-printing + tokenization for issue code previews.
// Shared by the scan studio issue rows and the dashboard issue dialog,
// which render the tokens with their own styling.
// =====================================================================

export interface HtmlToken {
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

export const looksLikeHtml = (value: string): boolean =>
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

/** Pretty-print an HTML fragment: one tag per line, indented, long tags
 * broken onto one attribute per line. Non-HTML input is returned as-is. */
export const formatHtmlSnippet = (value: string): string => {
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

/** Tokenize one line of a formatted snippet for syntax highlighting.
 * Handles the partial lines produced by formatHtmlSnippet (an opening
 * `<tag`, a lone attribute, a lone `>` / `/>`) as well as full tags. */
export const tokenizeHtmlLine = (line: string): HtmlToken[] => {
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

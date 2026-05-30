import { TerminalLine, blank, txt } from "@/components/ui/Terminal";

// =====================================================================
// Tabbed examples for the "Built for the terminal" section.
// Every snippet here is a real, runnable axiony-cli command.
// =====================================================================

export type DxTabId = "install" | "scan" | "html" | "component";

export interface DxTab {
  id: DxTabId;
  filename: string;
  /** Some tabs render as code blocks, others as terminals. */
  kind: "terminal" | "code";
  lines: TerminalLine[];
}

export const DX_EXAMPLES: Record<DxTabId, DxTab> = {
  install: {
    id: "install",
    filename: "terminal",
    kind: "terminal",
    lines: [
      [txt("# Install globally, then download the Playwright browser", "comment")],
      [txt("$", "prompt"), txt(" "), txt("npm install -g axiony-cli", "cmd")],
      [txt("$", "prompt"), txt(" "), txt("axiony install", "cmd")],
      blank,
      [txt("# Or run anything without installing", "comment")],
      [txt("$", "prompt"), txt(" "), txt("npx axiony-cli scan https://example.com", "cmd")],
    ],
  },

  scan: {
    id: "scan",
    filename: "terminal",
    kind: "terminal",
    lines: [
      [txt("# Scan any URL — local dev server, staging, production", "comment")],
      [txt("$", "prompt"), txt(" "), txt("axiony scan https://example.com", "cmd")],
      blank,
      [txt("# Scope the scan to a CSS selector", "comment")],
      [txt("$", "prompt"), txt(" "), txt("axiony scan https://example.com --selector main", "cmd")],
      blank,
      [txt("# Compact CI-friendly summary, exits non-zero on issues", "comment")],
      [txt("$", "prompt"), txt(" "), txt("axiony scan http://127.0.0.1:3000 --ci", "cmd")],
    ],
  },

  html: {
    id: "html",
    filename: "terminal",
    kind: "terminal",
    lines: [
      [txt("# Scan a static HTML file", "comment")],
      [txt("$", "prompt"), txt(" "), txt("axiony html --file ./dist/index.html", "cmd")],
      blank,
      [txt("# Or pipe in a raw HTML string", "comment")],
      [txt("$", "prompt"), txt(" "), txt("axiony html --html \"<main><img src='hero.png'></main>\"", "cmd")],
      blank,
      [txt("# Save the JSON report under axy-reports/", "comment")],
      [txt("$", "prompt"), txt(" "), txt("axiony html --file ./page.html --json --output page", "cmd")],
    ],
  },

  component: {
    id: "component",
    filename: "terminal",
    kind: "terminal",
    lines: [
      [txt("# Render a local React component and scan its DOM", "comment")],
      [txt("$", "prompt"), txt(" "), txt("axiony component ./src/Button.tsx", "cmd")],
      blank,
      [txt("# Verbose output: every selector + HTML snippet", "comment")],
      [txt("$", "prompt"), txt(" "), txt("axiony component ./src/Button.tsx --verbose", "cmd")],
      blank,
      [txt("# CI mode + JSON artifact under axy-reports/button.json", "comment")],
      [txt("$", "prompt"), txt(" "), txt("axiony component ./src/Button.tsx --ci --output button", "cmd")],
    ],
  },
};

export const DX_TAB_ORDER: DxTabId[] = ["install", "scan", "html", "component"];

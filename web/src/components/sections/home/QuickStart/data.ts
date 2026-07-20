import type { ScanTarget } from "./types";

// ── Package managers ─────────────────────────────────────────────────
// The install and the no-install runner adapt to the dev's tool of
// choice — the actual `axiony` commands are the same everywhere.
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const PACKAGE_MANAGERS: readonly PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

const INSTALL: Record<PackageManager, string> = {
  npm: "npm i -g axiony-cli",
  pnpm: "pnpm add -g axiony-cli",
  yarn: "yarn global add axiony-cli",
  bun: "bun add -g axiony-cli",
};

const RUNNER: Record<PackageManager, string> = {
  npm: "npx axiony-cli scan <url>",
  pnpm: "pnpm dlx axiony-cli scan <url>",
  yarn: "yarn dlx axiony-cli scan <url>",
  bun: "bunx axiony-cli scan <url>",
};

export const installCommand = (pm: PackageManager): string => INSTALL[pm];
export const runnerCommand = (pm: PackageManager): string => RUNNER[pm];

// ── Scan targets ─────────────────────────────────────────────────────
// The same engine runs against a deployed page, raw HTML, or a React
// component file — these are the real CLI sub-commands (scan/html/component).
// Picking one swaps the terminal's step 3 and its printed result.
export const SCAN_TARGETS: readonly ScanTarget[] = [
  {
    key: "url",
    icon: "globe",
    label: "A live URL",
    command: "axiony scan https://your-site.com",
    desc: "Any deployed page or preview deploy.",
    accent: "blue",
    step3: "scan your first page",
    scanned: "scanned your-site.com · 1 page, 132 elements",
    score: "78 / 100",
    verdict: "11 issues — 6 ready as AI patches",
  },
  {
    key: "html",
    icon: "report",
    label: "An HTML file",
    command: "axiony html --file page.html",
    desc: "Check static output before it ships.",
    accent: "green",
    step3: "check a build artifact",
    scanned: "scanned page.html · 89 elements",
    score: "82 / 100",
    verdict: "7 issues — 4 ready as AI patches",
  },
  {
    key: "component",
    icon: "code",
    label: "A React component",
    command: "axiony component Button.tsx",
    desc: "Catch issues in the source, pre-merge.",
    accent: "violet",
    step3: "scan a component in isolation",
    scanned: "rendered Button.tsx · 3 interactive states",
    score: "91 / 100",
    verdict: "2 issues — both ready as AI patches",
  },
];

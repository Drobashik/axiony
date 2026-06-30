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
export const SCAN_TARGETS: readonly ScanTarget[] = [
  {
    icon: "globe",
    label: "A live URL",
    command: "axiony scan https://acme.com",
    desc: "Any deployed page or preview deploy.",
    accent: "blue",
  },
  {
    icon: "report",
    label: "An HTML file",
    command: "axiony html --file page.html",
    desc: "Check static output before it ships.",
    accent: "green",
  },
  {
    icon: "code",
    label: "A React component",
    command: "axiony component Button.tsx",
    desc: "Catch issues in the source, pre-merge.",
    accent: "violet",
  },
];

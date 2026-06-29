import type { QuickStep } from "./types";

// ── Package managers ─────────────────────────────────────────────────
// The install (step 01) and the no-install runner adapt to the dev's
// tool of choice — the actual `axiony` commands are the same everywhere.
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

export const STEPS: QuickStep[] = [
  {
    n: "01",
    title: "Install",
    command: "npm i -g axiony-cli",
    accent: "green",
    note: (
      <>
        Then <code>axiony install</code> grabs the Playwright browser.
      </>
    ),
  },
  {
    n: "02",
    title: "Scan anything",
    command: "axiony scan https://your-site.com",
    accent: "blue",
    note: (
      <>
        Also scans HTML files and React components — <code>axiony html</code>,{" "}
        <code>axiony component</code>.
      </>
    ),
  },
];

import type { QuickStep } from "./types";

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
  {
    n: "03",
    title: "Block it in CI",
    command: "axiony scan <url> --ci",
    accent: "violet",
    note: (
      <>
        Exits non-zero on new issues (anything not in your baseline), so the build fails before
        regressions ship.
      </>
    ),
  },
];

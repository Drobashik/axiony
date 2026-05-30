import { TerminalLine, blank, txt } from "@/components/ui/Terminal";

/**
 * Lines printed by the typewriter terminal in the hero.
 * Mirrors the real `axiony scan` output: a Playwright + axe-core run
 * against a single URL, with severity counts and an exit hint.
 */
export const HERO_TERMINAL_LINES: TerminalLine[] = [
  [txt("$", "prompt"), txt(" "), txt("npx axiony-cli scan https://acme.com", "cmd")],
  [txt("  Axiony CLI v0.3.0 · powered by axe-core + Playwright", "dim")],
  blank,
  [txt("  ⠿ Loading page...", "output")],
  [txt("  ⠿ Waiting for stable DOM...", "output")],
  [txt("  ⠿ Running axe-core ruleset...", "output")],
  blank,
  [txt("  ✓ Scan completed for https://acme.com", "success")],
  blank,
  [txt("  Found ", "output"), txt("9 issues", "error")],
  [txt("  ├─ ", "output"), txt("2 critical", "error"), txt("   image-alt, label", "output")],
  [txt("  ├─ ", "output"), txt("4 serious", "warn"),  txt("    color-contrast, link-name", "output")],
  [txt("  ├─ ", "output"), txt("2 moderate", "blue"), txt("   heading-order", "output")],
  [txt("  └─ 1 minor     duplicate-id", "output")],
  blank,
  [txt("  Exit code: ", "output"), txt("1", "warn"), txt("  (issues found)", "dim")],
];

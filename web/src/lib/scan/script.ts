import { blank, txt } from "@/components/ui/Terminal";
import type { TerminalLine } from "@/components/ui/Terminal";

/** Terminal output that plays back during a scan (/scan demo). */
export const buildScanLines = (url: string): TerminalLine[] => [
  [txt("$", "prompt"), txt(" "), txt(`axiony scan ${url} --format json`, "cmd")],
  [txt("  Axiony v1.4.2  ·  WCAG 2.2 AA", "dim")],
  blank,
  [txt(`  ◈ Connecting to ${url}...`, "output")],
  [txt("  ✓ Connected (TLS 1.3, 204ms)", "success")],
  blank,
  [txt("  ◈ Rendering page...", "output")],
  [txt("  ✓ DOM ready (1,247 nodes)", "success")],
  blank,
  [txt("  ◈ Running WCAG 2.2 ruleset (92 rules)...", "output")],
  [txt("  ◈ Checking color contrast...", "output")],
  [txt("  ◈ Analysing ARIA attributes...", "output")],
  [txt("  ◈ Checking keyboard accessibility...", "output")],
  [txt("  ◈ Validating form labels...", "output")],
  [txt("  ◈ Checking focus indicators...", "output")],
  [txt("  ◈ Verifying heading structure...", "output")],
  blank,
  [txt("  ✓ Scan complete  ·  2.4s", "success")],
];

/** Index of the line at which each progress step transitions. */
export const STEP_AT_LINE: Record<number, number> = {
  3: 1,
  8: 2,
  16: 3,
};

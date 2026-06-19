import type { ScanPhase, WcagLevel } from "./types";

export const EXAMPLE_URL = "https://acme.com";

// Recognisable sites for one-tap demo scans.
export const QUICK_URLS = ["stripe.com", "github.com", "figma.com", "airbnb.com"] as const;

export const WCAG_LEVELS: readonly WcagLevel[] = ["A", "AA", "AAA"];

// Drives the scan-stage checklist. Mapped onto scan progress in the engine.
export const SCAN_PHASES: readonly ScanPhase[] = [
  { key: "connect", label: "Connecting", detail: "Opening your URL in a headless browser" },
  { key: "render", label: "Rendering page", detail: "Letting client-side rendering settle" },
  {
    key: "rules",
    label: "Running WCAG rules",
    detail: "Checking against WCAG 2.2 success criteria",
  },
  { key: "score", label: "Scoring & report", detail: "Weighting findings and grading the page" },
];

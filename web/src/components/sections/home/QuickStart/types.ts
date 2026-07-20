import type { IconName } from "@/types";

// One thing you can point the CLI at — a live URL, an HTML file, or a
// React component. Each target also carries the terminal's step-3 line and
// the result the scan prints, so picking a card rewrites the demo run.
export interface ScanTarget {
  key: "url" | "html" | "component";
  icon: IconName;
  label: string;
  command: string;
  desc: string;
  accent: "green" | "blue" | "violet";
  /** Terminal comment above the step-3 command. */
  step3: string;
  /** The ✓ line the scan prints. */
  scanned: string;
  /** Score part of the verdict line (rendered green). */
  score: string;
  /** Rest of the verdict line. */
  verdict: string;
}

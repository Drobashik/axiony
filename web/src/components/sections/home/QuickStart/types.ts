import type { IconName } from "@/types";

// One thing you can point the CLI at — a live URL, an HTML file, or a
// React component. Drives the "scan anything" trio under the terminal.
export interface ScanTarget {
  icon: IconName;
  label: string;
  command: string;
  desc: string;
  accent: "green" | "blue" | "violet";
}

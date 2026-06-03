import type { AccentColor } from "@/types";

export interface SolutionLayer {
  tier: "Free" | "Pro" | "Team";
  name: string;
  audience: string;
  limit: string;
  points: readonly string[];
  inherits?: string;
  command?: string;
  accent: AccentColor;
}

export interface BaselineStatus {
  kind: "idle" | "merge" | "block";
  text: string;
}

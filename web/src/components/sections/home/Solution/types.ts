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

export type WorkflowStatusKind = "idle" | "block" | "merge";

export interface WorkflowStep {
  key: "scan" | "pr" | "improve";
  n: string;
  label: string;
  tag: string;
  title: string;
  detail: string;
  roleLabel: string;
  roleText: string;
  points: number[];
  statusKind: WorkflowStatusKind;
  statusText: string;
  stats: {
    tracked: number;
    flagged: number;
    merged: number;
  };
}

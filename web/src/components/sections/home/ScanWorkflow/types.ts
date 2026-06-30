import type { TerminalLine } from "@/components/ui";

export type WorkflowAccent = "green" | "blue" | "violet";

export interface StepDef {
  key: string;
  n: string;
  title: string;
  tag: string;
  accent: WorkflowAccent;
  caption: string;
}

export interface TypewriterState {
  visible: TerminalLine[];
  complete: boolean;
}

// ── Step 3 · Shared team baseline ────────────────────────────────────
export interface TeamRepo {
  name: string;
  branches: number;
  /** Score before the week, then after — the viz ratchets between them. */
  from: number;
  to: number;
}

export interface TeamMember {
  initials: string;
  name: string;
  role: string;
}

export type TeamEventKind = "blocked" | "fixed" | "joined" | "clean";

export interface TeamEvent {
  actor: string;
  repo: string;
  ref: string;
  text: string;
  detail: string;
  kind: TeamEventKind;
  /** Optional Slack channel the event pings. */
  slack?: string;
}

export interface WorkflowPipelineItem {
  label: string;
  title: string;
  detail: string;
  meta: string;
  accent: WorkflowAccent;
}

export type WorkflowIssueTone = "critical" | "serious" | "moderate" | "resolved";

export interface WorkflowIssueCard {
  rule: string;
  title: string;
  owner: string;
  meta: string;
  tone: WorkflowIssueTone;
  ai?: boolean;
}

export interface WorkflowColumn {
  title: string;
  count: string;
  cards: readonly WorkflowIssueCard[];
}

export interface WorkflowMetric {
  value: string;
  label: string;
  tone: "green" | "blue" | "violet";
}

export interface WorkflowActivity {
  source: string;
  title: string;
  detail: string;
  tone: "blocked" | "merged" | "scheduled";
}

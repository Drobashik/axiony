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

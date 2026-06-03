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

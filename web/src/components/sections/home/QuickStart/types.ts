import type { ReactNode } from "react";

export interface QuickStep {
  n: string;
  title: string;
  command: string;
  note: ReactNode;
  accent: "green" | "blue" | "violet";
}

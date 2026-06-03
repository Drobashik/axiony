export type ProblemDemo = "contrast" | "screenReader" | "keyboard" | "color";

export interface ProblemItem {
  number: string;
  title: string;
  description: string;
  headline: string;
  spec: string;
  demo: ProblemDemo;
}

export type RGB = [number, number, number];

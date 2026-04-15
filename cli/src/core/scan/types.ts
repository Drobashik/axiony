export type ScanIssue = {
  id: string;
  impact: string;
  description: string;
  help: string;
  selector: string;
};

export type ScanResult = {
  url: string;
  issues: ScanIssue[];
};

type AxeNodeResult = {
  target: string[];
};

type AxeViolation = {
  id: string;
  impact?: string | null;
  description: string;
  help: string;
  nodes: AxeNodeResult[];
};

export type AxeRunResult = {
  violations: AxeViolation[];
};

export type WindowWithAxe = Window & {
  axe: {
    run: () => Promise<AxeRunResult>;
  };
};

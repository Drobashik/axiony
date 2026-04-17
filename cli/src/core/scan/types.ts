export type ScanIssue = {
  id: string;
  impact: string;
  description: string;
  help: string;
  selectors: string[];
};

export type ScanResult = {
  url: string;
  issues: ScanIssue[];
};

export type ScanOutputFormat = 'text' | 'json';

export type ScanProgressMessage =
  | 'Launching browser'
  | 'Opening page'
  | 'Injecting accessibility engine'
  | 'Running accessibility checks'
  | 'Processing results';

export type ScanUrlOptions = {
  onProgressPrint?: (message: ScanProgressMessage) => void;
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

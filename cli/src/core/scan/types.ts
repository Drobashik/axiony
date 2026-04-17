export type ScanIssue = {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  selectors: string[];
};

export type ScanResult = {
  url: string;
  timestamp: string;
  issues: ScanIssue[];
  manualChecks: ScanIssue[];
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

type AxeRuleResult = {
  id: string;
  impact?: string | null;
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: AxeNodeResult[];
};

export type AxeRunResult = {
  url: string;
  timestamp: string;
  violations: AxeRuleResult[];
  incomplete: AxeRuleResult[];
};

export type WindowWithAxe = Window & {
  axe: {
    run: () => Promise<AxeRunResult>;
  };
};

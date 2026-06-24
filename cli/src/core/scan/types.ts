export type ScanIssue = {
  id: string;
  impact: string;
  description: string;
  help: string;
  helpUrl: string;
  snippets?: string[];
  tags: string[];
  selectors: string[];
};

export type ScanResult = {
  url: string;
  timestamp: string;
  metadata?: {
    disabledRules?: string[];
    profile?: string;
    selector?: string;
    warnings?: string[];
  };
  issues: ScanIssue[];
  manualChecks: ScanIssue[];
};

export interface ScanDiagnostic {
  capturedAt: string;
  requestedUrl: string;
  finalUrl: string;
  httpStatus?: number;
  title: string;
  metaRefresh?: string;
  textLength: number;
  elementCount: number;
  formControlCount: number;
  htmlPreview: string;
}

export class ScanDiagnosticError extends Error {
  diagnostic: ScanDiagnostic;

  constructor(message: string, diagnostic: ScanDiagnostic) {
    super(message);
    this.name = 'ScanDiagnosticError';
    this.diagnostic = diagnostic;
  }
}

export type AxeRunOptions = {
  runOnly?: {
    type: 'tag';
    values: string[];
  };
  rules?: Record<string, { enabled: boolean }>;
};

export type ScanOutputFormat = 'text' | 'json';

export type ScanProgressMessage =
  | 'Launching browser'
  | 'Opening page'
  | 'Waiting for page readiness'
  | 'Retrying with a fresh browser session'
  | 'Rendering HTML'
  | 'Rendering component'
  | 'Injecting accessibility engine'
  | 'Validating selector'
  | 'Running accessibility checks'
  | 'Processing results';

export type ScanUrlOptions = {
  level?: 'A' | 'AA' | 'AAA';
  onProgressPrint?: (message: ScanProgressMessage) => void;
  selector?: string;
};

type AxeNodeResult = {
  html?: string;
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
    run: (context?: string | Document, options?: AxeRunOptions) => Promise<AxeRunResult>;
  };
};

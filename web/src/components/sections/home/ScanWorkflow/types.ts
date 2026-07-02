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

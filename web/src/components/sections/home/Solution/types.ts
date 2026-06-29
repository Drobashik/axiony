export interface SimRelease {
  /** New issues this release tries to ship. */
  ship: number;
  /** Old debt the team pays down in the same release (gated side only). */
  fix: number;
}

export interface SolutionStep {
  tag: string;
  title: string;
  text: string;
}

export interface SolutionStat {
  value: string;
  label: string;
}

export interface CommandIssue {
  rule: string;
  title: string;
  target: string;
  status: string;
  owner: string;
  tone: "new" | "ready" | "debt";
}

export interface AiFixLine {
  type: "remove" | "add" | "keep";
  code: string;
}

export interface IntegrationCheck {
  name: string;
  label: string;
  status: string;
  tone: "blocked" | "clean" | "ready";
}

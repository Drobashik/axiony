export interface SimRelease {
  /** New issues this release tries to ship. */
  ship: number;
  /** Old debt the team pays down in the same release (gated side only). */
  fix: number;
}

export interface SolutionStep {
  tag: string;
  text: string;
}

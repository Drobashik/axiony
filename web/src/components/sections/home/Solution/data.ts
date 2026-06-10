import type { SimRelease, SolutionStep } from "./types";

// ── Release simulator script ─────────────────────────────────────────
// Ten identical releases, shipped through two pipelines. Both sides
// start at score 78. Ungated: every new issue lands (score drifts to
// 61). Gated: new issues bounce with exit 1, paid-down debt ratchets
// the score up to 91. Hand-tuned, not random — the demo should tell
// the same story every time.

export const START_SCORE = 78;

export const RELEASES: readonly SimRelease[] = [
  { ship: 2, fix: 0 },
  { ship: 1, fix: 1 },
  { ship: 3, fix: 0 },
  { ship: 1, fix: 2 },
  { ship: 2, fix: 2 },
  { ship: 1, fix: 0 },
  { ship: 3, fix: 3 },
  { ship: 1, fix: 2 },
  { ship: 2, fix: 2 },
  { ship: 1, fix: 1 },
];

/** Cumulative score per point (index 0 = before the first release). */
const accumulate = (step: (release: SimRelease) => number): readonly number[] => {
  const scores = [START_SCORE];
  for (const release of RELEASES) {
    scores.push(scores[scores.length - 1] + step(release));
  }
  return scores;
};

export const UNGATED_SCORES = accumulate((release) => -release.ship);
export const GATED_SCORES = accumulate((release) => release.fix);

// ── How the ratchet works, in three plain verbs ──────────────────────
export const SOLUTION_STEPS: readonly SolutionStep[] = [
  {
    tag: "lock",
    text: "Scan once. Every existing issue becomes tracked debt — nothing blocks on day one.",
  },
  {
    tag: "block",
    text: "Every PR is checked against the baseline. One new issue means exit 1 — no merge.",
  },
  {
    tag: "raise",
    text: "Fix old debt at your own pace. The baseline follows you up, and never back down.",
  },
];

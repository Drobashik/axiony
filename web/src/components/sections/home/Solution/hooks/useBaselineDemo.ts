import { useState } from "react";
import { INITIAL_POINTS, MAX_POINTS } from "../data";
import type { BaselineStatus } from "../types";

export const useBaselineDemo = () => {
  const [points, setPoints] = useState<number[]>(INITIAL_POINTS);
  const [blocked, setBlocked] = useState(0);
  const [merged, setMerged] = useState(0);
  const [pr, setPr] = useState(1843);
  const [regressKey, setRegressKey] = useState(0);
  const [mergeKey, setMergeKey] = useState(0);
  const [status, setStatus] = useState<BaselineStatus>({
    kind: "idle",
    text: "Your baseline is locked. Try to break it — or merge a fix and watch it climb.",
  });

  const baseline = points[points.length - 1];
  const maxed = baseline >= 98;

  const mergeFix = () => {
    const nextPr = pr + 1;
    setPr((current) => current + 1);

    if (maxed) {
      setStatus({ kind: "merge", text: "Baseline is at 98 — your app is basically spotless." });
      return;
    }

    setPoints((currentPoints) => {
      const last = currentPoints[currentPoints.length - 1];
      const inc = last >= 96 ? 1 : last >= 90 ? 2 : last >= 80 ? 3 : 4;
      const grown = [...currentPoints, Math.min(98, last + inc)];

      return grown.length > MAX_POINTS ? grown.slice(grown.length - MAX_POINTS) : grown;
    });
    setMerged((current) => current + 1);
    setMergeKey((current) => current + 1);
    setStatus({
      kind: "merge",
      text: `PR #${nextPr} merged — baseline locked higher. It can't slip back.`,
    });
  };

  const tryRegress = () => {
    const nextPr = pr + 1;
    setPr((current) => current + 1);
    setBlocked((current) => current + 1);
    setRegressKey((current) => current + 1);
    setStatus({
      kind: "block",
      text: `Blocked at PR #${nextPr} — this change would reintroduce color-contrast.`,
    });
  };

  return {
    baseline,
    blocked,
    mergeFix,
    mergeKey,
    merged,
    points,
    regressKey,
    status,
    tryRegress,
  };
};

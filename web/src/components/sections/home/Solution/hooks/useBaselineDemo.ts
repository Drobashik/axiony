import { useState } from "react";
import { WORKFLOW_STEPS } from "../data";

export const useBaselineDemo = () => {
  const [active, setActive] = useState(0);
  const [tick, setTick] = useState(1);

  const select = (index: number) => {
    setActive(index);
    setTick((current) => current + 1);
  };

  const step = WORKFLOW_STEPS[active];

  return {
    active,
    step,
    steps: WORKFLOW_STEPS,
    select,
    regressKey: step.key === "pr" ? tick : 0,
    mergeKey: tick,
  };
};

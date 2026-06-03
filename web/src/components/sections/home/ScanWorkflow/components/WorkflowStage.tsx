import cn from "classnames";
import { ScanViz } from "./ScanViz";
import { ScannerViz } from "./ScannerViz";
import { TeamViz } from "./TeamViz";
import type { StepDef } from "../types";
import styles from "../ScanWorkflow.module.scss";

interface WorkflowStageProps {
  active: number;
  inView: boolean;
  reduce: boolean;
  step: StepDef;
}

export const WorkflowStage = ({ active, inView, reduce, step }: WorkflowStageProps) => (
  <div
    id="wf-panel"
    role="tabpanel"
    aria-labelledby={`wf-tab-${active}`}
    className={cn(styles.stage, styles[`stage_${step.accent}`], "reveal")}
  >
    <p key={`cap-${active}`} className={styles.caption}>
      {step.caption}
    </p>
    <div key={`viz-${active}`} className={styles.viz}>
      {active === 0 && <ScanViz start={inView} reduce={reduce} />}
      {active === 1 && <ScannerViz />}
      {active === 2 && <TeamViz />}
    </div>
  </div>
);

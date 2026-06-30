import cn from "classnames";
import { ScannerViz } from "./ScannerViz";
import { TeamViz } from "./TeamViz";
import type { StepDef } from "../types";
import styles from "../ScanWorkflow.module.scss";

interface WorkflowStageProps {
  active: number;
  reduce: boolean;
  steps: readonly StepDef[];
}

// Every step's caption and visual is rendered at once, stacked in a single
// grid cell. The panel is therefore always as tall as the biggest step, so
// switching between Free, Pro and Team crossfades the content without ever
// changing the panel's height — the page can't jump.
export const WorkflowStage = ({ active, reduce, steps }: WorkflowStageProps) => {
  const accent = steps[active].accent;

  return (
    <div className={cn(styles.stage, styles[`stage_${accent}`], "reveal")}>
      <div className={styles.captions}>
        {steps.map((step, index) => (
          <p
            key={step.key}
            className={cn(styles.caption, index === active && styles.captionActive)}
            aria-hidden={index !== active}
          >
            {step.caption}
          </p>
        ))}
      </div>

      <div className={styles.vizDeck}>
        {steps.map((step, index) => {
          const isActive = index === active;

          return (
            <div
              key={step.key}
              id={`wf-panel-${index}`}
              role="tabpanel"
              aria-labelledby={`wf-tab-${index}`}
              aria-hidden={!isActive}
              className={cn(styles.vizSlot, isActive && styles.vizSlotActive)}
            >
              {/* Keyed by active state so the team week replays each time the
                  step is opened. */}
              {index === 0 && <ScannerViz />}
              {index === 1 && (
                <TeamViz key={`team-${isActive}`} reduce={reduce} active={isActive} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

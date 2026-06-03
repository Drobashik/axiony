import { Icon } from "@/components/ui";
import cn from "classnames";
import type { StepDef } from "../types";
import styles from "../ScanWorkflow.module.scss";

interface WorkflowStepperProps {
  active: number;
  onSelect: (index: number) => void;
  steps: readonly StepDef[];
}

export const WorkflowStepper = ({ active, onSelect, steps }: WorkflowStepperProps) => (
  <div className={cn(styles.stepper, "reveal")} role="tablist" aria-label="Axiony workflow steps">
    {steps.map((step, index) => (
      <button
        key={step.key}
        type="button"
        role="tab"
        id={`wf-tab-${index}`}
        aria-selected={index === active}
        aria-controls="wf-panel"
        className={cn(
          styles.step,
          styles[`step_${step.accent}`],
          index === active && styles.step_active,
          index < active && styles.step_done,
        )}
        onClick={() => onSelect(index)}
      >
        <span className={styles.stepNum}>
          {index < active ? <Icon name="check" size={16} /> : step.n}
        </span>
        <span className={styles.stepText}>
          <strong>{step.title}</strong>
          <span>{step.tag}</span>
        </span>
      </button>
    ))}
  </div>
);

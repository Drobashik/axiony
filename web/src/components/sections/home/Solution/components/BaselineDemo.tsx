"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui";
import cn from "classnames";
import { useBaselineDemo } from "../hooks/useBaselineDemo";
import type { WorkflowStatusKind } from "../types";
import { BaselineChart } from "./BaselineChart";
import { CloudIcon, LockIcon, ShieldIcon } from "./icons";
import styles from "../Solution.module.scss";

const statusIcon = (kind: WorkflowStatusKind): ReactNode => {
  if (kind === "block") return <ShieldIcon />;
  if (kind === "merge") return <Icon name="check" size={16} />;
  return <LockIcon />;
};

export const BaselineDemo = () => {
  const { active, step, steps, select, regressKey, mergeKey } = useBaselineDemo();

  return (
    <div className={styles.stage}>
      <div className={styles.stageHeader}>
        <span className={styles.stageLabel}>
          <CloudIcon />
          The Axiony workflow
        </span>
        <span className={styles.stageTier}>{step.tag}</span>
      </div>

      <div
        className={styles.steps}
        role="group"
        aria-label="Walk through the Axiony workflow"
      >
        {steps.map((item, index) => {
          const isActive = index === active;

          return (
            <button
              key={item.key}
              type="button"
              className={cn(styles.stepCard, isActive && styles.stepCard_active)}
              onClick={() => select(index)}
              aria-pressed={isActive}
            >
              <span className={styles.stepNum}>{item.n}</span>
              <span className={styles.stepLabel}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <p className={styles.stageTitle}>{step.title}</p>
      <p className={styles.stageDetail}>{step.detail}</p>

      <BaselineChart points={step.points} regressKey={regressKey} mergeKey={mergeKey} />

      <div
        className={cn(styles.statusLine, styles[`status_${step.statusKind}`])}
        aria-live="polite"
      >
        {statusIcon(step.statusKind)}
        <span>{step.statusText}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.debtDot} />
          <strong>{step.stats.tracked}</strong>
          <span>tracked debt</span>
        </div>
        <div className={styles.stat}>
          <ShieldIcon />
          <strong>{step.stats.flagged}</strong>
          <span>flagged in PRs</span>
        </div>
        <div className={styles.stat}>
          <Icon name="check" size={16} className={styles.statCheck} />
          <strong>{step.stats.merged}</strong>
          <span>fixes merged</span>
        </div>
      </div>

      <p className={styles.stageRole}>
        <span className={styles.roleTag}>{step.roleLabel}</span>
        {step.roleText}
      </p>
    </div>
  );
};

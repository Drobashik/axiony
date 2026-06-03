"use client";

import { Icon } from "@/components/ui";
import cn from "classnames";
import { useBaselineDemo } from "../hooks/useBaselineDemo";
import { BaselineChart } from "./BaselineChart";
import { CloudIcon, LockIcon, ShieldIcon } from "./icons";
import styles from "../Solution.module.scss";

export const BaselineDemo = () => {
  const {
    baseline,
    blocked,
    mergeFix,
    mergeKey,
    merged,
    points,
    regressKey,
    status,
    tryRegress,
  } = useBaselineDemo();

  return (
    <div className={styles.stage}>
      <div className={styles.stageHeader}>
        <span className={styles.stageLabel}>
          <CloudIcon />
          Axiony Cloud · baseline
        </span>
        <span className={styles.stageTier}>Pro &amp; Team</span>
      </div>

      <p className={styles.stageTitle}>Try to ship a regression.</p>

      <BaselineChart points={points} regressKey={regressKey} mergeKey={mergeKey} />

      <div className={cn(styles.statusLine, styles[`status_${status.kind}`])}>
        {status.kind === "block" ? <ShieldIcon /> : status.kind === "merge" ? <Icon name="check" size={16} /> : <LockIcon />}
        <span>{status.text}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <LockIcon />
          <strong>{baseline}</strong>
          <span>baseline locked</span>
        </div>
        <div className={styles.stat}>
          <ShieldIcon />
          <strong>{blocked}</strong>
          <span>regressions blocked</span>
        </div>
        <div className={styles.stat}>
          <Icon name="check" size={16} className={styles.statCheck} />
          <strong>{merged}</strong>
          <span>fixes merged</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.debtDot} />
          <strong>47</strong>
          <span>existing · tracked</span>
        </div>
      </div>

      <div className={styles.controls}>
        <button type="button" className={styles.tryBtn} onClick={tryRegress}>
          <ShieldIcon />
          Try to ship a regression
        </button>
        <button type="button" className={styles.mergeBtn} onClick={mergeFix}>
          <Icon name="check" size={16} />
          Merge a fix
        </button>
      </div>
    </div>
  );
};

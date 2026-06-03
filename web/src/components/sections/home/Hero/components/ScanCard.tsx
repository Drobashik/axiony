import type { CSSProperties } from "react";
import cn from "classnames";
import { HERO_ISSUES } from "../data";
import { LockMark } from "./icons";
import styles from "../Hero.module.scss";

export const ScanCard = () => (
  <div className={styles.card} aria-hidden="true">
    <div className={styles.cardHead}>
      <span className={styles.dots}>
        <span />
        <span />
        <span />
      </span>
      <span className={styles.cardCmd}>axiony scan acme.com</span>
      <span className={styles.cardStatus}>complete</span>
    </div>

    <div className={styles.cardBody}>
      <span className={styles.cardBeam} />

      <div className={styles.scoreRow}>
        <div className={styles.ring}>
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle className={styles.ringTrack} cx="40" cy="40" r="34" />
            <circle className={styles.ringFill} cx="40" cy="40" r="34" />
          </svg>
          <span className={styles.ringVal}>92</span>
        </div>
        <div className={styles.scoreMeta}>
          <strong>Accessibility score</strong>
          <span className={styles.baselinePill}>
            <LockMark />
            baseline locked
          </span>
          <span className={styles.scoreSub}>+6 since last release</span>
        </div>
      </div>

      <div className={styles.issues}>
        {HERO_ISSUES.map((issue, index) => (
          <div
            key={issue.rule}
            className={styles.issueRow}
            style={{ "--i": index } as CSSProperties}
          >
            <span className={cn(styles.sev, styles[`sev_${issue.sev}`])} />
            <code>{issue.rule}</code>
            <span className={styles.issueWhere}>{issue.where}</span>
          </div>
        ))}
      </div>

      <div className={styles.cardFoot}>
        <span>9 issues · tracked</span>
        <span className={styles.blocked}>2 new · blocked</span>
      </div>
    </div>
  </div>
);

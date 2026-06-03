"use client";

import { useState } from "react";
import cn from "classnames";
import { Toggle } from "../components/Toggle";
import styles from "../Problem.module.scss";

export const KeyboardDemo = () => {
  const [focusable, setFocusable] = useState(false);
  const order = focusable ? ["email", "country", "pay"] : ["email", "pay"];
  const [step, setStep] = useState(-1);
  const current = step >= 0 ? order[step] : null;
  const reachedPay = current === "pay";

  const advance = () => setStep((s) => (s + 1) % order.length);
  const reset = () => setStep(-1);

  return (
    <div className={styles.demo}>
      <div className={styles.kbForm} aria-hidden="true">
        <div className={cn(styles.kbField, current === "email" && styles.kbField_focus)}>
          <span className={styles.kbLabel}>Email</span>
          <span className={styles.kbControl}>you@team.com</span>
        </div>

        <div
          className={cn(
            styles.kbField,
            current === "country" && styles.kbField_focus,
            !focusable && styles.kbField_blocked,
          )}
        >
          <span className={styles.kbLabel}>Country</span>
          <span className={styles.kbControl}>
            Select…
            <span className={styles.kbChevron}>▾</span>
          </span>
          {!focusable && <span className={styles.kbSkip}>tab skips this</span>}
        </div>

        <div className={cn(styles.kbField, styles.kbField_pay, reachedPay && styles.kbField_focus)}>
          <span>Pay $49</span>
        </div>
      </div>

      <div className={styles.demoControls}>
        <button type="button" className={styles.actionBtn} onClick={advance}>
          Tab&nbsp;⇥
        </button>
        <button type="button" className={styles.ghostBtn} onClick={reset}>
          Reset
        </button>
        <Toggle
          checked={focusable}
          onChange={(value) => {
            setFocusable(value);
            setStep(-1);
          }}
          label="Make it focusable"
        />
      </div>

      <p className={styles.takeaway}>
        {focusable
          ? "Now every control is in the tab order — keyboard and switch users can finish checkout."
          : "Press Tab. Focus jumps from Email straight to Pay — the country selector can never be reached."}
      </p>
    </div>
  );
};

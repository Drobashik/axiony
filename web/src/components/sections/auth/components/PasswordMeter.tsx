"use client";

import cn from "classnames";
import { getPasswordStrength } from "../lib/validation";
import styles from "../screen/AuthScreen.module.scss";

const SEGMENTS = [1, 2, 3, 4];

/** Four-segment strength meter shown under the signup password field.
 * Decorative bar + a text label so meaning never relies on colour. */
export const PasswordMeter = ({ password }: { password: string }) => {
  const { score, label, tone } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className={styles.meter}>
      <div className={styles.meterTrack} aria-hidden="true">
        {SEGMENTS.map((seg) => (
          <span
            key={seg}
            className={cn(styles.meterSeg, seg <= score && styles.meterSegOn)}
            style={seg <= score ? { background: `var(--${tone})` } : undefined}
          />
        ))}
      </div>
      <span className={styles.meterLabel} style={{ color: `var(--${tone})` }}>
        {label}
      </span>
    </div>
  );
};

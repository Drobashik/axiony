"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import cn from "classnames";
import { CheckIcon } from "./icons";
import styles from "./AuthScreen.module.scss";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  error?: string;
  disabled?: boolean;
}

/** Accessible custom checkbox — a real input drives state and focus; the
 * box and tick are purely visual. */
export const Checkbox = ({ checked, onChange, children, error, disabled }: CheckboxProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={styles.checkboxField}>
      <label className={styles.checkbox} htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className={styles.checkboxInput}
          checked={checked}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={cn(styles.checkboxBox, error && styles.checkboxBoxError)}
          aria-hidden="true"
        >
          <CheckIcon size={13} />
        </span>
        <span className={styles.checkboxLabel}>{children}</span>
      </label>
      {error && (
        <p id={errorId} className={styles.fieldError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

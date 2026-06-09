"use client";

import { useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import cn from "classnames";
import styles from "../screen/AuthScreen.module.scss";
import { AlertIcon, EyeIcon, EyeOffIcon } from "./icons";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> {
  label: string;
  /** Leading glyph rendered inside the input shell. */
  icon: ReactNode;
  error?: string;
  hint?: string;
  /** Adds a show/hide toggle and starts the input masked. */
  revealable?: boolean;
  /** Optional node aligned to the right of the label (e.g. a reset link). */
  trailing?: ReactNode;
  /** Extra content under the field (e.g. the password strength meter). */
  children?: ReactNode;
}

/**
 * One labelled input with a leading icon, inline validation message, and an
 * optional password reveal toggle. Wires up `aria-invalid` /
 * `aria-describedby` so screen readers announce errors and hints.
 */
export const AuthField = ({
  label,
  icon,
  error,
  hint,
  revealable,
  trailing,
  children,
  type = "text",
  ...inputProps
}: AuthFieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [revealed, setRevealed] = useState(false);

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  const inputType = revealable ? (revealed ? "text" : "password") : type;

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {trailing}
      </div>

      <div className={cn(styles.inputWrap, error && styles.inputWrapError)}>
        <span className={styles.leadingIcon} aria-hidden="true">
          {icon}
        </span>
        <input
          id={id}
          type={inputType}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {revealable && (
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            tabIndex={-1}
          >
            {revealed ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={errorId} className={styles.fieldError} role="alert">
          <AlertIcon size={14} />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className={styles.fieldHint}>
          {hint}
        </p>
      ) : null}

      {children}
    </div>
  );
};

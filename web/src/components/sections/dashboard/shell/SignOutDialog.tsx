"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import styles from "./SignOutDialog.module.scss";

interface SignOutDialogProps {
  userName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const SignOutMark = ({ size = 22 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export const SignOutDialog = ({ userName, onClose, onConfirm }: SignOutDialogProps) => {
  const [signingOut, setSigningOut] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !signingOut) onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, signingOut]);

  const confirm = async () => {
    if (signingOut) return;
    setSigningOut(true);
    await onConfirm();
  };

  return (
    <div className={styles.overlay} onClick={signingOut ? undefined : onClose}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sign-out-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Close sign out confirmation"
          disabled={signingOut}
        >
          <CloseIcon />
        </button>

        <span className={styles.mark}>
          <SignOutMark />
        </span>

        <span className={styles.kicker}>End session</span>
        <h2 id="sign-out-title">Log out of Axiony?</h2>
        <p>
          You are signed in as <strong>{userName}</strong>. Your saved reports stay in your account,
          and you will need to log in again to continue in the dashboard.
        </p>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} disabled={signingOut}>
            Stay signed in
          </Button>
          <Button onClick={confirm} disabled={signingOut} className={styles.confirm}>
            <SignOutMark size={16} />
            {signingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>
    </div>
  );
};

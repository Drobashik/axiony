import { useEffect, useRef, useState } from "react";
import cn from "classnames";
import { INSTALL_COMMAND } from "../data";
import { CheckIcon, CopyIcon } from "./icons";
import styles from "../Hero.module.scss";

export const InstallCommand = () => {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => clearTimeout(resetTimer.current ?? undefined), []);

  // Fallback for contexts where the Clipboard API is blocked (plain http,
  // embedded webviews, older browsers).
  const copyViaExecCommand = () => {
    const textarea = document.createElement("textarea");
    textarea.value = INSTALL_COMMAND;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand("copy");
    } finally {
      textarea.remove();
    }
  };

  const copy = async () => {
    let copiedOk = true;
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } catch {
      copiedOk = copyViaExecCommand();
    }
    if (!copiedOk) return;

    setCopied(true);
    clearTimeout(resetTimer.current ?? undefined);
    resetTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      className={styles.install}
      onClick={copy}
      aria-label={`Copy install command: ${INSTALL_COMMAND}`}
    >
      <span className={styles.installPrompt} aria-hidden="true">
        $
      </span>
      <code>{INSTALL_COMMAND}</code>
      <span className={cn(styles.installCopy, copied && styles.installCopied)} aria-hidden="true">
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
};

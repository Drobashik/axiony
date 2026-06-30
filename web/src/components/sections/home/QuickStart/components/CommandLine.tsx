"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import cn from "classnames";
import { CopyIcon } from "./CopyIcon";
import styles from "../QuickStart.module.scss";

interface CommandLineProps {
  command: string;
}

export const CommandLine = ({ command }: CommandLineProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      return;
    }
  };

  return (
    <div className={styles.cmdRow}>
      <span className={styles.prompt} aria-hidden="true">
        $
      </span>
      <code className={styles.cmdText}>{command}</code>
      <button
        type="button"
        className={cn(styles.copy, copied && styles.copied)}
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
      >
        {copied ? <Icon name="check" size={14} /> : <CopyIcon />}
      </button>
    </div>
  );
};

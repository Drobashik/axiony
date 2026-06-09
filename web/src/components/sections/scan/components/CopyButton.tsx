"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import cn from "classnames";
import { CopyIcon } from "./icons";
import styles from "../ScanStudio.module.scss";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export const CopyButton = ({ text, label = "Copy", className }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (insecure context) — fail quietly.
    }
  };

  return (
    <button
      type="button"
      className={cn(styles.copyBtn, copied && styles.copyBtnDone, className)}
      onClick={copy}
      aria-label={copied ? "Copied" : label}
    >
      {copied ? <Icon name="check" size={13} /> : <CopyIcon size={13} />}
      {copied ? "Copied" : label}
    </button>
  );
};

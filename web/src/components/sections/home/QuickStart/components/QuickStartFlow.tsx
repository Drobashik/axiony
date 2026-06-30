"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/ui";
import cn from "classnames";
import { runnerCommand } from "../data";
import type { PackageManager } from "../data";
import { QuickTerminal } from "./QuickTerminal";
import { ScanTargets } from "./ScanTargets";
import styles from "../QuickStart.module.scss";

export const QuickStartFlow = () => {
  const [pm, setPm] = useState<PackageManager>("npm");

  return (
    <div className={cn(styles.flow, "reveal")}>
      <QuickTerminal pm={pm} onSelect={setPm} />

      <ScanTargets />

      <div className={styles.footer}>
        <p className={styles.runner}>
          No global install? <code>{runnerCommand(pm)}</code>
        </p>
        <Button href="/docs" variant="secondary" size="sm">
          Read the docs
          <Icon name="arrow" size={16} />
        </Button>
      </div>
    </div>
  );
};

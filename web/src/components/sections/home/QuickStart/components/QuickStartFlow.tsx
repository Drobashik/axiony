"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/ui";
import cn from "classnames";
import { SCAN_TARGETS, runnerCommand } from "../data";
import type { PackageManager } from "../data";
import type { ScanTarget } from "../types";
import { QuickTerminal } from "./QuickTerminal";
import { ScanTargets } from "./ScanTargets";
import styles from "../QuickStart.module.scss";

export const QuickStartFlow = () => {
  const [pm, setPm] = useState<PackageManager>("npm");
  const [target, setTarget] = useState<ScanTarget>(SCAN_TARGETS[0]);

  return (
    <div className={cn(styles.flow, "reveal")}>
      <QuickTerminal pm={pm} onSelect={setPm} target={target} />

      <div className={styles.rail}>
        <ScanTargets active={target} onSelect={setTarget} />

        <div className={styles.railFoot}>
          <p className={styles.runner}>
            No global install? <code>{runnerCommand(pm)}</code>
          </p>
          <Button href="/docs" variant="secondary" size="sm">
            Read the docs
            <Icon name="arrow" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

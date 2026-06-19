"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import cn from "classnames";
import { PACKAGE_MANAGERS, STEPS, installCommand, runnerCommand } from "../data";
import type { PackageManager } from "../data";
import { CommandLine } from "./CommandLine";
import styles from "../QuickStart.module.scss";

export const QuickStartFlow = () => {
  const [pm, setPm] = useState<PackageManager>("npm");

  return (
    <div className={cn(styles.flow, "reveal")}>
      <div className={styles.pm} role="group" aria-label="Package manager">
        {PACKAGE_MANAGERS.map((name) => (
          <button
            key={name}
            type="button"
            className={cn(styles.pmBtn, pm === name && styles.pmActive)}
            onClick={() => setPm(name)}
            aria-pressed={pm === name}
          >
            {name}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {STEPS.map((step, index) => (
          <article key={step.n} className={cn(styles.step, styles[`accent_${step.accent}`])}>
            <div className={styles.stepHead}>
              <span className={styles.num}>{step.n}</span>
              <span className={styles.title}>{step.title}</span>
            </div>
            <CommandLine command={index === 0 ? installCommand(pm) : step.command} />
            <p className={styles.note}>{step.note}</p>
          </article>
        ))}
      </div>

      <div className={styles.footer}>
        <span className={styles.npx}>
          No install? <code>{runnerCommand(pm)}</code>
        </span>
        <Button href="/docs" variant="secondary">
          Read the docs →
        </Button>
      </div>
    </div>
  );
};

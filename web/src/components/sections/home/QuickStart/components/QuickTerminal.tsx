"use client";

import cn from "classnames";
import { PACKAGE_MANAGERS, installCommand } from "../data";
import type { PackageManager } from "../data";
import type { ScanTarget } from "../types";
import { CommandLine } from "./CommandLine";
import styles from "../QuickStart.module.scss";

interface QuickTerminalProps {
  pm: PackageManager;
  target: ScanTarget;
  onSelect: (pm: PackageManager) => void;
}

export const QuickTerminal = ({ pm, target, onSelect }: QuickTerminalProps) => (
  <div className={styles.terminal}>
    <div className={styles.termHead}>
      <span className={styles.dots} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className={styles.termPath}>~/acme — zsh</span>

      <div className={styles.pm} role="group" aria-label="Package manager">
        {PACKAGE_MANAGERS.map((name) => (
          <button
            key={name}
            type="button"
            className={cn(styles.pmBtn, pm === name && styles.pmActive)}
            onClick={() => onSelect(name)}
            aria-pressed={pm === name}
          >
            {name}
          </button>
        ))}
      </div>
    </div>

    <div className={styles.termBody}>
      <p className={styles.comment}># 1 · install the CLI, once</p>
      <CommandLine command={installCommand(pm)} />

      <p className={styles.comment}># 2 · grab the headless browser, once</p>
      <CommandLine command="axiony install" />

      {/* Step 3 follows the selected target — keyed so the swapped lines
          re-enter with a small rise instead of blinking in place. */}
      <p key={`step-${target.key}`} className={cn(styles.comment, styles.swap)}>
        # 3 · {target.step3}
      </p>
      <CommandLine key={`cmd-${target.key}`} className={styles.swap} command={target.command} />

      <p key={`ok-${target.key}`} className={cn(styles.output, styles.outputFirst, styles.swap)}>
        <span className={styles.ok}>✓</span> {target.scanned}
      </p>
      <p key={`verdict-${target.key}`} className={cn(styles.output, styles.swap)}>
        <span className={styles.score}>{target.score}</span> · {target.verdict}
      </p>

      <p className={styles.idle}>
        <span className={styles.prompt} aria-hidden="true">
          $
        </span>
        <span className={styles.caret} aria-hidden="true" />
      </p>
    </div>
  </div>
);

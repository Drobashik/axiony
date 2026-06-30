"use client";

import cn from "classnames";
import { PACKAGE_MANAGERS, installCommand } from "../data";
import type { PackageManager } from "../data";
import { CommandLine } from "./CommandLine";
import styles from "../QuickStart.module.scss";

interface QuickTerminalProps {
  pm: PackageManager;
  onSelect: (pm: PackageManager) => void;
}

export const QuickTerminal = ({ pm, onSelect }: QuickTerminalProps) => (
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

      <p className={styles.comment}># 3 · scan your first page</p>
      <CommandLine command="axiony scan https://your-site.com" />

      <p className={cn(styles.output, styles.outputFirst)}>
        <span className={styles.ok}>✓</span> scanned your-site.com · 1 page, 132 elements
      </p>
      <p className={styles.output}>
        <span className={styles.score}>78 / 100</span> · 11 issues — 6 ready as AI patches
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

"use client";

import { useState } from "react";
import cn from "classnames";
import { CartIcon, HeartIcon, SearchIcon, ShareIcon } from "../components/icons";
import { Toggle } from "../components/Toggle";
import styles from "../Problem.module.scss";

const SR_CONTROLS = [
  { id: "search", label: "Search", Icon: SearchIcon },
  { id: "like", label: "Add to favourites", Icon: HeartIcon },
  { id: "share", label: "Share", Icon: ShareIcon },
  { id: "cart", label: "View cart", Icon: CartIcon },
] as const;

interface ScreenReaderDemoProps {
  onFixed: () => void;
}

export const ScreenReaderDemo = ({ onFixed }: ScreenReaderDemoProps) => {
  const [named, setNamed] = useState(false);
  const [cursor, setCursor] = useState(0);
  const announced = named ? SR_CONTROLS[cursor].label : "button";

  const setNames = (value: boolean) => {
    setNamed(value);
    if (value) onFixed();
  };

  return (
    <div className={styles.demo}>
      <div className={styles.srStage}>
        <div className={styles.srToolbar}>
          {SR_CONTROLS.map((control, i) => {
            const { Icon } = control;

            return (
              <button
                key={control.id}
                type="button"
                className={cn(styles.srIconBtn, i === cursor && styles.srIconBtn_active)}
                onClick={() => setCursor(i)}
                aria-label={control.label}
              >
                <Icon />
              </button>
            );
          })}
        </div>

        <div className={styles.srReader} aria-hidden="true">
          <span className={styles.srReaderLabel}>Screen reader announces</span>
          <strong className={named ? styles.srGood : styles.srBad}>“{announced}”</strong>
        </div>
      </div>

      <div className={styles.demoControls}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => setCursor((c) => (c + 1) % SR_CONTROLS.length)}
        >
          Tab&nbsp;⇥
        </button>
        <Toggle checked={named} onChange={setNames} label="Add accessible names" />
      </div>

      <p className={styles.takeaway}>
        A screen reader reads the code, not the icon. Without a name, every control is just{" "}
        <strong>“button”</strong> — impossible to tell apart.
      </p>
    </div>
  );
};

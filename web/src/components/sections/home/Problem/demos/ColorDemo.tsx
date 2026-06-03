"use client";

import { useState } from "react";
import cn from "classnames";
import { Toggle } from "../components/Toggle";
import styles from "../Problem.module.scss";

const SERVICES = [
  { name: "api-gateway", up: true },
  { name: "auth-service", up: false },
  { name: "payments", up: true },
  { name: "search-index", up: false },
] as const;

export const ColorDemo = () => {
  const [simulate, setSimulate] = useState(false);
  const [labelled, setLabelled] = useState(false);

  return (
    <div className={styles.demo}>
      <svg className={styles.cvdFilter} aria-hidden="true" focusable="false">
        <filter id="axiony-deuteranopia" colorInterpolationFilters="linearRGB">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0"
          />
        </filter>
      </svg>

      <div className={cn(styles.cvdStage, simulate && styles.cvdStage_sim)}>
        <div className={styles.statusList}>
          {SERVICES.map((service) => (
            <div key={service.name} className={styles.statusRow}>
              <span
                className={cn(
                  styles.statusDot,
                  service.up ? styles.statusDot_up : styles.statusDot_down,
                )}
              />
              {labelled && (
                <span
                  className={cn(
                    styles.statusIcon,
                    service.up ? styles.statusIcon_up : styles.statusIcon_down,
                  )}
                  aria-hidden="true"
                >
                  {service.up ? "✓" : "✕"}
                </span>
              )}
              <span className={styles.statusName}>{service.name}</span>
              {labelled && (
                <span className={styles.statusWord}>
                  {service.up ? "Operational" : "Down"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.demoControls}>
        <Toggle
          checked={simulate}
          onChange={setSimulate}
          label="Simulate red–green colour blindness"
        />
        <Toggle checked={labelled} onChange={setLabelled} label="Add icons & labels" />
      </div>

      <p className={styles.takeaway}>
        About <strong>1 in 12 men</strong> can&apos;t reliably tell red from
        green. With colour alone, “up” and “down” look identical.
      </p>
    </div>
  );
};

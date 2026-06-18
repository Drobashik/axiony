"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LoadingScreen } from "@/components/ui";
import { BootContext } from "./boot-context";
import type { BootStatus } from "./boot-context";
import styles from "./BootGate.module.scss";

export interface BootGateProps {
  disabled?: boolean;
  durationMs?: number;
  children: ReactNode;
}

let hasBootedOnce = false;

export const BootGate = ({ disabled, durationMs = 2000, children }: BootGateProps) => {
  const [loaded, setLoaded] = useState<boolean>(disabled ?? hasBootedOnce);

  useEffect(() => {
    if (loaded) {
      hasBootedOnce = true;
    }
  }, [loaded]);

  const status = useMemo<BootStatus>(() => ({ loaded }), [loaded]);

  return (
    <BootContext.Provider value={status}>
      <div className={styles.app} data-boot-loaded={loaded ? "true" : "false"}>
        {children}
      </div>
      {!loaded && (
        <LoadingScreen
          durationMs={durationMs}
          onDone={() => {
            hasBootedOnce = true;
            setLoaded(true);
          }}
        />
      )}
    </BootContext.Provider>
  );
};

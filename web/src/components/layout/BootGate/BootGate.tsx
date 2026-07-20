"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { LoadingScreen } from "@/components/ui";
import { BootContext } from "./boot-context";
import type { BootStatus } from "./boot-context";
import styles from "./BootGate.module.scss";

export interface BootGateProps {
  disabled?: boolean;
  children: ReactNode;
}

let hasBootedOnce = false;

const waitForPageLoadAndPaint = (onReady: () => void): (() => void) => {
  let cancelled = false;
  let firstFrame = 0;
  let secondFrame = 0;

  const finish = () => {
    if (cancelled) return;

    // `load` means the document and its dependent resources are ready. Two
    // frames then let the hydrated app commit a usable paint before the overlay
    // is removed; there is no synthetic minimum duration.
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (!cancelled) onReady();
      });
    });
  };

  if (document.readyState === "complete") {
    finish();
  } else {
    window.addEventListener("load", finish, { once: true });
  }

  return () => {
    cancelled = true;
    window.removeEventListener("load", finish);
    window.cancelAnimationFrame(firstFrame);
    window.cancelAnimationFrame(secondFrame);
  };
};

export const BootGate = ({ disabled, children }: BootGateProps) => {
  const startsLoaded = Boolean(disabled || hasBootedOnce);
  const [ready, setReady] = useState(startsLoaded);
  const [loaded, setLoaded] = useState(startsLoaded);

  useEffect(() => {
    if (!ready) return waitForPageLoadAndPaint(() => setReady(true));
  }, [ready]);

  useEffect(() => {
    if (!disabled) return;

    const frame = window.requestAnimationFrame(() => {
      setReady(true);
      setLoaded(true);
      hasBootedOnce = true;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [disabled]);

  const finishBoot = useCallback(() => {
    hasBootedOnce = true;
    setLoaded(true);
  }, []);

  const status = useMemo<BootStatus>(() => ({ loaded }), [loaded]);

  return (
    <BootContext.Provider value={status}>
      <div className={styles.app} data-boot-loaded={loaded ? "true" : "false"}>
        {children}
      </div>
      {!loaded && <LoadingScreen ready={ready} onDone={finishBoot} />}
    </BootContext.Provider>
  );
};

"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { LoadingScreen } from "@/components/ui";
import { BootContext, BootStatus } from "./boot-context";
import styles from "./BootGate.module.scss";

export interface BootGateProps {
  /** Skip the boot screen entirely (e.g. for tests or storybook). */
  disabled?: boolean;
  /** How long the loading screen stays up (ms). */
  durationMs?: number;
  children: ReactNode;
}

/**
 * Module-level flag — survives client-side route changes but is reset
 * by a full page refresh, which re-evaluates the module. That's
 * exactly when we want to play the loader: first load + refresh, never
 * during in-app navigation.
 */
let hasBootedOnce = false;

/**
 * Renders a brief LoadingScreen on the first mount per page-load, then
 * mounts the wrapped page once the loader completes. Subsequent mounts
 * (e.g. route changes) skip the loader entirely and render children
 * immediately.
 *
 * Children are only rendered once `loaded` is `true`. That makes any
 * CSS animations on first-paint elements fire naturally on mount, with
 * no need for class-based gating — the elements simply don't exist
 * until the loader has cleared.
 */
export function BootGate({ disabled, durationMs = 2000, children }: BootGateProps) {
  // Skip the loader if this is a re-mount within the same tab session.
  const [loaded, setLoaded] = useState<boolean>(disabled ?? hasBootedOnce);

  useEffect(() => {
    if (loaded) hasBootedOnce = true;
  }, [loaded]);

  // Memoise so consumers don't re-render on every parent render.
  const status = useMemo<BootStatus>(() => ({ loaded }), [loaded]);

  console.log(loaded)

  return (
    <BootContext.Provider value={status}>
      {!loaded && (
        <LoadingScreen
          durationMs={durationMs}
          onDone={() => {
            hasBootedOnce = true;
            setLoaded(true);
          }}
        />
      )}
      {loaded && <div className={styles.app}>{children}</div>}
    </BootContext.Provider>
  );
}

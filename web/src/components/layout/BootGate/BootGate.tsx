"use client";

import { useCallback, useEffect, useState } from "react";
import { LoadingScreen } from "@/components/ui";

export interface BootGateProps {
  disabled?: boolean;
}

let hasBootedOnce = false;

const waitForHydrationPaint = (onReady: () => void): (() => void) => {
  let cancelled = false;
  let firstFrame = 0;
  let secondFrame = 0;

  // Reaching this effect means React has hydrated the page. Two paint frames
  // let that interactive UI commit before the overlay leaves, without waiting
  // for unrelated late resources covered by the broader `window.load` event.
  firstFrame = window.requestAnimationFrame(() => {
    secondFrame = window.requestAnimationFrame(() => {
      if (!cancelled) onReady();
    });
  });

  return () => {
    cancelled = true;
    window.cancelAnimationFrame(firstFrame);
    window.cancelAnimationFrame(secondFrame);
  };
};

export const BootGate = ({ disabled }: BootGateProps) => {
  const startsLoaded = Boolean(disabled || hasBootedOnce);
  const [ready, setReady] = useState(startsLoaded);
  const [loaded, setLoaded] = useState(startsLoaded);

  useEffect(() => {
    if (!ready) return waitForHydrationPaint(() => setReady(true));
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

  useEffect(() => {
    const app = document.querySelector<HTMLElement>("[data-boot-root]");
    app?.setAttribute("data-boot-loaded", String(loaded));
    if (loaded) window.dispatchEvent(new Event("axiony:boot-ready"));
  }, [loaded]);

  return !loaded ? <LoadingScreen ready={ready} onDone={finishBoot} /> : null;
};

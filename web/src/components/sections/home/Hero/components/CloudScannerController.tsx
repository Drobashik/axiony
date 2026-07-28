"use client";

import { useEffect } from "react";
import { createCloudScannerRuntime } from "./cloudScannerRuntime";

const BOOT_SELECTOR = "[data-boot-root]";
const BOOT_READY_EVENT = "axiony:boot-ready";

const isBootReady = () =>
  document.querySelector<HTMLElement>(BOOT_SELECTOR)?.dataset.bootLoaded === "true";

export const CloudScannerController = ({ browserId }: { browserId: string }) => {
  useEffect(() => {
    let animationFrame = 0;
    let destroyRuntime: (() => void) | undefined;

    const start = () => {
      if (animationFrame || destroyRuntime) return;

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        const browser = document.getElementById(browserId);
        if (browser) destroyRuntime = createCloudScannerRuntime(browser);
      });
    };

    if (isBootReady()) start();
    else window.addEventListener(BOOT_READY_EVENT, start, { once: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener(BOOT_READY_EVENT, start);
      destroyRuntime?.();
    };
  }, [browserId]);

  return null;
};

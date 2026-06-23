"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import cn from "classnames";
import { ROUTE_LOADING_EVENT } from "@/lib/navigation/route-loading";
import styles from "./RouteLoadingIndicator.module.scss";

const SAFETY_TIMEOUT_MS = 8000;

const isModifiedClick = (event: MouseEvent): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const shouldTrackAnchor = (anchor: HTMLAnchorElement): boolean => {
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.getAttribute("aria-disabled") === "true") return false;
  if (anchor.dataset.routeLoading === "false") return false;

  const next = new URL(anchor.href, window.location.href);
  const current = new URL(window.location.href);

  if (next.origin !== current.origin) return false;

  // Hash-only jumps should stay instant and avoid showing app navigation UI.
  return next.pathname !== current.pathname || next.search !== current.search;
};

export const RouteLoadingIndicator = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const safetyTimer = useRef<number | null>(null);
  const lastLocation = useRef<string | null>(null);

  const locationKey = useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams],
  );

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimer.current === null) return;
    window.clearTimeout(safetyTimer.current);
    safetyTimer.current = null;
  }, []);

  const finish = useCallback(() => {
    clearSafetyTimer();
    setActive(false);
  }, [clearSafetyTimer]);

  const start = useCallback(() => {
    clearSafetyTimer();
    setActive(true);
    safetyTimer.current = window.setTimeout(finish, SAFETY_TIMEOUT_MS);
  }, [clearSafetyTimer, finish]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || !shouldTrackAnchor(anchor)) return;

      start();
    };

    const onRouteStart = () => start();
    const onPageShow = () => finish();

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener(ROUTE_LOADING_EVENT, onRouteStart);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener(ROUTE_LOADING_EVENT, onRouteStart);
      window.removeEventListener("pageshow", onPageShow);
      clearSafetyTimer();
    };
  }, [clearSafetyTimer, finish, start]);

  useEffect(() => {
    if (lastLocation.current === null) {
      lastLocation.current = locationKey;
      return;
    }

    if (lastLocation.current === locationKey) return;

    lastLocation.current = locationKey;
    const frame = window.requestAnimationFrame(finish);
    return () => window.cancelAnimationFrame(frame);
  }, [finish, locationKey]);

  return (
    <div className={cn(styles.root, active && styles.active)} aria-hidden="true">
      <span className={styles.haze} />
      <span className={styles.track}>
        <span className={styles.bar} />
      </span>
    </div>
  );
};

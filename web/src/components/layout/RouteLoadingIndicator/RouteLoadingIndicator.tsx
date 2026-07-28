"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import cn from "classnames";
import { ROUTE_LOADING_EVENT } from "@/lib/navigation/route-loading";
import styles from "./RouteLoadingIndicator.module.scss";

const SAFETY_TIMEOUT_MS = 8000;

const isModifiedClick = (event: MouseEvent): boolean =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const shouldTrackAnchor = (anchor: HTMLAnchorElement): boolean => {
  if (
    (anchor.target && anchor.target !== "_self") ||
    anchor.hasAttribute("download") ||
    anchor.getAttribute("aria-disabled") === "true" ||
    anchor.dataset.routeLoading === "false"
  ) {
    return false;
  }

  const next = new URL(anchor.href, window.location.href);

  const current = new URL(window.location.href);

  if (next.origin !== current.origin) return false;

  return next.pathname !== current.pathname || next.search !== current.search;
};

export const RouteLoadingIndicator = () => {
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [active, setActive] = useState(false);

  const locationKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    let safetyTimer = 0;

    const finish = () => {
      window.clearTimeout(safetyTimer);
      safetyTimer = 0;
      setActive(false);
    };

    const start = () => {
      window.clearTimeout(safetyTimer);
      setActive(true);
      safetyTimer = window.setTimeout(finish, SAFETY_TIMEOUT_MS);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");

      if (!anchor || !shouldTrackAnchor(anchor)) return;

      start();
    };

    const onRouteStart = () => start();
    const onPageShow = () => finish();

    const finishFrame = window.requestAnimationFrame(finish);

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener(ROUTE_LOADING_EVENT, onRouteStart);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener(ROUTE_LOADING_EVENT, onRouteStart);
      window.removeEventListener("pageshow", onPageShow);
      window.cancelAnimationFrame(finishFrame);
      window.clearTimeout(safetyTimer);
    };
  }, [locationKey]);

  return (
    <div className={cn(styles.root, active && styles.active)} aria-hidden="true">
      <span className={styles.haze} />

      <span className={styles.track}>
        <span className={styles.bar} />
      </span>
    </div>
  );
};

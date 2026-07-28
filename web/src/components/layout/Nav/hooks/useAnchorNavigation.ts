"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import {
  ANCHOR_SCROLL_END_EVENT,
  ANCHOR_SCROLLING_ATTRIBUTE,
} from "@/lib/navigation/anchor-scroll";
import type { NavSectionClick } from "../types";

const ANCHOR_SCROLL_FALLBACK_MS = 1400;

export const useAnchorNavigation = (onNavigate: () => void): NavSectionClick => {
  const finishScrollRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      finishScrollRef.current?.();
    },
    [],
  );

  return useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (window.location.pathname !== "/") return;

      const section = document.getElementById(id);
      if (!section) return;

      event.preventDefault();
      onNavigate();

      const hash = `#${id}`;
      if (window.location.hash !== hash) window.history.pushState(null, "", `/${hash}`);

      finishScrollRef.current?.();

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            section.scrollIntoView({ behavior: "auto", block: "start" });
          });
        });
        return;
      }

      const root = document.documentElement;
      let firstFrame = 0;
      let secondFrame = 0;
      let fallbackTimer = 0;
      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        window.cancelAnimationFrame(firstFrame);
        window.cancelAnimationFrame(secondFrame);
        window.clearTimeout(fallbackTimer);
        window.removeEventListener("scrollend", finish);
        root.removeAttribute(ANCHOR_SCROLLING_ATTRIBUTE);
        window.dispatchEvent(new CustomEvent(ANCHOR_SCROLL_END_EVENT, { detail: id }));
        if (finishScrollRef.current === finish) finishScrollRef.current = null;
      };

      finishScrollRef.current = finish;
      root.setAttribute(ANCHOR_SCROLLING_ATTRIBUTE, "true");

      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => {
          window.addEventListener("scrollend", finish, { once: true });
          fallbackTimer = window.setTimeout(finish, ANCHOR_SCROLL_FALLBACK_MS);
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    },
    [onNavigate],
  );
};

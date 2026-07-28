"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useActiveSection } from "./useActiveSection";
import { useAnchorNavigation } from "./useAnchorNavigation";

export const useNavController = (sectionIds: string[]) => {
  const active = useActiveSection(sectionIds);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const resourcesButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);

  const closeNavigation = useCallback(() => {
    setMenuOpen(false);
    setResourcesOpen(false);
  }, []);
  const closeResources = useCallback(() => setResourcesOpen(false), []);
  const toggleMenu = useCallback(() => {
    setResourcesOpen(false);
    setMenuOpen((open) => !open);
  }, []);
  const toggleResources = useCallback(() => setResourcesOpen((open) => !open), []);
  const scrollToSection = useAnchorNavigation(closeNavigation);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 941px)");
    const previousOverflow = document.body.style.overflow;
    let focusFrame = 0;

    document.body.style.overflow = menuOpen ? "hidden" : previousOverflow;

    const panelControls = () =>
      Array.from(
        mobilePanelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex="0"]',
        ) ?? [],
      );

    if (menuOpen) {
      focusFrame = window.requestAnimationFrame(() => panelControls()[0]?.focus());
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (menuOpen) {
          closeNavigation();
          window.requestAnimationFrame(() => hamburgerRef.current?.focus());
        } else if (resourcesOpen) {
          closeResources();
          window.requestAnimationFrame(() => resourcesButtonRef.current?.focus());
        }
        return;
      }

      if (event.key !== "Tab" || !menuOpen) return;
      const hamburger = hamburgerRef.current;
      const lastControl = panelControls().at(-1);
      if (!hamburger || !lastControl) return;

      if (event.shiftKey && document.activeElement === hamburger) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        hamburger.focus();
      }
    };

    const onMediaChange = (event: MediaQueryListEvent) => {
      setResourcesOpen(false);
      if (event.matches) setMenuOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!resourcesRef.current?.contains(event.target as Node)) closeResources();
    };
    const onScroll = () => closeResources();

    window.addEventListener("keydown", onKeyDown);
    media.addEventListener("change", onMediaChange);
    if (resourcesOpen) {
      document.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      media.removeEventListener("change", onMediaChange);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [closeNavigation, closeResources, menuOpen, resourcesOpen]);

  return {
    active,
    menuOpen,
    resourcesOpen,
    resourcesRef,
    resourcesButtonRef,
    hamburgerRef,
    mobilePanelRef,
    closeNavigation,
    closeResources,
    toggleMenu,
    toggleResources,
    scrollToSection,
  };
};

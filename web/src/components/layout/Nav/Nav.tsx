"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { Button, LogoMark, ThemeToggleButton } from "@/components/ui";
import { useSessionStatus } from "@/lib/auth/useSessionStatus";
import { cn } from "@/lib/cn";
import { LINKS, SPY_IDS } from "./data";
import { useActiveSection } from "./hooks/useActiveSection";
import {
  ArrowUpRightIcon,
  BookIcon,
  ChevronDownIcon,
  GitHubIcon,
  HelpIcon,
  ScanIcon,
} from "./icons";
import styles from "./Nav.module.scss";

export function Nav() {
  const active = useActiveSection(SPY_IDS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);
  const resourcesButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const { authenticated: loggedIn, pending: sessionPending } = useSessionStatus();

  const closeNavigation = () => {
    setMenuOpen(false);
    setResourcesOpen(false);
  };

  const scrollToSection = (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.location.pathname !== "/") return;

    const section = document.getElementById(id);
    if (!section) return;

    event.preventDefault();
    closeNavigation();

    const hash = `#${id}`;
    if (window.location.hash !== hash) window.history.pushState(null, "", `/${hash}`);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        section.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
          block: "start",
        });
      });
    });
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (menuOpen) {
        setMenuOpen(false);
        setResourcesOpen(false);
        window.requestAnimationFrame(() => hamburgerRef.current?.focus());
      } else if (resourcesOpen) {
        setResourcesOpen(false);
        window.requestAnimationFrame(() => resourcesButtonRef.current?.focus());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, resourcesOpen]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 941px)");
    const onMediaChange = (event: MediaQueryListEvent) => {
      setResourcesOpen(false);
      if (event.matches) setMenuOpen(false);
    };

    media.addEventListener("change", onMediaChange);
    return () => {
      media.removeEventListener("change", onMediaChange);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const panel = mobilePanelRef.current;
    const hamburger = hamburgerRef.current;
    if (!panel || !hamburger) return;

    const getPanelControls = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]'),
      );
    const frame = window.requestAnimationFrame(() => getPanelControls()[0]?.focus());
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = getPanelControls();
      const last = controls.at(-1);
      if (!last) return;

      if (event.shiftKey && document.activeElement === hamburger) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        hamburger.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", trapFocus);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!resourcesOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!resourcesRef.current?.contains(event.target as Node)) {
        setResourcesOpen(false);
      }
    };
    const onScroll = () => setResourcesOpen(false);

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, [resourcesOpen]);

  const renderAccountLink = (className: string) => (
    <Link
      href={loggedIn ? "/dashboard" : "/login"}
      prefetch={false}
      className={className}
      onClick={closeNavigation}
    >
      <span>{loggedIn ? "Dashboard" : "Log in"}</span>
      <ArrowUpRightIcon />
    </Link>
  );

  return (
    <header className={cn(styles.nav, menuOpen && styles.menuOpen)}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Axiony home" onClick={closeNavigation}>
          <span className={styles.logoTile} aria-hidden="true">
            <LogoMark size={28} />
          </span>
          <span className={styles.brandCopy}>
            <span className={styles.wordmark}>Axiony</span>
            <span className={styles.brandMeta}>accessibility workflow</span>
          </span>
        </Link>

        <nav className={styles.links} aria-label="Primary navigation">
          {LINKS.map((link, index) => (
            <Link
              key={link.id}
              href={link.href}
              className={cn(styles.link, active === link.id && styles.linkActive)}
              aria-current={active === link.id ? "location" : undefined}
              onClick={(event) => scrollToSection(event, link.id)}
            >
              <span className={styles.linkIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span>{link.label}</span>
            </Link>
          ))}

          <div className={styles.resources} ref={resourcesRef}>
            <button
              ref={resourcesButtonRef}
              type="button"
              className={cn(
                styles.resourceTrigger,
                active === "faq" && styles.linkActive,
                resourcesOpen && styles.resourceTriggerOpen,
              )}
              aria-expanded={resourcesOpen}
              aria-controls="nav-resources"
              aria-haspopup="true"
              onClick={() => setResourcesOpen((open) => !open)}
            >
              <span>Resources</span>
              <ChevronDownIcon />
            </button>

            {resourcesOpen && (
              <div className={styles.resourceMenu} id="nav-resources">
                <div className={styles.resourceHeader}>
                  <span>{"// explore"}</span>
                  <span>Useful links</span>
                </div>

                <Link
                  href="/#faq"
                  className={styles.resourceItem}
                  onClick={(event) => scrollToSection(event, "faq")}
                >
                  <span className={styles.resourceIcon}>
                    <HelpIcon />
                  </span>
                  <span className={styles.resourceCopy}>
                    <strong>FAQ</strong>
                    <small>Answers without the fine print</small>
                  </span>
                  <ArrowUpRightIcon className={styles.resourceArrow} />
                </Link>

                <a
                  href="https://github.com/Drobashik/axiony"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.resourceItem}
                  onClick={() => setResourcesOpen(false)}
                >
                  <span className={styles.resourceIcon}>
                    <GitHubIcon />
                  </span>
                  <span className={styles.resourceCopy}>
                    <strong>GitHub</strong>
                    <small>Follow the product in public</small>
                  </span>
                  <ArrowUpRightIcon className={styles.resourceArrow} />
                </a>

                <span
                  className={cn(styles.resourceItem, styles.resourceDisabled)}
                  aria-disabled="true"
                >
                  <span className={styles.resourceIcon}>
                    <BookIcon />
                  </span>
                  <span className={styles.resourceCopy}>
                    <strong>
                      Docs <em>Soon</em>
                    </strong>
                    <small>Guides, API, and integrations</small>
                  </span>
                </span>
              </div>
            )}
          </div>
        </nav>

        <div className={styles.actions}>
          <ThemeToggleButton className={styles.themeToggle} />
          {sessionPending ? (
            <span className={styles.authSkeleton} aria-hidden="true" />
          ) : (
            renderAccountLink(styles.accountLink)
          )}
          <Button href="/scan" prefetch={false} size="sm" className={styles.scanButton}>
            <ScanIcon className={styles.scanIcon} />
            <span>Run free scan</span>
          </Button>
        </div>

        <button
          ref={hamburgerRef}
          type="button"
          className={styles.hamburger}
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {menuOpen && (
        <button
          type="button"
          className={styles.scrim}
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={() => {
            closeNavigation();
            hamburgerRef.current?.focus();
          }}
        />
      )}

      {menuOpen && (
        <div
          ref={mobilePanelRef}
          id="mobile-navigation"
          className={styles.mobilePanel}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className={styles.mobileHeader}>
            <span>{"// navigate"}</span>
            <span>Axiony / 04</span>
          </div>

          <nav className={styles.mobileLinks} aria-label="Mobile navigation">
            {LINKS.map((link, index) => (
              <Link
                key={link.id}
                href={link.href}
                className={cn(styles.mobileLink, active === link.id && styles.mobileLinkActive)}
                aria-current={active === link.id ? "location" : undefined}
                onClick={(event) => scrollToSection(event, link.id)}
              >
                <span className={styles.mobileIndex}>{String(index + 1).padStart(2, "0")}</span>
                <span>{link.label}</span>
                <ArrowUpRightIcon />
              </Link>
            ))}
            <Link
              href="/#faq"
              className={cn(styles.mobileLink, active === "faq" && styles.mobileLinkActive)}
              aria-current={active === "faq" ? "location" : undefined}
              onClick={(event) => scrollToSection(event, "faq")}
            >
              <span className={styles.mobileIndex}>04</span>
              <span>FAQ</span>
              <ArrowUpRightIcon />
            </Link>
          </nav>

          <div className={styles.mobileResources}>
            <a
              href="https://github.com/Drobashik/axiony"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileResource}
              onClick={closeNavigation}
            >
              <span className={styles.resourceIcon}>
                <GitHubIcon />
              </span>
              <span>GitHub</span>
              <ArrowUpRightIcon />
            </a>
            <span
              className={cn(styles.mobileResource, styles.mobileResourceDisabled)}
              aria-disabled="true"
            >
              <span className={styles.resourceIcon}>
                <BookIcon />
              </span>
              <span>Docs</span>
              <em>Soon</em>
            </span>
          </div>

          <div className={styles.mobileUtility}>
            <div className={styles.mobileTheme}>
              <span>
                <strong>Appearance</strong>
                <small>Light / dark</small>
              </span>
              <ThemeToggleButton />
            </div>
            {sessionPending ? (
              <span className={styles.mobileAuthSkeleton} aria-hidden="true" />
            ) : (
              renderAccountLink(styles.mobileAccount)
            )}
          </div>

          <Button
            href="/scan"
            prefetch={false}
            className={styles.mobileScan}
            onClick={closeNavigation}
          >
            <ScanIcon className={styles.scanIcon} />
            <span>Scan your site</span>
            <ArrowUpRightIcon />
          </Button>

          <span className={styles.mobileFootnote}>
            Accessibility, built into every pull request.
          </span>
        </div>
      )}
    </header>
  );
}

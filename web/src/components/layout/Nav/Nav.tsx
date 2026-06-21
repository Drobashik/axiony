"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, LogoMark } from "@/components/ui";
import cn from "classnames";
import { useScrolled } from "@/lib/hooks/useScrolled";
import { useSession } from "@/lib/auth-client";
import { LINKS, SPY_IDS } from "./data";
import { useActiveSection } from "./hooks/useActiveSection";
import { GitHubIcon, ScanIcon } from "./icons";
import styles from "./Nav.module.scss";

export const Nav = () => {
  const scrolled = useScrolled(8);
  const active = useActiveSection(SPY_IDS);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const { data: session, isPending: sessionPending } = useSession();
  const loggedIn = Boolean(session?.user);

  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 861px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuOpen(false);
    };

    query.addEventListener("change", closeOnDesktop);
    return () => query.removeEventListener("change", closeOnDesktop);
  }, []);

  // One shared underline that glides to the hovered link, falling back to
  // the section currently in view. Imperative style writes — no re-renders.
  const indicatorTarget = hovered ?? active;

  useEffect(() => {
    const position = () => {
      const indicator = indicatorRef.current;
      if (!indicator) return;

      const link = indicatorTarget ? linkRefs.current.get(indicatorTarget) : undefined;
      if (!link) {
        indicator.style.opacity = "0";
        return;
      }

      indicator.style.opacity = "1";
      indicator.style.transform = `translateX(${link.offsetLeft + 12}px)`;
      indicator.style.width = `${link.offsetWidth - 24}px`;
    };

    position();
    window.addEventListener("resize", position);
    return () => window.removeEventListener("resize", position);
  }, [indicatorTarget]);

  // Scroll progress as a scan line along the nav's bottom edge — blue while
  // "scanning" the page, green once the reader reaches the end.
  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const bar = progressRef.current;
      if (!bar) return;

      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = `scaleX(${progress})`;
      bar.classList.toggle(styles.progressDone, progress > 0.985);
    };

    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);

  const close = () => setMenuOpen(false);

  // Swap the auth CTA once the session resolves: logged-in → Dashboard,
  // otherwise Log in. While it's still loading we render a same-size skeleton
  // (desktop) so the bar never shifts or flashes the wrong link.
  const renderAuthLink = (className: string, onClick?: () => void) =>
    loggedIn ? (
      <Link href="/dashboard" className={className} onClick={onClick}>
        Dashboard
      </Link>
    ) : (
      <Link href="/login" className={className} onClick={onClick}>
        Log in
      </Link>
    );

  return (
    <header className={cn(styles.nav, scrolled && styles.scrolled, menuOpen && styles.menuOpen)}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={close} aria-label="Axiony — home">
          <LogoMark size={30} />
          <span className={styles.wordmark}>Axiony</span>
        </Link>

        <nav className={styles.links} aria-label="Primary" onMouseLeave={() => setHovered(null)}>
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              ref={(el) => {
                if (el) linkRefs.current.set(link.id, el);
                else linkRefs.current.delete(link.id);
              }}
              className={cn(styles.link, active === link.id && styles.linkActive)}
              aria-current={active === link.id ? "true" : undefined}
              onMouseEnter={() => setHovered(link.id)}
              onFocus={() => setHovered(link.id)}
              onBlur={() => setHovered(null)}
            >
              <span className={styles.hash} aria-hidden="true">
                #
              </span>
              {link.label}
            </a>
          ))}
          <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
        </nav>

        <div className={styles.actions}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={styles.ghLink}
            aria-label="Open Axiony on GitHub"
          >
            <GitHubIcon />
            GitHub
          </a>
          {sessionPending ? (
            <span className={styles.authSkeleton} aria-hidden="true" />
          ) : (
            renderAuthLink(styles.signIn)
          )}
          <Button href="/scan" size="sm" className={styles.scanCta}>
            <ScanIcon />
            <span className={styles.ctaText}>Start scanning</span>
          </Button>
        </div>

        <button
          type="button"
          className={styles.menuToggle}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>
      </div>

      {menuOpen && (
        <button type="button" className={styles.scrim} aria-label="Close menu" onClick={close} />
      )}

      <div
        id="mobile-navigation"
        className={cn(styles.mobile, menuOpen && styles.mobileOpen)}
        aria-hidden={!menuOpen}
      >
        <nav className={styles.mobileLinks} aria-label="Mobile">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(styles.mobileLink, active === link.id && styles.mobileLinkActive)}
              aria-current={active === link.id ? "true" : undefined}
              onClick={close}
            >
              <span>
                <span className={styles.hash} aria-hidden="true">
                  #
                </span>
                {link.label}
              </span>
            </a>
          ))}
        </nav>

        <div className={styles.mobileActions}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={styles.mobileAction}
            onClick={close}
          >
            <GitHubIcon />
            GitHub
          </a>
          {renderAuthLink(styles.mobileAction, close)}
        </div>

        <Button href="/scan" size="lg" block onClick={close} className={styles.mobileCta}>
          <ScanIcon />
          Start scanning free
        </Button>
      </div>

      <span ref={progressRef} className={styles.progress} aria-hidden="true" />
    </header>
  );
};

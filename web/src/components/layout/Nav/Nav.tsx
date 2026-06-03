"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, LogoMark } from "@/components/ui";
import cn from "classnames";
import { useScrolled } from "@/lib/hooks/useScrolled";
import styles from "./Nav.module.scss";

interface NavItem {
  /** In-page anchor. */
  href: string;
  label: string;
  /** Section id used for scroll-spy. */
  id: string;
}

const LINKS: NavItem[] = [
  { href: "#workflow", label: "How it works", id: "workflow" },
  { href: "#pricing", label: "Pricing", id: "pricing" },
  { href: "#faq", label: "FAQ", id: "faq" },
];

const SPY_IDS = LINKS.map((l) => l.id);

/**
 * Top navigation. Transparent over the hero, frosts on scroll. Links are
 * in-page anchors that highlight as you scroll (scroll-spy), and it
 * collapses into a toggle menu on small screens.
 */
export function Nav() {
  const scrolled = useScrolled(8);
  const active = useActiveSection(SPY_IDS);
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        styles.nav,
        scrolled && styles.scrolled,
        menuOpen && styles.menuOpen,
      )}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={close} aria-label="Axiony — home">
          <LogoMark size={30} />
          <span>Axiony</span>
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(styles.link, active === link.id && styles.linkActive)}
              aria-current={active === link.id ? "true" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={styles.ghLink}
          >
            <GitHubIcon />
            GitHub
          </a>
          <Button href="#quickstart" size="sm">
            <ScanIcon />
            Start scanning
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

      <div
        id="mobile-navigation"
        className={cn(styles.mobile, menuOpen && styles.mobileOpen)}
      >
        <nav className={styles.mobileLinks} aria-label="Mobile">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(styles.mobileLink, active === link.id && styles.mobileLinkActive)}
              onClick={close}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className={styles.mobileLink}
            onClick={close}
          >
            GitHub
          </a>
        </nav>
        <Button href="#quickstart" size="lg" block onClick={close}>
          Start scanning free
        </Button>
      </div>
    </header>
  );
}

/** Highlights the nav link for whichever section is currently in view. */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return undefined;

    const visibility = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting);
        }
        // First section (in DOM/nav order) that's in the active band.
        setActive(ids.find((id) => visibility.get(id)) ?? null);
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

// ── Inline icons (local to the nav) ──────────────────────────────────
function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

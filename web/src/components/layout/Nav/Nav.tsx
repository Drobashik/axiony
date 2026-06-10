"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, LogoMark } from "@/components/ui";
import cn from "classnames";
import { useScrolled } from "@/lib/hooks/useScrolled";
import { LINKS, SPY_IDS } from "./data";
import { useActiveSection } from "./hooks/useActiveSection";
import { GitHubIcon, ScanIcon } from "./icons";
import styles from "./Nav.module.scss";

export const Nav = () => {
  const scrolled = useScrolled(8);
  const active = useActiveSection(SPY_IDS);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const close = () => setMenuOpen(false);

  return (
    <header className={cn(styles.nav, scrolled && styles.scrolled, menuOpen && styles.menuOpen)}>
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
          <a href="https://github.com" target="_blank" rel="noreferrer" className={styles.ghLink}>
            <GitHubIcon />
            GitHub
          </a>
          <Link href="/login" className={styles.signIn}>
            Log in
          </Link>
          <Button href="/scan" size="sm">
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

      {menuOpen && (
        <button type="button" className={styles.scrim} aria-label="Close menu" onClick={close} />
      )}

      <div id="mobile-navigation" className={cn(styles.mobile, menuOpen && styles.mobileOpen)}>
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
          <Link href="/login" className={styles.mobileLink} onClick={close}>
            Log in
          </Link>
        </nav>
        <Button href="/scan" size="lg" block onClick={close}>
          Start scanning free
        </Button>
      </div>
    </header>
  );
};

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, LogoMark } from "@/components/ui";
import cn from "classnames";
import { useScrolled } from "@/lib/hooks/useScrolled";
import styles from "./Nav.module.scss";

interface NavLinkSpec {
  href: string;
  label: string;
  /** Subpath that activates the link (defaults to `href`). */
  match?: string;
}

const PRIMARY_LINKS: NavLinkSpec[] = [
  { href: "/#features", label: "Features", match: "/" },
  { href: "/docs",      label: "Docs",     match: "/docs" },
  { href: "/pricing",   label: "Pricing",  match: "/pricing" },
  { href: "/#blog",     label: "Blog" },
];

/**
 * Top-level navigation bar shared by all marketing pages.
 * Reads the current pathname so it can mark the active link without
 * needing each page to pass an `activePage` prop.
 */
export function Nav() {
  const scrolled = useScrolled();
  const pathname = usePathname() ?? "/";

  const isActive = (link: NavLinkSpec) =>
    link.match === undefined
      ? false
      : link.match === "/"
        ? pathname === "/"
        : pathname.startsWith(link.match);

  return (
    <nav className={cn(styles.nav, scrolled && styles.scrolled)}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <LogoMark />
          Axiony
        </Link>

        <div className={styles.links}>
          {PRIMARY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(styles.link, isActive(link) && styles.linkActive)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <Button href="https://github.com" variant="ghost" size="sm" target="_blank" rel="noreferrer">
            <GitHubIcon />
            GitHub
          </Button>
          <Button href="/dashboard" variant="ghost" size="sm">
            <DashboardIcon />
            Dashboard
          </Button>
          <Button href="/scan" variant="primary" size="sm">
            <ScanIcon />
            Start scanning
          </Button>
        </div>
      </div>
    </nav>
  );
}

// ── Inline icons (kept local — not used elsewhere) ─────────────────────
function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

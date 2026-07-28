import Link from "next/link";
import type { RefObject } from "react";
import { Button, ThemeToggleButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { LINKS } from "../data";
import { ArrowUpRightIcon, BookIcon, GitHubIcon, ScanIcon } from "../icons";
import styles from "../Nav.module.scss";
import type { NavSectionClick } from "../types";
import { NavAccountLink } from "./NavAccountLink";

interface NavMobileProps {
  active: string | null;
  loggedIn: boolean;
  sessionPending: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  onSectionClick: NavSectionClick;
  onClose: () => void;
}

export const NavMobile = ({
  active,
  loggedIn,
  sessionPending,
  panelRef,
  onSectionClick,
  onClose,
}: NavMobileProps) => (
  <div
    ref={panelRef}
    id="mobile-navigation"
    className={styles.mobilePanel}
    role="dialog"
    aria-modal="true"
    aria-label="Site navigation"
  >
    <div className={styles.mobileHeader}>
      <span>{"// navigate"}</span>
      <span>Axiony / {String(LINKS.length).padStart(2, "0")}</span>
    </div>

    <nav className={styles.mobileLinks} aria-label="Mobile navigation">
      {LINKS.map((link, index) => (
        <Link
          key={link.id}
          href={link.href}
          className={cn(styles.mobileLink, active === link.id && styles.mobileLinkActive)}
          aria-current={active === link.id ? "location" : undefined}
          onClick={(event) => onSectionClick(event, link.id)}
        >
          <span className={styles.mobileIndex}>{String(index + 1).padStart(2, "0")}</span>
          <span>{link.label}</span>
          <ArrowUpRightIcon />
        </Link>
      ))}
    </nav>

    <div className={styles.mobileResources}>
      <a
        href="https://github.com/Drobashik/axiony"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.mobileResource}
        onClick={onClose}
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
        <strong>Theme</strong>
        <ThemeToggleButton />
      </div>
      {sessionPending ? (
        <span className={styles.mobileAuthSkeleton} aria-hidden="true" />
      ) : (
        <NavAccountLink loggedIn={loggedIn} className={styles.mobileAccount} onClick={onClose} />
      )}
    </div>

    <Button href="/scan" prefetch={false} className={styles.mobileScan} onClick={onClose}>
      <ScanIcon className={styles.scanIcon} />
      <span>Scan your site</span>
      <ArrowUpRightIcon />
    </Button>

    <span className={styles.mobileFootnote}>Accessibility, built into every pull request.</span>
  </div>
);

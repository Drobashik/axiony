import Link from "next/link";
import type { RefObject } from "react";
import { cn } from "@/lib/cn";
import { LINKS } from "../data";
import { ArrowUpRightIcon, BookIcon, ChevronDownIcon, GitHubIcon } from "../icons";
import styles from "../Nav.module.scss";
import type { NavSectionClick } from "../types";

interface NavDesktopProps {
  active: string | null;
  resourcesOpen: boolean;
  resourcesRef: RefObject<HTMLDivElement | null>;
  resourcesButtonRef: RefObject<HTMLButtonElement | null>;
  onSectionClick: NavSectionClick;
  onToggleResources: () => void;
  onCloseResources: () => void;
}

export const NavDesktop = ({
  active,
  resourcesOpen,
  resourcesRef,
  resourcesButtonRef,
  onSectionClick,
  onToggleResources,
  onCloseResources,
}: NavDesktopProps) => (
  <nav className={styles.links} aria-label="Primary navigation">
    {LINKS.map((link, index) => (
      <Link
        key={link.id}
        href={link.href}
        className={cn(styles.link, active === link.id && styles.linkActive)}
        aria-current={active === link.id ? "location" : undefined}
        onClick={(event) => onSectionClick(event, link.id)}
      >
        <span className={styles.linkIndex}>{String(index + 1).padStart(2, "0")}</span>
        <span>{link.label}</span>
      </Link>
    ))}

    <div className={styles.resources} ref={resourcesRef}>
      <button
        ref={resourcesButtonRef}
        type="button"
        className={cn(styles.resourceTrigger, resourcesOpen && styles.resourceTriggerOpen)}
        aria-expanded={resourcesOpen}
        aria-controls="nav-resources"
        aria-haspopup="true"
        onClick={onToggleResources}
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

          <a
            href="https://github.com/Drobashik/axiony"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.resourceItem}
            onClick={onCloseResources}
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

          <span className={cn(styles.resourceItem, styles.resourceDisabled)} aria-disabled="true">
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
);

"use client";

import { Button, ThemeToggleButton } from "@/components/ui";
import { useSessionStatus } from "@/lib/auth/useSessionStatus";
import { cn } from "@/lib/cn";
import { NavAccountLink } from "./components/NavAccountLink";
import { NavBrand } from "./components/NavBrand";
import { NavDesktop } from "./components/NavDesktop";
import { NavMobile } from "./components/NavMobile";
import { ScrollProgress } from "./components/ScrollProgress";
import { SPY_IDS } from "./data";
import { useNavController } from "./hooks/useNavController";
import { ScanIcon } from "./icons";
import styles from "./Nav.module.scss";

export function Nav() {
  const { authenticated: loggedIn, pending: sessionPending } = useSessionStatus();
  const {
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
  } = useNavController(SPY_IDS);

  return (
    <header className={cn(styles.nav, menuOpen && styles.menuOpen)}>
      <div className={styles.inner}>
        <NavBrand onClick={closeNavigation} />

        <NavDesktop
          active={active}
          resourcesOpen={resourcesOpen}
          resourcesRef={resourcesRef}
          resourcesButtonRef={resourcesButtonRef}
          onSectionClick={scrollToSection}
          onToggleResources={toggleResources}
          onCloseResources={closeResources}
        />

        <div className={styles.actions}>
          <ThemeToggleButton className={styles.themeToggle} />
          {sessionPending ? (
            <span className={styles.authSkeleton} aria-hidden="true" />
          ) : (
            <NavAccountLink
              loggedIn={loggedIn}
              className={styles.accountLink}
              onClick={closeNavigation}
            />
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
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <ScrollProgress />
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
        <NavMobile
          active={active}
          loggedIn={loggedIn}
          sessionPending={sessionPending}
          panelRef={mobilePanelRef}
          onSectionClick={scrollToSection}
          onClose={closeNavigation}
        />
      )}
    </header>
  );
}

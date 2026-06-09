import Link from "next/link";
import { Button } from "@/components/ui";
import { DashboardTab } from "@/lib/data/dashboard";
import styles from "./Topbar.module.scss";

export interface TopbarProps {
  activeTab: DashboardTab;
  /** In-dashboard scan → switch to the scan tab instead of linking to /scan. */
  onNewScan?: () => void;
}

const SCAN_ICON = (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

export function Topbar({ activeTab, onNewScan }: TopbarProps) {
  return (
    <div className={styles.topbar}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Axiony</Link>
        <span className={styles.sep}>/</span>
        <span className={styles.current}>{activeTab}</span>
      </nav>

      <div className={styles.actions}>
        <button type="button" className={styles.notif} aria-label="Notifications">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span className={styles.dot} />
        </button>
        {onNewScan ? (
          <Button size="sm" onClick={onNewScan}>
            {SCAN_ICON}
            New scan
          </Button>
        ) : (
          <Button href="/scan" size="sm">
            {SCAN_ICON}
            New scan
          </Button>
        )}
      </div>
    </div>
  );
}

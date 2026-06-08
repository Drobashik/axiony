import Link from "next/link";
import styles from "./PreviewBanner.module.scss";

/**
 * Slim header strip pinned above the dashboard shell.
 *
 * The real dashboard sits behind authentication; until that ships this
 * route is a public preview, so the banner frames the page as an
 * interactive demo running on sample data and offers a way back to the
 * marketing site.
 */
export function PreviewBanner() {
  return (
    <header className={styles.banner}>
      <div className={styles.intro}>
        <span className={styles.tag}>
          <span className={styles.pulse} aria-hidden="true" />
          Preview
        </span>
        <span className={styles.note}>
          Interactive demo of the Axiony dashboard — every figure below is sample data.
        </span>
      </div>

      <Link href="/" className={styles.back}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to site
      </Link>
    </header>
  );
}

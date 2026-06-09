import cn from "classnames";
import styles from "../ScanStudio.module.scss";

export const StudioHeader = () => (
  <div className={cn(styles.header, "reveal")}>
    <span className={styles.previewBadge}>
      <span className={styles.previewDot} aria-hidden="true" />
      Cloud Scanner Preview
    </span>

    <h1 className={styles.title}>
      Scan your site. <span className={styles.titleAccent}>See what to fix.</span>
    </h1>

    <p className={styles.subtitle}>
      Paste a URL to preview the Axiony Cloud scanner — get an accessibility score, severity
      breakdown, plain-English fixes, and a baseline your team can track.
    </p>

    <p className={styles.note}>
      Preview mode · results use sample data until cloud scanning is available.
    </p>
  </div>
);

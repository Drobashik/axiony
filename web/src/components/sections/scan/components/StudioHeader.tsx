import cn from "classnames";
import styles from "../ScanStudio.module.scss";

export const StudioHeader = () => (
  <div className={cn(styles.header, "reveal")}>
    <h1 className={styles.title}>
      Scan a page. <span className={styles.titleAccent}>Get fixes.</span>
    </h1>

    <p className={styles.subtitle}>Paste a URL and see what matters first.</p>
  </div>
);

import type { ReactNode } from "react";
import styles from "./layout.module.scss";

const StudioLayout = ({ children }: { children: ReactNode }) => (
  <main className={styles.main}>{children}</main>
);

export default StudioLayout;

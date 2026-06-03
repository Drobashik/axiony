import type { ReactNode } from "react";
import { Footer, Nav } from "@/components/layout";
import styles from "./layout.module.scss";

const MarketingLayout = ({ children }: { children: ReactNode }) => (
  <>
    <Nav />
    <main className={styles.main}>{children}</main>
    <Footer />
  </>
);

export default MarketingLayout;

import { ReactNode } from "react";
import { Footer, Nav } from "@/components/layout";
import styles from "./layout.module.scss";

/**
 * Layout shared by all "marketing" pages (home, pricing, docs, scan).
 * The dashboard lives outside this group because it needs a fundamentally
 * different shell (full-bleed sidebar, no nav/footer).
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main className={styles.main}>{children}</main>
      <Footer />
    </>
  );
}

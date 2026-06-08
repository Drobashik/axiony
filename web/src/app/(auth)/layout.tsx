import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/ui";
import styles from "./layout.module.scss";

/**
 * Full-bleed shell for the auth routes — a soft, branded backdrop with a
 * slim top bar. Deliberately has no marketing nav/footer so the login and
 * signup screens stay focused.
 */
const AuthLayout = ({ children }: { children: ReactNode }) => (
  <div className={styles.backdrop}>
    <header className={styles.topbar}>
      <Link href="/" className={styles.brand} aria-label="Axiony — home">
        <LogoMark size={28} />
        <span>Axiony</span>
      </Link>

      <Link href="/" className={styles.back}>
        <svg
          width="15"
          height="15"
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

    <main className={styles.main}>{children}</main>
  </div>
);

export default AuthLayout;

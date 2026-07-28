import Link from "next/link";
import { LogoMark } from "@/components/ui";
import styles from "../Nav.module.scss";

export const NavBrand = ({ onClick }: { onClick: () => void }) => (
  <Link href="/" className={styles.logo} aria-label="Axiony home" onClick={onClick}>
    <span className={styles.logoTile} aria-hidden="true">
      <LogoMark size={28} />
    </span>
    <span className={styles.brandCopy}>
      <span className={styles.wordmark}>Axiony</span>
      <span className={styles.brandMeta}>accessibility workflow</span>
    </span>
  </Link>
);

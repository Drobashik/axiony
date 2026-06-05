import Link from "next/link";
import { Container, LogoMark, Pill } from "@/components/ui";
import { FOOTER_BADGES, FOOTER_COLUMNS } from "./data";
import styles from "./Footer.module.scss";

export const Footer = () => (
  <footer className={styles.footer}>
    <Container>
      <div className={styles.grid}>
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLink}>
            <LogoMark />
            Axiony
          </Link>
          <p className={styles.brandTag}>
            An accessibility workflow platform for product and engineering teams — from a free,
            open-source CLI to cloud dashboards and pull-request checks.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.heading} className={styles.column}>
            <h5>{col.heading}</h5>
            {col.links.map((link) => (
              <Link key={link.label} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Axiony, Inc. All rights reserved.</p>
        <div className={styles.bottomPills}>
          {FOOTER_BADGES.map((badge) => (
            <Pill key={badge.label} tone={badge.tone}>
              {badge.label}
            </Pill>
          ))}
        </div>
      </div>
    </Container>
  </footer>
);

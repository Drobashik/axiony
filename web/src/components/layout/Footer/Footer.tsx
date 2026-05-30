import Link from "next/link";
import { Container, LogoMark, Pill } from "@/components/ui";
import styles from "./Footer.module.scss";

interface FooterColumn {
  heading: string;
  links: { href: string; label: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { href: "/#features",   label: "Features" },
      { href: "/pricing",     label: "Pricing" },
      { href: "/#changelog",  label: "Changelog" },
      { href: "#",            label: "Roadmap" },
    ],
  },
  {
    heading: "Docs",
    links: [
      { href: "/docs",          label: "Introduction" },
      { href: "/docs#install",  label: "Installation" },
      { href: "/docs#cli",      label: "CLI Reference" },
      { href: "/docs#ci",       label: "CI Integration" },
      { href: "/docs#config",   label: "Configuration" },
    ],
  },
  {
    heading: "Community",
    links: [
      { href: "#", label: "GitHub" },
      { href: "#", label: "Discord" },
      { href: "#", label: "Blog" },
      { href: "#", label: "Twitter / X" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "#", label: "About" },
      { href: "#", label: "Contact" },
      { href: "#", label: "Privacy" },
      { href: "#", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.brandLink}>
              <LogoMark />
              Axiony
            </Link>
            <p className={styles.brandTag}>
              Developer-first accessibility testing for modern teams. Fast, structured, CI-ready.
            </p>
          </div>

          {COLUMNS.map((col) => (
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
            <Pill tone="green">SOC 2 Ready</Pill>
            <Pill tone="blue">WCAG 2.2</Pill>
          </div>
        </div>
      </Container>
    </footer>
  );
}

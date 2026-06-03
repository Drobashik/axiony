import { Container } from "@/components/ui";
import cn from "classnames";
import { BUILT_WITH } from "@/lib/data/home";
import styles from "./TrustBar.module.scss";

/**
 * Credibility strip. Shows the standards and tooling Axiony is built on
 * rather than borrowed customer logos.
 */
export function TrustBar() {
  return (
    <div className={styles.bar}>
      <Container>
        <div className={cn(styles.inner, "reveal")}>
          <span className={styles.label}>Built on tooling you already trust</span>
          <div className={styles.badges}>
            {BUILT_WITH.map((item, i) => (
              <span key={item} className={cn(styles.badge, `d${i + 1}`)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

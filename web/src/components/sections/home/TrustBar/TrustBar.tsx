import { Container } from "@/components/ui";
import cn from "classnames";
import { TRUST_LOGOS } from "@/lib/data/home";
import styles from "./TrustBar.module.scss";

export function TrustBar() {
  return (
    <div className={styles.bar}>
      <Container>
        <div className={cn(styles.inner, "reveal")}>
          <span className={styles.label}>Trusted by teams at</span>
          <div className={styles.logos}>
            {TRUST_LOGOS.map((logo, i) => (
              <span key={logo} className={cn(styles.logo, `d${i + 1}`)}>
                {logo}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

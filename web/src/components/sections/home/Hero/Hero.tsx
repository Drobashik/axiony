import { Button, Container } from "@/components/ui";
import { WorkspaceCta } from "../WorkspaceCta";
import { CloudScanner } from "./components/CloudScanner";
import { ArrowRightIcon, CloudIcon, ShieldIcon, TerminalIcon } from "./components/icons";
import { InstallCommand } from "./components/InstallCommand";
import { RevealLine } from "./components/RevealLine";
import {
  SUBTITLE,
  TITLE_ACCENT_TEXT,
  TITLE_LINE_ONE,
  TITLE_WORD_SQUIGGLED,
  VALUE_POINTS,
} from "./data";
import styles from "./Hero.module.scss";

const SQUIGGLE_PATH =
  "M2 6.2 C7 1.9 12 1.9 17 6.2 S27 10.5 32 6.2 S42 1.9 47 6.2 S57 10.5 62 6.2 S72 1.9 77 6.2 S87 10.5 98 5.2";

const VALUE_POINT_ICONS = [TerminalIcon, CloudIcon, ShieldIcon] as const;

export const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.grid} aria-hidden="true" />
    <div className={styles.glow} aria-hidden="true" />
    <div className={styles.glowAlt} aria-hidden="true" />
    <div className={styles.noise} aria-hidden="true" />

    <Container className={styles.container}>
      <div className={styles.copy}>
        <h1 className={styles.title}>
          <RevealLine text={TITLE_LINE_ONE} startDelay={0.15} />
          <br />
          <em className={styles.titleAccent}>
            <span className={styles.squiggleWrap}>
              <RevealLine text={TITLE_ACCENT_TEXT} startDelay={0.6} />
              {/* Lint-style squiggle: the product is flagging inaccessible UI like an editor error. */}
              <svg
                className={styles.squiggle}
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <mask id="hero-inaccessible-squiggle-mask" maskUnits="userSpaceOnUse">
                  <rect
                    className={styles.squiggleMask}
                    x="0"
                    y="-2"
                    width="100"
                    height="16"
                    fill="white"
                    transform="scale(0 1)"
                  />
                </mask>
                <g mask="url(#hero-inaccessible-squiggle-mask)">
                  <path className={styles.squiggleGlow} d={SQUIGGLE_PATH} />
                  <path className={styles.squiggleMain} d={SQUIGGLE_PATH} />
                </g>
              </svg>
            </span>{" "}
            <RevealLine text={TITLE_WORD_SQUIGGLED} startDelay={0.98} />
          </em>
          <span className={styles.titleCaret} aria-hidden="true" />
        </h1>

        <p className={styles.subtitle}>{SUBTITLE}</p>

        <ul className={styles.valuePoints} aria-label="Why Axiony">
          {VALUE_POINTS.map((point, index) => {
            const Icon = VALUE_POINT_ICONS[index];

            return (
              <li key={point}>
                <span className={styles.valueIcon}>
                  <Icon />
                </span>
                <span>{point}</span>
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          <Button href="/scan" size="lg">
            Scan your site now
            <ArrowRightIcon />
          </Button>
          <WorkspaceCta />
        </div>

        <InstallCommand />
      </div>

      <CloudScanner />
    </Container>
  </section>
);

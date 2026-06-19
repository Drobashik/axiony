import { Button, Container } from "@/components/ui";
import { ArrowRightIcon, CheckIcon } from "./components/icons";
import { InstallCommand } from "./components/InstallCommand";
import { LiveTerminal } from "./components/LiveTerminal";
import { RevealLine } from "./components/RevealLine";
import {
  SUBTITLE,
  TITLE_LINE_ONE,
  TITLE_LINE_THREE,
  TITLE_LINE_TWO,
  TITLE_WORD_SQUIGGLED,
  VALUE_POINTS,
} from "./data";
import styles from "./Hero.module.scss";

const SQUIGGLE_PATH =
  "M2 6.2 C7 1.9 12 1.9 17 6.2 S27 10.5 32 6.2 S42 1.9 47 6.2 S57 10.5 62 6.2 S72 1.9 77 6.2 S87 10.5 98 5.2";

export const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.grid} aria-hidden="true" />
    <div className={styles.glow} aria-hidden="true" />
    <div className={styles.glowAlt} aria-hidden="true" />
    <div className={styles.noise} aria-hidden="true" />

    <Container className={styles.container}>
      <div className={styles.copy}>
        {/* The comment every codebase has — except here "later" finally loses. */}
        <div className={styles.todo}>
          <span className={styles.todoComment}>{"// TODO: fix accessibility"}</span>
          <s className={styles.todoLater} aria-hidden="true">
            later
          </s>
          <span className={styles.todoToday}>today.</span>
        </div>

        <h1 className={styles.title}>
          <RevealLine text={TITLE_LINE_ONE} startDelay={0.15} />
          <br />
          <em className={styles.titleAccent}>
            <RevealLine text={TITLE_LINE_TWO} startDelay={0.6} />
            <br />
            <RevealLine text={TITLE_LINE_THREE} startDelay={0.98} />{" "}
            <span className={styles.squiggleWrap}>
              <RevealLine text={TITLE_WORD_SQUIGGLED} startDelay={1.1} />
              {/* Lint-style squiggle: the word is "flagged", like an error in your editor */}
              <svg
                className={styles.squiggle}
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <mask id="hero-worse-squiggle-mask" maskUnits="userSpaceOnUse">
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
                <g mask="url(#hero-worse-squiggle-mask)">
                  <path className={styles.squiggleGlow} d={SQUIGGLE_PATH} />
                  <path className={styles.squiggleMain} d={SQUIGGLE_PATH} />
                </g>
              </svg>
            </span>
          </em>
          <span className={styles.titleCaret} aria-hidden="true" />
        </h1>

        <p className={styles.subtitle}>{SUBTITLE}</p>

        <ul className={styles.valuePoints} aria-label="Why Axiony">
          {VALUE_POINTS.map((point) => (
            <li key={point}>
              <CheckIcon />
              {point}
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <Button href="/scan" size="lg">
            Scan your site now
            <ArrowRightIcon />
          </Button>
          <Button href="/signup" variant="secondary" size="lg">
            Create your workspace
          </Button>
        </div>

        <InstallCommand />
      </div>

      <LiveTerminal />
    </Container>
  </section>
);

"use client";

import { Button, Container } from "@/components/ui";
import { ArrowRightIcon } from "./components/icons";
import { RevealLine } from "./components/RevealLine";
import { ScanCard } from "./components/ScanCard";
import { TITLE_LINE_ONE, TITLE_LINE_TWO, VALUE_POINTS } from "./data";
import styles from "./Hero.module.scss";

export const Hero = () => (
  <section className={styles.hero}>
    <div className={styles.grid} aria-hidden="true" />
    <div className={styles.glow} aria-hidden="true" />

    <Container className={styles.container}>
      <div className={styles.copy}>
        <div className={styles.label}>
          <span className={styles.labelDot} aria-hidden="true" />
          Free open-source CLI · Hosted cloud for teams
        </div>

        <h1 className={styles.title}>
          <RevealLine text={TITLE_LINE_ONE} startDelay={0.15} />
          <br />
          <em className={styles.titleAccent}>
            <RevealLine text={TITLE_LINE_TWO} startDelay={0.45} />
          </em>
        </h1>

        <p className={styles.subtitle}>
          Axiony scans your UI with axe-core in your terminal, your CI, and the
          cloud — then locks a baseline so the issues you fix never come back.
        </p>

        <div className={styles.valuePoints} aria-label="Why Axiony">
          {VALUE_POINTS.map((point) => (
            <span key={point}>{point}</span>
          ))}
        </div>

        <div className={styles.actions}>
          <Button href="/scan" size="lg">
            Start scanning free
            <ArrowRightIcon />
          </Button>
          <Button href="/dashboard" variant="secondary" size="lg">
            View dashboard preview
          </Button>
        </div>
      </div>

      <ScanCard />
    </Container>
  </section>
);

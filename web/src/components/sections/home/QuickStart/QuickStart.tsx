"use client";

import { ReactNode, useState } from "react";
import { Button, Container, Icon, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import styles from "./QuickStart.module.scss";

interface QuickStep {
  n: string;
  title: string;
  command: string;
  note: ReactNode;
  accent: "green" | "blue" | "violet";
}

const STEPS: QuickStep[] = [
  {
    n: "01",
    title: "Install",
    command: "npm i -g axiony-cli",
    accent: "green",
    note: (
      <>
        Then <code>axiony install</code> grabs the Playwright browser.
      </>
    ),
  },
  {
    n: "02",
    title: "Scan anything",
    command: "axiony scan https://your-site.com",
    accent: "blue",
    note: (
      <>
        Also scans HTML files and React components — <code>axiony html</code>,{" "}
        <code>axiony component</code>.
      </>
    ),
  },
  {
    n: "03",
    title: "Block it in CI",
    command: "axiony scan <url> --ci",
    accent: "violet",
    note: <>Exits non-zero on new issues, so the build fails before they ship.</>,
  },
];

/** Copy-paste quick start — the fastest path from landing to first scan. */
export function QuickStart() {
  return (
    <Section surface id="quickstart">
      <Container>
        <div className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>Quick start</SectionEyebrow>
          <h2>Your first scan, in under a minute.</h2>
          <p className={styles.lead}>
            Free, open-source, no account. Copy, paste, scan.
          </p>
        </div>

        <div className={cn(styles.grid, "reveal")}>
          {STEPS.map((step) => (
            <article key={step.n} className={cn(styles.step, styles[`accent_${step.accent}`])}>
              <div className={styles.stepHead}>
                <span className={styles.num}>{step.n}</span>
                <span className={styles.title}>{step.title}</span>
              </div>
              <CommandLine command={step.command} />
              <p className={styles.note}>{step.note}</p>
            </article>
          ))}
        </div>

        <div className={cn(styles.footer, "reveal")}>
          <span className={styles.npx}>
            No install needed — <code>{"npx axiony-cli scan <url>"}</code>
          </span>
          <Button href="/docs" variant="secondary">
            Read the docs →
          </Button>
        </div>
      </Container>
    </Section>
  );
}

function CommandLine({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className={styles.cmd}>
      <span className={styles.prompt}>$</span>
      <code className={styles.cmdText}>{command}</code>
      <button
        type="button"
        className={cn(styles.copy, copied && styles.copied)}
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
      >
        {copied ? <Icon name="check" size={15} /> : <CopyIcon />}
      </button>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

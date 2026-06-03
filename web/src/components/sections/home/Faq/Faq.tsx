"use client";

import { ReactNode, useState } from "react";
import { Button, Container, SectionEyebrow } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import styles from "./Faq.module.scss";

interface QA {
  q: string;
  a: ReactNode;
}

const FAQS: QA[] = [
  {
    q: "What does Axiony do?",
    a: (
      <>
        It scans your UI for accessibility issues with axe-core — in your
        terminal, in CI, and in the cloud — so you catch them before your users
        do.
      </>
    ),
  },
  {
    q: "What can it scan?",
    a: (
      <>
        A live URL (<code>axiony scan</code>), an HTML file (
        <code>axiony html</code>), or a React component (
        <code>axiony component</code>). Add <code>--selector</code> to scan just
        part of a page.
      </>
    ),
  },
  {
    q: "How fast can I try it?",
    a: (
      <>
        One command, no account: <code>{"npx axiony-cli scan <url>"}</code>.
        Prefer to keep it around? <code>npm i -g axiony-cli</code>.
      </>
    ),
  },
  {
    q: "Can it replace a manual audit?",
    a: (
      <>
        No — and nothing should. Automated checks find about a third of WCAG
        issues; Axiony catches those on every commit, so your manual review
        stays small instead of becoming a cleanup project.
      </>
    ),
  },
  {
    q: "Does it fit my framework and CI?",
    a: (
      <>
        Yes. It scans the rendered DOM, so it works with React, Vue, Svelte or
        plain HTML — and runs in GitHub Actions, GitLab CI, or any pipeline.
      </>
    ),
  },
  {
    q: "What does it cost?",
    a: (
      <>
        The CLI is free and MIT-licensed, forever. The hosted scanner,
        dashboard, and team features are the planned Pro and Team plans.
      </>
    ),
  },
  {
    q: "Is the cloud ready?",
    a: (
      <>
        The CLI ships today. The hosted scanner and dashboard are a preview —
        pricing is planned, with no card needed to start.
      </>
    ),
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section surface id="faq">
      <Container>
        <div className={styles.grid}>
          <div className={cn(styles.aside, "reveal-left")}>
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2>Questions, answered.</h2>
            <p className={styles.asideLead}>
              Everything worth knowing before your first scan.
            </p>
            <div className={styles.help}>
              <span className={styles.helpLabel}>Still curious?</span>
              <div className={styles.helpLinks}>
                <Button href="/docs" variant="secondary" size="sm">
                  Read the docs
                </Button>
                <Button
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  variant="ghost"
                  size="sm"
                >
                  Ask on GitHub
                </Button>
              </div>
            </div>
          </div>

          <ul className={cn(styles.list, "reveal-right")}>
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              return (
                <li key={item.q} className={cn(styles.item, isOpen && styles.item_open)}>
                  <button
                    type="button"
                    className={styles.question}
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span>{item.q}</span>
                    <svg
                      className={styles.chevron}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  <div className={styles.answer}>
                    <div className={styles.answerInner}>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

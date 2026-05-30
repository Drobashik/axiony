"use client";

import { useState } from "react";
import { Card, CodeBlock, Container, SectionEyebrow, Terminal } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import { DX_EXAMPLES, DX_TAB_ORDER, DxTabId } from "@/lib/data/dx-examples";
import styles from "./DeveloperExperience.module.scss";

interface HighlightCardSpec {
  color: "green" | "blue" | "violet";
  title: string;
  description: string;
}

const HIGHLIGHTS: HighlightCardSpec[] = [
  {
    color: "green",
    title: "Zero configuration",
    description:
      "Run npx axiony scan and get results immediately. Configure when you're ready, not before.",
  },
  {
    color: "blue",
    title: "Exit codes for CI",
    description:
      "Non-zero exit on threshold violation. Pipe JSON output to any downstream tool or artifact store.",
  },
  {
    color: "violet",
    title: "Composable API",
    description:
      "Use Axiony programmatically in Node.js. Import the scanner, run it in tests, and assert on results.",
  },
];

const COLOR_TO_BORDER: Record<HighlightCardSpec["color"], string> = {
  green:  "var(--green-dim)",
  blue:   "var(--blue-border)",
  violet: "oklch(0.62 0.20 290 / 0.30)",
};

const COLOR_TO_DOT: Record<HighlightCardSpec["color"], string> = {
  green:  "var(--green)",
  blue:   "var(--blue)",
  violet: "var(--violet)",
};

/** "Built for the terminal" — tabbed code samples + value props. */
export function DeveloperExperience() {
  const [tabId, setTabId] = useState<DxTabId>("install");
  const tab = DX_EXAMPLES[tabId];

  return (
    <Section surface>
      <Container>
        <div className={styles.grid}>
          <div className="reveal-left">
            <SectionEyebrow>Developer experience</SectionEyebrow>
            <h2>Built for the terminal.</h2>
            <p className={styles.lead}>
              Axiony is CLI-first. Every feature is available from the command line,
              scriptable, composable, and designed to fit into your existing workflow.
            </p>

            <div className={styles.tabs} role="tablist">
              {DX_TAB_ORDER.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={id === tabId}
                  className={cn(styles.tab, id === tabId && styles.tabActive)}
                  onClick={() => setTabId(id)}
                >
                  {id}
                </button>
              ))}
            </div>

            {tab.kind === "code" ? (
              <CodeBlock filename={tab.filename} lines={tab.lines} className={styles.example} />
            ) : (
              <Terminal filename={tab.filename} lines={tab.lines} className={styles.example} />
            )}
          </div>

          <div className={cn(styles.highlights, "reveal-right")}>
            {HIGHLIGHTS.map((card) => (
              <Card
                key={card.title}
                style={{
                  borderColor: COLOR_TO_BORDER[card.color],
                  background: "var(--bg-base)",
                }}
              >
                <div className={styles.highlightHeader}>
                  <span
                    className={styles.highlightDot}
                    style={{ background: COLOR_TO_DOT[card.color] }}
                  />
                  <span className={styles.highlightTitle}>{card.title}</span>
                </div>
                <p className={styles.highlightDesc}>{card.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

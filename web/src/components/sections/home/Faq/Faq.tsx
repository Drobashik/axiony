"use client";

import { useState } from "react";
import { Section } from "@/components/layout";
import { Button, Container, SectionEyebrow } from "@/components/ui";
import cn from "classnames";
import { FaqItem } from "./components/FaqItem";
import { FAQS } from "./data";
import styles from "./Faq.module.scss";

export const Faq = () => {
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
            {FAQS.map((item, index) => {
              const isOpen = open === index;

              return (
                <FaqItem
                  key={item.q}
                  item={item}
                  isOpen={isOpen}
                  onToggle={() => setOpen(isOpen ? null : index)}
                />
              );
            })}
          </ul>
        </div>
      </Container>
    </Section>
  );
};

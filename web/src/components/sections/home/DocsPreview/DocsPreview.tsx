import { Button, Callout, Container, SectionEyebrow, Tag } from "@/components/ui";
import { Section } from "@/components/layout";
import cn from "classnames";
import styles from "./DocsPreview.module.scss";

const SIDEBAR_GROUPS = [
  {
    label: "Getting Started",
    items: [
      { name: "Introduction", code: false },
      { name: "Installation", code: false, active: true },
      { name: "Quick Start",  code: false },
    ],
  },
  {
    label: "CLI Reference",
    items: [
      { name: "axiony scan",   code: true },
      { name: "axiony init",   code: true },
      { name: "axiony report", code: true },
    ],
  },
  {
    label: "Guides",
    items: [
      { name: "CI Integration",     code: false },
      { name: "Config Guide",       code: false },
      { name: "Component Testing",  code: false },
    ],
  },
];

/** A miniature docs explorer to advertise the real docs. */
export function DocsPreview() {
  return (
    <Section>
      <Container>
        <header className={cn(styles.intro, "reveal")}>
          <SectionEyebrow>Documentation</SectionEyebrow>
          <h2>Docs that developers actually read.</h2>
          <p className={styles.lead}>
            Clear guides, CLI references, real code examples, and integration walkthroughs.
          </p>
        </header>

        <div className={cn(styles.grid, "reveal")}>
          <aside className={styles.sidebar}>
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.label}>
                <div className={styles.groupLabel}>{group.label}</div>
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className={cn(styles.item, "active" in item && item.active && styles.itemActive)}
                  >
                    {item.code ? <code>{item.name}</code> : item.name}
                  </div>
                ))}
              </div>
            ))}
          </aside>

          <div className={styles.content}>
            <div className={styles.tags}>
              <Tag>CLI</Tag>
              <Tag>v1.4</Tag>
            </div>
            <h3 className={styles.heading}>Installation</h3>
            <p className={styles.paragraph}>
              Axiony is available as an npm package. Install it globally or use it via npx
              without installing.
            </p>
            <pre className={styles.code}>
              <span className={styles.codePrompt}>$</span>{" "}
              <span className={styles.codeText}>npm install -g axiony</span>
            </pre>
            <Callout variant="note" className={styles.callout}>
              <strong>Note:</strong> Node.js 18 or higher is required. Axiony uses a
              headless browser internally for URL scanning.
            </Callout>
            <Callout variant="tip">
              <strong>Tip:</strong> Use <code>npx axiony scan</code> to try Axiony without a
              global install.
            </Callout>
          </div>
        </div>

        <div className={styles.cta}>
          <Button href="/docs" variant="secondary">Browse full documentation →</Button>
        </div>
      </Container>
    </Section>
  );
}

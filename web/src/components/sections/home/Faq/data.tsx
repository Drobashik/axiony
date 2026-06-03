import type { QA } from "./types";

export const FAQS: QA[] = [
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

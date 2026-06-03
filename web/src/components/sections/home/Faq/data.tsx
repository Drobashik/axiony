import type { QA } from "./types";

export const FAQS: QA[] = [
  {
    q: "What does Axiony do?",
    a: (
      <>
        Axiony helps product and engineering teams find, track, and prevent
        accessibility issues across the whole workflow. axe-core finds the
        issues; Axiony adds the layer around it — a baseline that tracks
        existing debt, CI checks, a dashboard, PR/MR comments, and AI fix
        suggestions — so accessibility stays part of how you ship, not a
        one-off report.
      </>
    ),
  },
  {
    q: "How does the baseline work?",
    a: (
      <>
        Your first scan records every existing issue as a baseline — your known
        debt. After that, Axiony only flags what&apos;s new, so old issues never
        block a release while regressions get caught before they merge. Update
        the baseline whenever you clear debt.
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
        The CLI ships today. The hosted scanner and dashboard are in active
        development — pricing is planned, with no card needed to start.
      </>
    ),
  },
];

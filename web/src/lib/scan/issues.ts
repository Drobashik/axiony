import type { Severity } from "@/types";

// =====================================================================
// Synthetic accessibility issues for the scan demo (/scan).
// `generateIssues(url)` returns a deterministic-but-varied subset per
// URL — the same URL always produces the same report.
//
// TODO(cloud): replace `generateIssues` with the real cloud scan
// response once the hosted scanner is available.
// =====================================================================

export interface IssueTemplate {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  rule: string;
  wcag: string[];
  nodes: string[];
  fix: string;
  whatHappened?: string;
  whyItMatters?: string;
  suggestedFix?: string;
  beforeCode?: string;
  afterCode?: string;
  /** Optional code snippet illustrating the fix (rendered by /scan). */
  code?: string;
}

export interface Issue extends IssueTemplate {
  /** Stagger delay (ms) for the entrance animation. */
  animationDelay: number;
}

const ISSUE_POOL: IssueTemplate[] = [
  {
    id: "image-alt",
    severity: "critical",
    title: "Images missing alternative text",
    description:
      "Images must have text alternatives that describe their content or purpose. Screen readers cannot convey image content without alt attributes.",
    rule: "wcag-1.1.1",
    wcag: ["1.1.1 Non-text Content (A)"],
    nodes: [
      '<img src="hero-banner.jpg" class="hero__img">',
      '<img src="team-photo.png" loading="lazy">',
      '<img src="logo-footer.svg">',
    ],
    fix: 'Add a descriptive alt attribute to each image. For decorative images, use alt="" to hide them from assistive technology.',
    code: `<img src="hero-banner.jpg" alt="Team collaborating in an open-plan office" />`,
  },
  {
    id: "color-contrast",
    severity: "serious",
    title: "Insufficient color contrast ratio",
    description:
      "Text must have a contrast ratio of at least 4.5:1 against its background for normal text (3:1 for large text). Current ratio: 2.8:1.",
    rule: "wcag-1.4.3",
    wcag: ["1.4.3 Contrast Minimum (AA)"],
    nodes: [
      '<p class="card__meta" style="color: #999">Published 3 days ago</p>',
      '<span class="nav__link--muted">Resources</span>',
    ],
    fix: "Increase text color lightness or darken the background to achieve at least a 4.5:1 contrast ratio. Use a contrast checker during design.",
    code: `/* 2.8:1 — fails AA */
color: #999;
/* 7.0:1 — passes AA & AAA */
color: #595959;`,
  },
  {
    id: "label-missing",
    severity: "critical",
    title: "Form inputs without accessible labels",
    description:
      "Every form input must have an associated label element or an aria-label/aria-labelledby attribute. Unlabeled inputs are unusable with a screen reader.",
    rule: "wcag-1.3.1",
    wcag: ["1.3.1 Info and Relationships (A)", "3.3.2 Labels or Instructions (A)"],
    nodes: [
      '<input type="email" placeholder="Email address" class="subscribe__input">',
      '<input type="search" class="header__search">',
    ],
    fix: 'Add a <label for="id"> element or an aria-label attribute to each input. Placeholder text is not a substitute for a label.',
    code: `<label for="email">Email address</label>
<input id="email" type="email" name="email" />`,
  },
  {
    id: "keyboard-trap",
    severity: "critical",
    title: "Keyboard focus trap in modal",
    description:
      "A modal dialog traps keyboard focus with no way to close or escape using the keyboard. Users who do not use a mouse cannot exit the dialog.",
    rule: "wcag-2.1.2",
    wcag: ["2.1.2 No Keyboard Trap (A)"],
    nodes: ['<div class="modal__overlay" role="dialog" aria-modal="true">'],
    fix: "Ensure Escape key closes the dialog. Trap focus within the modal while open, and restore focus to the trigger element on close.",
  },
  {
    id: "heading-order",
    severity: "moderate",
    title: "Heading levels skipped",
    description:
      "Heading levels are used to create document structure. Skipping from h2 to h4 breaks the logical outline and disorients screen reader users.",
    rule: "wcag-1.3.1",
    wcag: ["1.3.1 Info and Relationships (A)"],
    nodes: [
      '<h4 class="section__sub">Related Articles</h4>',
      '<h4 class="card__title">Featured post</h4>',
    ],
    fix: "Ensure headings follow a sequential order. Replace h4 with h3 in these contexts, or restructure the content hierarchy.",
    code: `<h2>Features</h2>
<h3>Cloud scanning</h3>  <!-- was <h4> -->`,
  },
  {
    id: "focus-visible",
    severity: "serious",
    title: "Focus indicator not visible",
    description:
      "Interactive elements must have a visible focus indicator when focused via keyboard. CSS outline:none without a replacement fails this criterion.",
    rule: "wcag-2.4.11",
    wcag: ["2.4.11 Focus Appearance (AA)", "2.4.7 Focus Visible (AA)"],
    nodes: [
      '<button class="btn btn--ghost">Learn more</button>',
      '<a href="/pricing" class="nav__link">Pricing</a>',
    ],
    fix: "Remove outline:none or replace it with a custom high-contrast focus style. Use :focus-visible to show focus only for keyboard navigation.",
    code: `:focus-visible {
  outline: 2px solid #4c8dff;
  outline-offset: 2px;
}`,
  },
  {
    id: "aria-role",
    severity: "moderate",
    title: "ARIA roles used incorrectly",
    description:
      'The role="button" attribute is applied to non-interactive elements without the required keyboard event handlers, making them inaccessible via keyboard.',
    rule: "wcag-4.1.2",
    wcag: ["4.1.2 Name, Role, Value (A)"],
    nodes: ['<div role="button" class="card__cta" tabindex="0">View project</div>'],
    fix: 'Replace <div role="button"> with a real <button> element. If a div must be used, add keydown event handlers for Enter and Space keys.',
    code: `<button class="card__cta" type="button">View project</button>`,
  },
  {
    id: "link-purpose",
    severity: "minor",
    title: "Ambiguous link text",
    description:
      'Links with generic text like "Read more" or "Click here" are ambiguous when read out of context by a screen reader.',
    rule: "wcag-2.4.4",
    wcag: ["2.4.4 Link Purpose in Context (A)"],
    nodes: [
      '<a href="/posts/123">Read more</a>',
      '<a href="/pricing">Click here</a>',
      '<a href="/about">Learn more</a>',
    ],
    fix: "Use descriptive link text that conveys destination or purpose. Alternatively, use aria-label to provide a more descriptive name.",
    code: `<a href="/posts/123">Read more about cloud scanning</a>`,
  },
  {
    id: "lang-missing",
    severity: "serious",
    title: "Page language not declared",
    description:
      "The html element must have a lang attribute. Without it, screen readers cannot automatically select the correct voice profile.",
    rule: "wcag-3.1.1",
    wcag: ["3.1.1 Language of Page (A)"],
    nodes: ["<html>  (missing lang attribute)"],
    fix: 'Add a lang attribute to the html element: <html lang="en">. Use the correct BCP 47 language tag for your content.',
    code: `<html lang="en">`,
  },
  {
    id: "skip-link",
    severity: "moderate",
    title: "No skip navigation link",
    description:
      "Pages without a skip link force keyboard users to tab through all navigation on every page load before reaching the main content.",
    rule: "wcag-2.4.1",
    wcag: ["2.4.1 Bypass Blocks (A)"],
    nodes: ["<body>  (no skip link found)"],
    fix: 'Add a visually hidden skip link as the first focusable element: <a href="#main" class="skip-link">Skip to content</a>.',
    code: `<a href="#main" class="skip-link">Skip to content</a>`,
  },
  {
    id: "empty-button",
    severity: "serious",
    title: "Buttons with no accessible name",
    description:
      "Icon-only buttons must have an accessible name via aria-label or visually hidden text. Without it, the button purpose is unknown to screen reader users.",
    rule: "wcag-4.1.2",
    wcag: ["4.1.2 Name, Role, Value (A)"],
    nodes: [
      '<button class="menu__toggle"><svg>...</svg></button>',
      '<button class="search__clear"><svg>...</svg></button>',
    ],
    fix: 'Add aria-label="Open menu" to icon-only buttons, or include a visually hidden span inside the button describing its purpose.',
    code: `<button class="menu__toggle" aria-label="Open menu">
  <MenuIcon aria-hidden="true" />
</button>`,
  },
  {
    id: "motion",
    severity: "minor",
    title: "Animation without reduced-motion support",
    description:
      "Animated content can cause issues for users with vestibular disorders. CSS animations should respect the prefers-reduced-motion media query.",
    rule: "wcag-2.3.3",
    wcag: ["2.3.3 Animation from Interactions (AAA)"],
    nodes: [
      ".hero__bg { animation: drift 8s ease-in-out infinite; }",
      ".card:hover { transition: transform 0.3s; }",
    ],
    fix: "Wrap animations in @media (prefers-reduced-motion: no-preference) or use @media (prefers-reduced-motion: reduce) to disable them.",
    code: `@media (prefers-reduced-motion: reduce) {
  .hero__bg { animation: none; }
}`,
  },
];

// Cheap deterministic PRNG so each URL always produces the same (but
// varied) report. Good enough for a demo.
const makeRng =
  (seed: number) =>
  (n: number): number => {
    const x = Math.sin(seed * n + n) * 10000;
    return x - Math.floor(x);
  };

export const generateIssues = (url: string): Issue[] => {
  const seed = url.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = makeRng(seed);

  const count = 5 + Math.floor(rng(1) * 7);
  const used = new Set<number>();
  const selected: IssueTemplate[] = [];

  for (let i = 0; selected.length < count && i < 50; i += 1) {
    const idx = Math.floor(rng(i + 2) * ISSUE_POOL.length);
    if (!used.has(idx)) {
      used.add(idx);
      selected.push(ISSUE_POOL[idx]);
    }
  }

  return selected.map((issue, i) => ({
    ...issue,
    nodes: issue.nodes.slice(
      0,
      1 + Math.floor(rng(i + 10) * Math.max(issue.nodes.length - 1, 0)) + 1,
    ),
    animationDelay: i * 60,
  }));
};

export type FilterValue = Severity | "all";

export type SeverityCounts = Record<Severity, number>;

// Worst-first order used for summaries, filters and sorting.
export const SEVERITY_ORDER: readonly Severity[] = [
  "critical",
  "serious",
  "moderate",
  "minor",
] as const;

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
};

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

export const countBySeverity = (issues: Issue[]): SeverityCounts => ({
  critical: issues.filter((i) => i.severity === "critical").length,
  serious: issues.filter((i) => i.severity === "serious").length,
  moderate: issues.filter((i) => i.severity === "moderate").length,
  minor: issues.filter((i) => i.severity === "minor").length,
});

export type SortValue = "severity" | "rule" | "occurrences";

// Returns a new, sorted array (does not mutate the input).
export const sortIssues = (issues: Issue[], sort: SortValue): Issue[] =>
  [...issues].sort((a, b) => {
    if (sort === "rule") return a.rule.localeCompare(b.rule);
    if (sort === "occurrences") return b.nodes.length - a.nodes.length;
    return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  });

// ── Scoring (used by /scan) ──────────────────────────────────────────
// Severity-weighted penalty, so the headline score reflects the real
// findings instead of being a fixed number.
export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 10,
  serious: 5,
  moderate: 2,
  minor: 1,
};

export const computeScore = (issues: Issue[]): number => {
  const penalty = issues.reduce(
    (sum, issue) =>
      sum + SEVERITY_WEIGHT[issue.severity] * (1 + Math.min(issue.nodes.length - 1, 3) * 0.1),
    0,
  );
  return Math.max(45, Math.round(100 - penalty));
};

export interface ScoreGrade {
  letter: string;
  label: string;
}

export const scoreGrade = (score: number): ScoreGrade => {
  if (score >= 90) return { letter: "A", label: "Excellent" };
  if (score >= 80) return { letter: "B", label: "Good" };
  if (score >= 70) return { letter: "C", label: "Fair" };
  if (score >= 60) return { letter: "D", label: "Needs work" };
  return { letter: "F", label: "Critical gaps" };
};

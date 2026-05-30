import { AccentColor, FaqItem, IconName } from "@/types";

// =====================================================================
// Home page data
// ---------------------------------------------------------------------
// Static content extracted from JSX so the components stay focused on
// rendering, not on holding copy.
// =====================================================================

export interface FeatureCard {
  icon: IconName;
  accent: AccentColor;
  title: string;
  description: string;
}

export const FEATURES: readonly FeatureCard[] = [
  {
    icon: "globe",
    accent: "blue",
    title: "URL Scanning",
    description:
      "Run `axiony scan <url>` against any page — local dev server, staging or production. Playwright loads it, axe-core analyses the rendered DOM.",
  },
  {
    icon: "code",
    accent: "violet",
    title: "Raw HTML Scanning",
    description:
      "Pipe a static file or an inline string into `axiony html`. Fast, headless, and perfect for build-time checks on generated output.",
  },
  {
    icon: "scan",
    accent: "green",
    title: "Component Scanning",
    description:
      "Point `axiony component` at any local .tsx/.jsx file. Zero-config best-effort rendering scans an isolated component tree.",
  },
  {
    icon: "selector",
    accent: "blue",
    title: "Selector Scoping",
    description:
      "Add `--selector` to narrow the scan to a CSS region. If the selector doesn't match, Axiony tells you instead of returning empty results.",
  },
  {
    icon: "json",
    accent: "violet",
    title: "Structured JSON",
    description:
      "`--json` emits a machine-readable report with rule id, impact, description and affected selectors — pipe it into any downstream tool.",
  },
  {
    icon: "ci",
    accent: "green",
    title: "CI-Friendly",
    description:
      "`--ci` prints a compact pipeline summary, exits 0 on a clean scan, 1 on issues found, 2 on a runtime error. No spinner noise in logs.",
  },
  {
    icon: "report",
    accent: "blue",
    title: "Saveable Artifacts",
    description:
      "`--output <name>` writes the JSON report to `axy-reports/<name>.json` so you can upload it as a CI artifact and review later.",
  },
  {
    icon: "terminal",
    accent: "violet",
    title: "Verbose Diagnostics",
    description:
      "`--verbose` prints every matched selector and a compact HTML snippet for each affected element. Great for tracking down repeat offenders.",
  },
  {
    icon: "bolt",
    accent: "green",
    title: "Component-aware Profile",
    description:
      "Component scans auto-disable page-level rules like `landmark-one-main` and `region` that don't make sense for an isolated UI tree.",
  },
];

export interface ProblemItem {
  number: string;
  title: string;
  description: string;
}

export const PROBLEMS: readonly ProblemItem[] = [
  {
    number: "01",
    title: "Bugs found too late",
    description:
      "Accessibility issues are usually caught post-launch, during audits or user reports — when fixes are most expensive.",
  },
  {
    number: "02",
    title: "Manual audits are slow",
    description:
      "Traditional accessibility audits take weeks and don't integrate into development workflows or CI.",
  },
  {
    number: "03",
    title: "No fast feedback loop",
    description:
      "Developers write inaccessible code not out of neglect, but because there's no signal during the build phase.",
  },
  {
    number: "04",
    title: "Hard to maintain at scale",
    description:
      "As codebases grow, maintaining accessibility across components, pages, and teams becomes increasingly difficult.",
  },
];

export interface SolutionRow {
  icon: string;
  title: string;
  description: string;
}

export const SOLUTIONS: readonly SolutionRow[] = [
  {
    icon: "⚡",
    title: "One command to scan anything",
    description:
      "`axiony scan`, `axiony html`, `axiony component` — three single-purpose commands that cover URLs, static HTML and React components.",
  },
  {
    icon: "🧪",
    title: "Real browser, real DOM",
    description:
      "Playwright loads the page (or renders the component) and waits for a stable DOM before axe-core runs, so JS-heavy apps are scanned correctly.",
  },
  {
    icon: "🔁",
    title: "Plays nicely with CI",
    description:
      "`--ci` mode prints a compact summary; exit codes (0 / 1 / 2) drop straight into GitHub Actions, GitLab CI, CircleCI or anything else.",
  },
  {
    icon: "📦",
    title: "JSON artifacts you can keep",
    description:
      "Add `--output report` and Axiony writes `axy-reports/report.json` next to your build output — upload it as a CI artifact and review later.",
  },
];

export interface UseCase {
  icon: string;
  title: string;
  description: string;
}

export const USE_CASES: readonly UseCase[] = [
  { icon: "⚙️", title: "Frontend Teams", description: "Catch issues in PRs before they reach users. Build accessibility into the dev loop." },
  { icon: "🚀", title: "SaaS Products", description: "Maintain WCAG compliance across multiple pages, flows, and releases." },
  { icon: "🎨", title: "Design Systems", description: "Validate every component in isolation. Integrate with Storybook and CI." },
  { icon: "🏢", title: "Agencies", description: "Audit client sites quickly. Generate shareable reports and track remediation." },
  { icon: "✅", title: "QA & Compliance", description: "Document WCAG compliance evidence for audits, legal reviews, and certifications." },
  { icon: "📱", title: "Mobile Web", description: "Test responsive layouts and touch targets for mobile accessibility standards." },
];

export interface Step {
  number: string;
  title: string;
  description: string;
}

export const STEPS: readonly Step[] = [
  { number: "01", title: "Install the CLI",   description: "`npm install -g axiony-cli` then `axiony install` to grab the Playwright browser." },
  { number: "02", title: "Scan something",    description: "Run `axiony scan <url>`, `axiony html --file …`, or `axiony component …`." },
  { number: "03", title: "Read the report",   description: "Human-readable text by default; add `--json` for a structured report or `--verbose` for full detail." },
  { number: "04", title: "Wire it into CI",   description: "Add `--ci --output app` to your pipeline — Axiony exits 1 on violations and saves `axy-reports/app.json`." },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  accent: AccentColor;
}

export const TESTIMONIALS: readonly Testimonial[] = [
  {
    quote:
      "We went from catching a11y issues in production to catching them in PRs. Axiony paid for itself in the first week.",
    name: "Maya Chen",
    role: "Senior Frontend Engineer, Loom",
    initials: "MC",
    accent: "blue",
  },
  {
    quote:
      "The CLI is exactly what I wanted — fast, composable, and no setup. The JSON output pipes perfectly into our reporting pipeline.",
    name: "Arjun Patel",
    role: "Staff Engineer, Linear",
    initials: "AP",
    accent: "green",
  },
  {
    quote:
      "Our design system now has automated accessibility coverage on every component. Axiony integrated with Storybook in under an hour.",
    name: "Sarah Kim",
    role: "Design Systems Lead, Vercel",
    initials: "SK",
    accent: "violet",
  },
];

export const FAQS: readonly FaqItem[] = [
  {
    question: "What can Axiony scan today?",
    answer:
      "Three things: a URL with `axiony scan`, a static HTML file or string with `axiony html`, and a single local React component (.tsx/.jsx/.ts/.js) with `axiony component`. Each command accepts `--selector` to scope the scan to a CSS region.",
  },
  {
    question: "How do I install it?",
    answer:
      "`npm install -g axiony-cli` then `axiony install` to download the Playwright Chromium browser. On Linux/CI you can run `axiony install --with-deps` to also install system dependencies. You can also run anything one-off with `npx axiony-cli`.",
  },
  {
    question: "Does it work in CI?",
    answer:
      "Yes. Add `--ci` for a compact summary and `--output <name>` to drop a JSON artifact in `axy-reports/`. Exit codes are stable: 0 = no issues, 1 = issues found, 2 = runtime or usage error. The README has copy-paste GitHub Actions and GitLab CI examples.",
  },
  {
    question: "Is there a config file?",
    answer:
      "Not yet. v0.3.0 is a preview release and is intentionally small — every setting is a flag (`--json`, `--ci`, `--selector`, `--verbose`, `--output`). Configuration support is on the roadmap.",
  },
  {
    question: "What does it check against?",
    answer:
      "Axiony runs the upstream axe-core ruleset. For component scans it uses a component-focused profile that disables noisy page-level rules (`landmark-one-main`, `page-has-heading-one`, `region`); full-page scans run the standard ruleset.",
  },
  {
    question: "How much does it cost?",
    answer:
      "The CLI is free and MIT-licensed. The hosted dashboard you see linked from the homepage is a preview of where Axiony is heading — see the pricing page for the planned tiers.",
  },
];

export const TRUST_LOGOS = [
  "Vercel",
  "Stripe",
  "Notion",
  "Loom",
  "Linear",
  "Figma",
] as const;

export interface PricingPreviewPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  featured?: boolean;
}

export const PRICING_PREVIEW: readonly PricingPreviewPlan[] = [
  { name: "OSS CLI", price: "$0",  period: "forever",       description: "Available today · MIT" },
  { name: "Pro",     price: "$19", period: "/month · planned", description: "Hosted dashboard", featured: true },
  { name: "Team",    price: "$79", period: "/month · planned", description: "Shared workspace" },
];

export interface ReportRow {
  severity: "critical" | "serious" | "moderate";
  issue: string;
  description: string;
  node: string;
}

export const REPORT_ROWS: readonly ReportRow[] = [
  { severity: "critical", issue: "Image missing alt text",        description: "Images must have an accessible text alternative.",            node: '<img src="hero.jpg">' },
  { severity: "critical", issue: "Keyboard trap detected",        description: "Focus is trapped inside a modal with no escape route.",       node: ".modal > .content" },
  { severity: "serious",  issue: "Insufficient color contrast",   description: "Text contrast ratio is 2.1:1; minimum required is 4.5:1.",   node: ".card-body p" },
  { severity: "serious",  issue: "Form label missing",            description: "Input element does not have an associated visible label.",    node: 'input[type="email"]' },
  { severity: "moderate", issue: "Heading order skipped",         description: "h4 used without preceding h3.",                                node: "main > section h4" },
];

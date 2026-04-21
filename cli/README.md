# Axiony

Axiony is a CLI for scanning web pages and raw HTML for accessibility issues. It opens content in Playwright, runs `axe-core`, and prints a developer-friendly report.

This is a preview release. The current CLI is intentionally small and should be treated as an early tool for local checks and experimentation, not a complete accessibility auditing platform.

## Install

```bash
npm install -g axiony-cli
```

You can also run it without a global install:

```bash
npx axiony-cli scan https://example.com
npx axiony-cli html --file ./page.html
npx axiony-cli component ./src/Button.tsx
```

Axiony uses Playwright. If the browser is not installed yet, run:

```bash
npx playwright install
```

## Usage

Scan a URL:

```bash
axiony scan <url>
```

Scan raw HTML:

```bash
axiony html --file <path>
axiony html --html "<html>..."
```

Scan a local React component:

```bash
axiony component <path>
```

Examples:

```bash
axiony scan https://example.com
axiony scan http://localhost:3000
axiony scan https://example.com --selector main
axiony html --file ./page.html
axiony html --html "<main><img src='hero.png'></main>"
axiony component ./src/Button.tsx
```

By default, Axiony prints a human-readable report to stdout.

Use `--selector <selector>` to scan only the matched DOM region. If the selector does not exist on the page or rendered HTML, Axiony exits with a clear error.

For `axiony html`, provide exactly one input source: `--file <path>` or `--html "<html>..."`.

For `axiony component`, provide one local `.tsx`, `.jsx`, `.ts`, or `.js` React component file from a project that has `react` and `react-dom` installed. Axiony uses zero-config best-effort rendering: it prefers a default export, otherwise it tries the first likely PascalCase named component export, renders it with empty props, and scans the rendered DOM. Components that need required props, providers, routing, app runtime context, CSS/module bundling, or non-React frameworks may fail with a clear message instead of being scanned. Storybook, Vue, Angular, custom wrappers, prop generation, and autofix are not supported in this first version.

Component scans use a component-focused axe profile. By default Axiony scans `#root` and disables page-level rules that are usually noisy for isolated components: `landmark-one-main`, `page-has-heading-one`, and `region`. Full page scans still run those rules through `axiony scan`.

## JSON Output

Use `--json` to print pretty JSON:

```bash
axiony scan https://example.com --json
axiony html --file ./page.html --json
axiony component ./src/Button.tsx --json
```

Example shape:

```json
{
  "url": "https://example.com",
  "issues": [
    {
      "id": "image-alt",
      "impact": "critical",
      "description": "Ensures <img> elements have alternate text or a role of none or presentation",
      "help": "Images must have alternate text",
      "selectors": ["img.hero"]
    }
  ]
}
```

## JSON File Output

Use `--json --output <name>` to write the JSON report to `axy-reports`.

```bash
axiony scan https://example.com --json --output example
axiony html --file ./page.html --json --output page
axiony component ./src/Button.tsx --json --output button
```

This writes:

```text
axy-reports/example.json
```

`--output` requires `--json`.

## Exit Codes

- `0`: scan completed and no accessibility issues were found
- `1`: scan completed and accessibility issues were found
- `2`: runtime error or invalid usage

## Commands

```bash
axiony --help
axiony scan --help
axiony html --help
axiony component --help
```

## Status

This release currently supports single-page URL scans, raw HTML scans, and best-effort local React component scans. Axiony still needs deeper test coverage, CI examples, more reporting controls, configuration support, and broader real-world validation.

## License

MIT

# Axiony

Axiony is an accessibility tooling project. Today it ships a TypeScript CLI for scanning web pages and raw HTML; in the future, this repository will also include the Axiony web app alongside the CLI.

The CLI opens content in Playwright, runs `axe-core`, and prints a developer-friendly report. This is a preview release: the current CLI is intentionally small and should be treated as an early tool for local checks and experimentation, not a complete accessibility auditing platform.

## Packages

- `cli`: npm package `axiony-cli`, installed as the `axiony` command
- `web`: planned Axiony web app

## Install

```bash
npm install -g axiony-cli
axiony install
```

You can also run it without a global install:

```bash
npx axiony-cli scan https://example.com
npx axiony-cli html --file ./page.html
npx axiony-cli component ./src/Button.tsx
```

Axiony uses Playwright. If the browser is not installed yet, run:

```bash
axiony install
```

For CI/Linux environments, install Chromium with system dependencies:

```bash
npx axiony-cli install --with-deps
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
axiony scan https://example.com --verbose
axiony scan http://127.0.0.1:3000 --ci
axiony html --file ./page.html
axiony html --html "<main><img src='hero.png'></main>"
axiony component ./src/Button.tsx
```

By default, Axiony prints a human-readable report to stdout.

Use `--ci` to print a compact pipeline-friendly summary without spinner output.

Use `--verbose` to print every matched selector and a compact HTML snippet for each affected element.

Use `--selector <selector>` to scan only the matched DOM region. If the selector does not exist on the page or rendered HTML, Axiony exits with a clear error.

For URL scans, Axiony waits briefly for meaningful page content and a stable DOM before running axe. If the loaded page looks like a bot challenge or refresh page, the report includes a warning because the results may not represent the intended target page.

For `axiony html`, provide exactly one input source: `--file <path>` or `--html "<html>..."`.

For `axiony component`, provide one local `.tsx`, `.jsx`, `.ts`, or `.js` React component file from a project that has `react` and `react-dom` installed. Axiony uses zero-config best-effort rendering: it prefers a default export, otherwise it tries the first likely PascalCase named component export, renders it with empty props, and scans the rendered DOM. Components that need required props, providers, routing, app runtime context, CSS/module bundling, or non-React frameworks may fail with a clear message instead of being scanned. Storybook, Vue, Angular, custom wrappers, prop generation, and autofix are not supported in this first version.

Component scans use a component-focused axe profile. By default Axiony scans `#root` and disables page-level rules that are usually noisy for isolated components: `landmark-one-main`, `page-has-heading-one`, and `region`. Full page scans still run those rules through `axiony scan`.

## Verbose Output

Use `--verbose` when you need more context for each issue:

```bash
axiony html --html "<main><h1>Demo</h1><div id='Path'>One</div><span id='Path'>Two</span></main>" --verbose
```

Example excerpt:

```text
Serious duplicate-id
Fix: ID attributes must be unique
Why: Ensures id attribute values are unique. Duplicate value: "Path".
Elements: 2
1. #Path
   <div id="Path">One</div>
2. #Path
   <span id="Path">Two</span>
```

Without `--verbose`, Axiony keeps reports compact and shows a short selector preview instead.

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

In CI mode, `--output` writes a JSON artifact while the console still receives a readable CI summary:

```bash
axiony scan http://127.0.0.1:3000 --ci --output app
```

This writes:

```text
axy-reports/app.json
```

## CI/CD Usage

Axiony works best in CI when the pipeline scans the rendered output of your app. For a full application scan, build the app, start it with the command your framework uses, wait until the local URL is ready, then scan that URL:

```bash
npm ci
npm run build
npx axiony-cli install --with-deps
# Start your app with your framework's production or preview command.
# Example for Vite:
npm run preview -- --host 127.0.0.1 --port 3000
npx wait-on http://127.0.0.1:3000
npx axiony-cli scan http://127.0.0.1:3000 --ci --output axiony-report
```

The start command is framework-specific. For Vite, use `npm run preview -- --host 127.0.0.1 --port 3000`. For Next.js, use `npm run start -- --hostname 127.0.0.1 --port 3000`. For static builds, serve the generated output directory.

Static builds can be served with a small static server:

```bash
npm run build
npx serve dist --listen 3000
npx wait-on http://127.0.0.1:3000
npx axiony-cli scan http://127.0.0.1:3000 --ci --output axiony-report
```

The `scan` command checks the DOM rendered in a browser. It does not statically analyze source files. Use `component` for isolated React component checks and `html` for static HTML files:

```bash
npx axiony-cli scan http://127.0.0.1:3000 --ci --output app
npx axiony-cli component ./src/components/Button.tsx --ci --output button
npx axiony-cli html --file ./dist/index.html --ci --output page
```

`component` scans are useful for design systems and self-contained React components, but they do not replace a full app scan. Components that require props, providers, routing, app runtime context, CSS/module bundling, or framework-specific runtime behavior may need a small wrapper component.

### GitHub Actions

```yaml
name: Accessibility

on:
  pull_request:

jobs:
  axiony:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run build
      - run: npx axiony-cli install --with-deps
      # Use your framework's production/preview server command here.
      # Vite: npm run preview -- --host 127.0.0.1 --port 3000
      # Next.js: npm run start -- --hostname 127.0.0.1 --port 3000
      - run: npm run preview -- --host 127.0.0.1 --port 3000 &
      - run: npx wait-on http://127.0.0.1:3000
      - run: npx axiony-cli scan http://127.0.0.1:3000 --ci --output axiony-report

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: axiony-report
          path: axy-reports/
```

### GitLab CI

```yaml
accessibility:
  image: node:20
  script:
    - npm ci
    - npm run build
    - npx axiony-cli install --with-deps
    # Use your framework's production/preview server command here.
    - npm run preview -- --host 127.0.0.1 --port 3000 &
    - npx wait-on http://127.0.0.1:3000
    - npx axiony-cli scan http://127.0.0.1:3000 --ci --output axiony-report
  artifacts:
    when: always
    paths:
      - axy-reports/
```

In CI, Axiony keeps the same exit codes as local scans.

## Exit Codes

- `0`: scan completed and no accessibility issues were found
- `1`: scan completed and accessibility issues were found
- `2`: runtime error or invalid usage

## Development

```bash
cd cli
npm install
npm run build
npm run lint
npm start -- --help
```

## Status

This release currently supports single-page URL scans, raw HTML scans, best-effort local React component scans, and CI-friendly summaries. Axiony still needs deeper test coverage, more reporting controls, configuration support, and broader real-world validation.

## License

MIT

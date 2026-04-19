# Axiony

Axiony is an accessibility tooling project. Today it ships a TypeScript CLI for scanning web pages and raw HTML; in the future, this repository will also include the Axiony web app alongside the CLI.

The CLI opens content in Playwright, runs `axe-core`, and prints a developer-friendly report. This is a preview release: the current CLI is intentionally small and should be treated as an early tool for local checks and experimentation, not a complete accessibility auditing platform.

## Packages

- `cli`: npm package `axiony-cli`, installed as the `axiony` command
- `web`: planned Axiony web app

## Install

```bash
npm install -g axiony-cli
```

You can also run it without a global install:

```bash
npx axiony-cli scan https://example.com
npx axiony-cli html --file ./page.html
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

Examples:

```bash
axiony scan https://example.com
axiony scan http://localhost:3000
axiony scan https://example.com --selector main
axiony html --file ./page.html
axiony html --html "<main><img src='hero.png'></main>"
```

By default, Axiony prints a human-readable report to stdout.

Use `--selector <selector>` to scan only the matched DOM region. If the selector does not exist on the page or rendered HTML, Axiony exits with a clear error.

For `axiony html`, provide exactly one input source: `--file <path>` or `--html "<html>..."`.

## JSON Output

Use `--json` to print pretty JSON:

```bash
axiony scan https://example.com --json
axiony html --file ./page.html --json
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

## Development

```bash
cd cli
npm install
npm run build
npm run lint
npm start -- --help
```

## Status

This release currently supports single-page URL scans and raw HTML scans only. Axiony still needs deeper test coverage, CI examples, more reporting controls, configuration support, and broader real-world validation.

## License

MIT

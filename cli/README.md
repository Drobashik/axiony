# Axiony

Axiony is an early alpha CLI for scanning a single web page for accessibility issues. It opens the page in Playwright, runs `axe-core`, and prints a developer-friendly report.

This is a preview release. The current CLI is intentionally small and should be treated as an early tool for local checks and experimentation, not a complete accessibility auditing platform.

## Install

```bash
npm install -g axiony@alpha
```

You can also run it without a global install:

```bash
npx axiony@alpha scan https://example.com
```

Axiony uses Playwright. If the browser is not installed yet, run:

```bash
npx playwright install
```

## Usage

```bash
axiony scan <url>
```

Examples:

```bash
axiony scan https://example.com
axiony scan http://localhost:3000
```

By default, Axiony prints a human-readable report to stdout.

## JSON Output

Use `--json` to print pretty JSON:

```bash
axiony scan https://example.com --json
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
```

## Alpha Status

This release is an initial alpha preview. It currently supports single-page scans only. Before a broader public release, Axiony still needs deeper test coverage, CI examples, more reporting controls, configuration support, and broader real-world validation.

## License

MIT

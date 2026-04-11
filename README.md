# Axiony

Accessibility testing and remediation for modern web applications.

## Overview

Axiony is a developer-first platform for detecting, fixing, and preventing accessibility issues in web applications.

It includes:

- A powerful CLI for scanning, suggesting fixes, and applying remediations
- A web platform for monitoring, insights, and team workflows

## Vision

Axiony helps teams catch accessibility issues early and continuously, then move quickly from detection to remediation. Instead of relying only on manual audits or post-release checks, Axiony integrates directly into the development lifecycle, from local development to CI/CD and production monitoring.

## Product Components

### CLI (Developer Tool)

The CLI allows developers to run accessibility checks locally or in CI pipelines, review suggested fixes, and automate remediations where safe and appropriate.

```bash
npx axiony scan http://localhost:3000
npx axiony scan https://example.com
```

Features:

- Scan local and remote pages
- Suggest likely fixes with developer-friendly guidance
- Apply supported fixes automatically or semi-automatically
- Fast feedback in terminal
- CI-friendly exit codes
- Developer-focused output

### Web Platform (SaaS)

The web platform will provide:

- Scan history and trends
- Project-level monitoring
- Regression detection
- Suggested remediation workflows
- Team collaboration (future)
- Alerts and reporting (future)

## MVP Scope

### Included (Phase 1)

- CLI tool
- Single-page scan
- Support for local and remote URLs
- Accessibility checks using `axe-core`
- CLI output with clear issue descriptions
- Fix suggestions for detected issues
- Support for guided or automatic remediation for selected issue types
- Proper exit codes

### Not Included (Initial MVP)

- Dashboard UI
- Authentication
- Billing
- Multi-page crawling
- CI integrations at the UI level

## Planned CLI Output

```text
Scanning https://example.com...

X 3 issues found

[critical] image-alt
Element: img.hero-banner
Images must have alternate text
Suggested fix: Add a descriptive `alt` attribute to the image

[serious] button-name
Element: button.close
Buttons must have discernible text
Suggested fix: Add an `aria-label` or visible button text

[moderate] color-contrast
Element: p.description
Text has insufficient color contrast
Suggested fix: Increase contrast between foreground and background colors

Summary:
- Critical: 1
- Serious: 1
- Moderate: 1
```

## How It Works

Axiony improves accessibility by:

- Launching a headless browser
- Opening the target page
- Injecting an accessibility engine
- Running rule-based checks
- Collecting results
- Mapping issues to likely fixes
- Outputting a clean report with remediation guidance
- Applying supported fixes when automation is enabled
- Returning exit codes for automation

## Tech Stack

### Initial Stack

- Node.js
- TypeScript
- Playwright
- `axe-core`
- Fix suggestion and remediation layer

### Future

- Web dashboard (React)
- API layer
- Cloud storage for scan results

## Project Structure

```text
axiony/
  cli/        # CLI application
  web/        # future web platform
  docs/       # product and technical docs
```

## Development Roadmap

### Phase 1 - CLI MVP

- CLI setup
- URL scanning
- `axe-core` integration
- Formatted output
- Suggested fixes for common issues

### Phase 2 - CLI Improvements

- Config support
- Better reporting
- Error handling
- Guided remediation flows
- Auto-fix support for selected rule types

### Phase 3 - Automation

- CI integration
- Machine-readable output
- Multi-page scan
- Remediation workflows in CI and local development

### Phase 4 - Web Platform

- Dashboard
- Scan history
- Monitoring
- Alerts
- Fix tracking and remediation insights

## Why Axiony

Existing accessibility tools are often:

- Too basic
- Too complex
- Disconnected from real development workflows
- Good at finding problems, but weak at helping teams fix them

Axiony focuses on:

- Developer experience
- Automation
- Actionable remediation
- Real-world usability

## Status

Early development.

## License

MIT

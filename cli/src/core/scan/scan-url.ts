import axe from 'axe-core';
import { Browser, chromium } from 'playwright';
import type { ScanIssue, ScanResult, WindowWithAxe } from './types';
import { BROWSER_TIMEOUT, IMPACT_UNKNOWN } from './constants';
import { scanLogger } from '../../commands/scan';

export async function scanUrl(url: string): Promise<ScanResult> {
  let browser: Browser;

  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    scanLogger.error(
      `Playwright browser not installed. Run: npx playwright install`,
    );
    process.exit(2);
  }

  try {
    const page = await browser.newPage();

    await page.addInitScript({
      content: axe.source,
    });

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: BROWSER_TIMEOUT,
    });

    await page.waitForLoadState('networkidle');

    const result = await page.evaluate(async () => {
      const runtimeWindow = window as unknown as WindowWithAxe;

      return await runtimeWindow.axe.run();
    });

    const issues: ScanIssue[] = result.violations.flatMap((violation) =>
      violation.nodes.map((node) => ({
        id: violation.id,
        impact: violation.impact ?? IMPACT_UNKNOWN,
        description: violation.description,
        help: violation.help,
        selector: node.target.join(', '),
      })),
    );

    return {
      url,
      issues,
    };
  } finally {
    await browser.close();
  }
}

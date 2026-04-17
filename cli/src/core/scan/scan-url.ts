import axe from 'axe-core';
import { Browser, chromium } from 'playwright';
import type {
  ScanIssue,
  ScanResult,
  ScanUrlOptions,
  WindowWithAxe,
} from './types';
import { BROWSER_TIMEOUT, IMPACT_UNKNOWN } from './constants';

export async function scanUrl(
  url: string,
  options: ScanUrlOptions = {},
): Promise<ScanResult> {
  let browser: Browser;
  const { onProgress = () => undefined } = options;

  try {
    onProgress('Launching browser');
    browser = await chromium.launch({ headless: true });
  } catch {
    throw new Error(
      'Playwright browser not installed. Run: npx playwright install',
    );
  }

  try {
    onProgress('Opening page');

    const page = await browser.newPage();

    onProgress('Injecting accessibility engine');

    await page.addInitScript({
      content: axe.source,
    });

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: BROWSER_TIMEOUT,
    });

    onProgress('Running accessibility checks');

    const result = await page.evaluate(async () => {
      const runtimeWindow = window as unknown as WindowWithAxe;

      return await runtimeWindow.axe.run();
    });

    onProgress('Processing results');

    const issues: ScanIssue[] = result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? IMPACT_UNKNOWN,
      description: violation.description,
      help: violation.help,
      selectors: violation.nodes.flatMap((node) => `\n${node.target}`),
    }));

    return {
      url,
      issues,
    };
  } finally {
    await browser.close();
  }
}

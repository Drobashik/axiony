import axe from 'axe-core';
import { Browser, chromium } from 'playwright';
import type {
  ScanIssue,
  ScanResult,
  ScanUrlOptions,
  WindowWithAxe,
} from './types';
import { BROWSER_TIMEOUT, IMPACT_UNKNOWN } from './constants';
import { text } from '../../ui/terminal/styles';

export async function scanUrl(
  url: string,
  options: ScanUrlOptions = {},
): Promise<ScanResult> {
  let browser: Browser;
  const { onProgressPrint = () => undefined } = options;

  try {
    onProgressPrint('Launching browser');

    browser = await chromium.launch({ headless: true });
  } catch {
    throw new Error(
      `Playwright browser not installed. Run: ${text.bold('npx playwright install')}`,
    );
  }

  try {
    onProgressPrint('Opening page');

    const page = await browser.newPage();

    onProgressPrint('Injecting accessibility engine');

    await page.addInitScript({
      content: axe.source,
    });

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: BROWSER_TIMEOUT,
    });

    onProgressPrint('Running accessibility checks');

    const result = await page.evaluate(async () => {
      const runtimeWindow = window as unknown as WindowWithAxe;

      return await runtimeWindow.axe.run();
    });

    onProgressPrint('Processing results');

    const issues: ScanIssue[] = result.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact ?? IMPACT_UNKNOWN,
      description: violation.description,
      help: violation.help,
      selectors: violation.nodes.flatMap((node) => node.target),
    }));

    return {
      url,
      issues,
    };
  } finally {
    await browser.close();
  }
}

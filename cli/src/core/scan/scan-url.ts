import axe from 'axe-core';
import { Browser, chromium } from 'playwright';
import type {
  AxeRunResult,
  ScanIssue,
  ScanResult,
  ScanUrlOptions,
  WindowWithAxe,
} from './types';
import { BROWSER_TIMEOUT, IMPACT_UNKNOWN } from './constants';
import { text } from '../../ui/terminal/styles';

const formatNavigationError = (error: unknown): string =>
  error instanceof Error && error.message.includes('Timeout')
    ? 'Page load timed out. Check the URL and try again.'
    : 'Could not open the page. Check the URL and try again.';

export async function scanUrl(
  url: string,
  options: ScanUrlOptions = {},
): Promise<ScanResult> {
  let browser: Browser | undefined;
  const { onProgressPrint = () => undefined } = options;

  try {
    onProgressPrint('Launching browser');

    browser = await chromium.launch({ headless: true });
  } catch {
    throw new Error(
      `Could not launch browser. Run ${text.bold('npx playwright install')} and try again.`,
    );
  }

  try {
    onProgressPrint('Opening page');

    const page = await browser.newPage();

    onProgressPrint('Injecting accessibility engine');

    await page.addInitScript({
      content: axe.source,
    });

    try {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: BROWSER_TIMEOUT,
      });
    } catch (error) {
      const navigationError = new Error(
        formatNavigationError(error),
      ) as Error & {
        cause?: unknown;
      };
      navigationError.cause = error;
      throw navigationError;
    }

    onProgressPrint('Running accessibility checks');

    let result: AxeRunResult;

    try {
      result = await page.evaluate(async () => {
        const runtimeWindow = window as unknown as WindowWithAxe;

        return await runtimeWindow.axe.run();
      });
    } catch {
      throw new Error('Could not run accessibility scan.');
    }

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
    await browser?.close().catch(() => undefined);
  }
}

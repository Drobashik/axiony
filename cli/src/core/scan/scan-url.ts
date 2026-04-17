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

const mapAxeResultToIssue = (
  result: AxeRunResult['violations'][number],
): ScanIssue => ({
  id: result.id,
  impact: result.impact ?? IMPACT_UNKNOWN,
  description: result.description,
  help: result.help,
  helpUrl: result.helpUrl,
  tags: result.tags,
  selectors: result.nodes.flatMap((node) => node.target),
});

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

    return {
      url: result.url,
      timestamp: result.timestamp,
      issues: result.violations.map(mapAxeResultToIssue),
      manualChecks: result.incomplete.map(mapAxeResultToIssue),
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

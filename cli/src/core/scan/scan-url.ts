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

const selectorExists = async (
  page: Awaited<ReturnType<Browser['newPage']>>,
  selector: string,
): Promise<boolean> => {
  try {
    return await page.evaluate(
      (cssSelector) => document.querySelector(cssSelector) !== null,
      selector,
    );
  } catch {
    throw new Error(`Selector "${selector}" is invalid.`);
  }
};

export async function scanUrl(
  url: string,
  options: ScanUrlOptions = {},
): Promise<ScanResult> {
  let browser: Browser | undefined;
  const { onProgressPrint = () => undefined, selector } = options;

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

    if (selector) {
      onProgressPrint('Validating selector');

      if (!(await selectorExists(page, selector))) {
        throw new Error(`Selector "${selector}" was not found on the page.`);
      }
    }

    onProgressPrint('Running accessibility checks');

    let result: AxeRunResult;

    try {
      result = await page.evaluate(async (context) => {
        const runtimeWindow = window as unknown as WindowWithAxe;

        return await runtimeWindow.axe.run(context);
      }, selector);
    } catch {
      throw new Error('Could not run accessibility scan.');
    }

    onProgressPrint('Processing results');

    return {
      url: result.url,
      timestamp: result.timestamp,
      metadata: selector ? { selector } : undefined,
      issues: result.violations.map(mapAxeResultToIssue),
      manualChecks: result.incomplete.map(mapAxeResultToIssue),
    };
  } finally {
    await browser?.close().catch(() => undefined);
  }
}

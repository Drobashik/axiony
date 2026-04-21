import axe from 'axe-core';
import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';
import type {
  AxeRunResult,
  AxeRunOptions,
  ScanIssue,
  ScanProgressMessage,
  ScanResult,
  WindowWithAxe,
} from './types';
import {
  IMPACT_UNKNOWN,
  SCAN_ACCEPT_LANGUAGE,
  SCAN_LOCALE,
  SCAN_TIMEZONE_ID,
  SCAN_VIEWPORT_HEIGHT,
  SCAN_VIEWPORT_WIDTH,
} from './constants';
import { findDuplicateIdIssues } from './custom-checks';
import { text } from '../../ui/terminal/styles';

export const launchScanBrowser = async (
  onProgressPrint: (message: ScanProgressMessage) => void,
): Promise<Browser> => {
  try {
    onProgressPrint('Launching browser');

    return await chromium.launch({ headless: true });
  } catch {
    throw new Error(
      `Could not launch browser. Run ${text.bold('npx playwright install')} and try again.`,
    );
  }
};

const createDesktopChromeUserAgent = (chromeVersion: string): string =>
  `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;

export const createScanPage = async (browser: Browser): Promise<Page> => {
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'Accept-Language': SCAN_ACCEPT_LANGUAGE,
    },
    locale: SCAN_LOCALE,
    timezoneId: SCAN_TIMEZONE_ID,
    userAgent: createDesktopChromeUserAgent(browser.version()),
    viewport: {
      height: SCAN_VIEWPORT_HEIGHT,
      width: SCAN_VIEWPORT_WIDTH,
    },
  });

  return await context.newPage();
};

export const addAxeInitScript = async (page: Page): Promise<void> => {
  await page.addInitScript({
    content: axe.source,
  });
};

const mapAxeResultToIssue = (
  result: AxeRunResult['violations'][number],
): ScanIssue => ({
  id: result.id,
  impact: result.impact ?? IMPACT_UNKNOWN,
  description: result.description,
  help: result.help,
  helpUrl: result.helpUrl,
  snippets: result.nodes
    .map((node) => node.html)
    .filter((html): html is string => Boolean(html)),
  tags: result.tags,
  selectors: result.nodes.flatMap((node) => node.target),
});

const selectorExists = async (
  page: Page,
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

const ensureAxeIsReady = async (page: Page): Promise<void> => {
  const hasAxe = await page
    .evaluate(() => {
      const runtimeWindow = window as unknown as Partial<WindowWithAxe>;

      return typeof runtimeWindow.axe?.run === 'function';
    })
    .catch(() => false);

  if (!hasAxe) {
    await page.addScriptTag({ content: axe.source });
  }
};

export async function runAxeOnPage(
  page: Page,
  options: {
    axeOptions?: AxeRunOptions;
    onProgressPrint: (message: ScanProgressMessage) => void;
    selector?: string;
  },
): Promise<Pick<ScanResult, 'url' | 'timestamp' | 'issues' | 'manualChecks'>> {
  const { axeOptions, onProgressPrint, selector } = options;

  onProgressPrint('Injecting accessibility engine');

  try {
    await ensureAxeIsReady(page);
  } catch {
    throw new Error('Could not inject accessibility engine.');
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
    result = await page.evaluate(
      async ({ context, runOptions }) => {
        const runtimeWindow = window as unknown as WindowWithAxe;

        return await runtimeWindow.axe.run(context, runOptions);
      },
      { context: selector, runOptions: axeOptions },
    );
  } catch {
    throw new Error('Could not run accessibility scan.');
  }

  onProgressPrint('Processing results');

  const customIssues = await findDuplicateIdIssues(page, selector);

  return {
    url: result.url,
    timestamp: result.timestamp,
    issues: [...result.violations.map(mapAxeResultToIssue), ...customIssues],
    manualChecks: result.incomplete.map(mapAxeResultToIssue),
  };
}

import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Browser } from 'playwright';
import { BROWSER_TIMEOUT } from '../scan/constants';
import { launchScanBrowser, runAxeOnPage } from '../scan/axe';
import type { ScanResult } from '../scan/types';
import {
  COMPONENT_HARNESS_HTML,
  COMPONENT_SCAN_DISABLED_RULES,
  COMPONENT_SCAN_PROFILE,
  COMPONENT_SCAN_SELECTOR,
  COMPONENT_SUPPORTED_EXTENSIONS,
  COMPONENT_TEMP_DIR_PREFIX,
} from './constants';
import type { ScanComponentOptions } from './types';
import {
  buildReactComponentBundle,
  renderBundledReactComponent,
} from './react/render-harness';
import { resolveReactComponentExport } from './react/export-resolution';
import { COMPONENT_SCAN_AXE_OPTIONS } from './profile';

const resolveComponentFile = async (filePath: string): Promise<string> => {
  const resolvedPath = resolve(filePath);

  if (!COMPONENT_SUPPORTED_EXTENSIONS.has(extname(resolvedPath))) {
    throw new Error(
      'component command supports local .tsx, .jsx, .ts, and .js React component files',
    );
  }

  try {
    const fileStat = await stat(resolvedPath);

    if (!fileStat.isFile()) {
      throw new Error();
    }
  } catch {
    throw new Error(`component file was not found: ${filePath}`);
  }

  return resolvedPath;
};

export async function scanComponent(
  filePath: string,
  options: ScanComponentOptions = {},
): Promise<ScanResult> {
  const { onProgressPrint = () => undefined, selector } = options;
  const scanSelector = selector ?? COMPONENT_SCAN_SELECTOR;
  const resolvedPath = await resolveComponentFile(filePath);
  const sourceText = await readFile(resolvedPath, 'utf8').catch(() => {
    throw new Error('failed to import component file');
  });
  const selection = resolveReactComponentExport(sourceText, resolvedPath);
  const tempDir = await mkdtemp(join(tmpdir(), COMPONENT_TEMP_DIR_PREFIX));
  const harnessPath = join(tempDir, 'index.html');
  let browser: Browser | undefined;

  try {
    const bundlePath = await buildReactComponentBundle(
      resolvedPath,
      selection,
      tempDir,
    );

    await writeFile(harnessPath, COMPONENT_HARNESS_HTML, 'utf8');

    onProgressPrint('Rendering component');

    browser = await launchScanBrowser(onProgressPrint);

    const page = await browser.newPage();

    try {
      await page.goto(pathToFileURL(harnessPath).href, {
        waitUntil: 'domcontentloaded',
        timeout: BROWSER_TIMEOUT,
      });
      await renderBundledReactComponent(page, bundlePath);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('Component could not be rendered')
      ) {
        throw error;
      }

      if (
        error instanceof Error &&
        error.message.includes('failed to import component file')
      ) {
        throw error;
      }

      const renderError = new Error(
        'Component could not be rendered with zero-config mode',
      ) as Error & { cause?: unknown };
      renderError.cause = error;
      throw renderError;
    }

    const result = await runAxeOnPage(page, {
      axeOptions: COMPONENT_SCAN_AXE_OPTIONS,
      onProgressPrint,
      selector: scanSelector,
    });

    return {
      url: resolvedPath,
      timestamp: result.timestamp,
      metadata: {
        disabledRules: COMPONENT_SCAN_DISABLED_RULES,
        profile: COMPONENT_SCAN_PROFILE,
        selector: scanSelector,
      },
      issues: result.issues,
      manualChecks: result.manualChecks,
    };
  } finally {
    await browser?.close().catch(() => undefined);
    await rm(tempDir, { force: true, recursive: true }).catch(() => undefined);
  }
}

import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { build, type BuildFailure } from 'esbuild';
import type { Page } from 'playwright';
import {
  COMPONENT_RENDER_TIMEOUT_ERROR,
  MISSING_REACT_DEPENDENCIES_MESSAGE,
} from '../constants';
import type { ComponentExportSelection } from '../types';
import { resolveReactDependencies } from './dependencies';
import { createReactRenderEntry } from './entry-template';
import { mapStackToOriginalLocation } from './source-map';
import type { BrowserRenderResult, ReactComponentBundle } from './types';

const formatBuildError = (error: unknown): string => {
  const buildError = error as Partial<BuildFailure>;
  const [firstError] = buildError.errors ?? [];

  if (
    firstError?.text?.includes('Could not resolve "react"') ||
    firstError?.text?.includes('Could not resolve "react-dom')
  ) {
    return MISSING_REACT_DEPENDENCIES_MESSAGE;
  }

  if (firstError?.text) {
    return `Failed to import component file: ${firstError.text}`;
  }

  return 'Failed to import component file';
};

export const buildReactComponentBundle = async (
  componentPath: string,
  selection: ComponentExportSelection,
  tempDir: string,
): Promise<ReactComponentBundle> => {
  const entryPath = join(tempDir, 'entry.tsx');
  const bundlePath = join(tempDir, 'bundle.js');
  const dependencies = resolveReactDependencies(componentPath);

  await writeFile(
    entryPath,
    createReactRenderEntry(componentPath, selection, dependencies),
    'utf8',
  );

  try {
    await build({
      absWorkingDir: process.cwd(),
      bundle: true,
      entryPoints: [entryPath],
      format: 'iife',
      jsx: 'automatic',
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
        '.ts': 'tsx',
        '.tsx': 'tsx',
      },
      logLevel: 'silent',
      nodePaths: [join(dirname(componentPath), 'node_modules')],
      outfile: bundlePath,
      platform: 'browser',
      sourcemap: true,
    });
  } catch (error) {
    const importError = new Error(formatBuildError(error)) as Error & {
      cause?: unknown;
    };
    importError.cause = error;
    throw importError;
  }

  return {
    scriptPath: bundlePath,
    sourceMapPath: `${bundlePath}.map`,
  };
};

export const renderBundledReactComponent = async (
  page: Page,
  bundle: ReactComponentBundle,
): Promise<void> => {
  await page.addScriptTag({ path: bundle.scriptPath });

  const result = await page
    .waitForFunction(() => Boolean(window.__AXIONY_COMPONENT_RENDER__), null, {
      timeout: 5000,
    })
    .then(() =>
      page.evaluate(
        () => window.__AXIONY_COMPONENT_RENDER__ as BrowserRenderResult,
      ),
    )
    .catch((): BrowserRenderResult => {
      return {
        ok: false,
        message: COMPONENT_RENDER_TIMEOUT_ERROR,
      };
    });

  if (!result.ok) {
    const location = await mapStackToOriginalLocation(
      result.stack,
      bundle.sourceMapPath,
    ).catch(() => undefined);
    const message = location
      ? `${result.message}\nLocation: ${location}`
      : result.message;

    throw new Error(message);
  }
};

declare global {
  interface Window {
    __AXIONY_COMPONENT_RENDER__?: BrowserRenderResult;
  }
}

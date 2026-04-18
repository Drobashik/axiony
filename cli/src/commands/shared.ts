import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import type { ScanOutputFormat } from '../core/scan/types';

export type JsonOutputOptions = {
  json?: boolean;
  output?: string;
};

export const getScanOutputFormat = (
  options: JsonOutputOptions,
): ScanOutputFormat => (options.json ? 'json' : 'text');

export const validateJsonOutputOptions = (options: JsonOutputOptions) => {
  if (options.output && !options.json) {
    throw new Error('Use --json with --output.');
  }
};

export const writeOutputFile = async (fileName: string, output: string) => {
  const reportsDir = resolve(process.cwd(), 'axy-reports');

  const safeFileName = fileName.endsWith('.json')
    ? fileName
    : `${fileName}.json`;

  const filePath = join(reportsDir, safeFileName);

  try {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, `${output}\n`, 'utf8');
  } catch {
    throw new Error('Could not write output file.');
  }
};

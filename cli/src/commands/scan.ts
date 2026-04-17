import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { program } from 'commander';
import { validateUrl } from '../helpers';
import { logger } from '../logger/Logger';
import { scanUrl } from '../core/scan/scan-url';
import { CliSpinner } from '../ui/terminal/spinner';
import { formatScanOutput } from '../ui/scan/formatter';
import type { ScanOutputFormat } from '../core/scan/types';

const scanLogger = logger.child('scan');

type ScanCommandOptions = {
  json?: boolean;
  output?: string;
};

const writeOutputFile = async (fileName: string, output: string) => {
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

const validateScanOptions = (options: ScanCommandOptions) => {
  if (options.output && !options.json) {
    throw new Error('Use --json with --output.');
  }
};

const runScanCommand = async (url: string, options: ScanCommandOptions) => {
  const format: ScanOutputFormat = options.json ? 'json' : 'text';
  const shouldPrintToStdout = !options.output;
  const shouldPrintProgress = shouldPrintToStdout && format === 'text';
  const spinner = new CliSpinner(scanLogger);
  let spinnerStarted = false;

  try {
    validateUrl(url);
    validateScanOptions(options);

    if (shouldPrintProgress) {
      spinner.start(`Scanning ${url}`);
      spinnerStarted = true;
    }

    const result = await scanUrl(url, {
      onProgressPrint: (message) => {
        if (shouldPrintProgress) {
          spinner.update(`${message} ${url}`);
        }
      },
    });

    if (shouldPrintProgress) {
      spinner.succeed(
        result.issues.length === 0
          ? `Scan completed for ${url}`
          : `Scan completed with issues for ${url}`,
      );
    }

    const output = formatScanOutput(result, format);

    if (options.output) {
      await writeOutputFile(options.output, output);
    } else {
      scanLogger.print(output);
    }

    process.exitCode = result.issues.length === 0 ? 0 : 1;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    if (spinnerStarted) {
      spinner.fail(`Scan failed for ${url}`);
    }

    scanLogger.print(message, { stream: 'stderr' });

    process.exitCode = 2;
  }
};

export const registerScanCommand = () => {
  program
    .command('scan')
    .summary('Scan one URL for accessibility issues')
    .description(
      'Scan one page with axe-core and print an accessibility report.',
    )
    .argument('<url>', 'Target URL to scan')
    .option('--json', 'Print the scan result as pretty JSON')
    .option(
      '-o, --output <name>',
      'Write JSON output to a file in axy-reports (requires --json)',
    )
    .addHelpText(
      'after',
      `

Examples:
  $ axiony scan https://example.com
  $ axiony scan https://example.com --json
  $ axiony scan https://example.com --json --output example
`,
    )
    .action(runScanCommand);
};

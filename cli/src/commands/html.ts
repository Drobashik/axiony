import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { program } from 'commander';
import { logger } from '../logger/Logger';
import { scanHtml } from '../core/html/scan-html';
import { CliSpinner } from '../ui/terminal/spinner';
import { formatScanOutput } from '../ui/scan/formatter';
import {
  getScanOutputFormat,
  validateJsonOutputOptions,
  writeOutputFile,
  type JsonOutputOptions,
} from './shared';

const htmlLogger = logger.child('html');

type HtmlCommandOptions = JsonOutputOptions & {
  file?: string;
  html?: string;
  selector?: string;
  verbose?: boolean;
};

const validateHtmlOptions = (options: HtmlCommandOptions) => {
  validateJsonOutputOptions(options);

  const inputCount =
    Number(options.file !== undefined) + Number(options.html !== undefined);

  if (inputCount !== 1) {
    throw new Error(
      'Provide exactly one input source: --file <path> or --html "<html>...".',
    );
  }

  if (options.selector !== undefined && options.selector.trim().length === 0) {
    throw new Error('Use --selector with a non-empty CSS selector.');
  }
};

const readHtmlFile = async (filePath: string): Promise<string> => {
  try {
    return await readFile(resolve(filePath), 'utf8');
  } catch {
    throw new Error(`Could not read HTML file: ${filePath}`);
  }
};

const runHtmlCommand = async (options: HtmlCommandOptions) => {
  const format = getScanOutputFormat(options);
  const shouldPrintToStdout = !options.output;
  const shouldPrintProgress = shouldPrintToStdout && format === 'text';
  const spinner = new CliSpinner(htmlLogger);
  let spinnerStarted = false;
  let targetLabel = 'HTML input';

  try {
    validateHtmlOptions(options);

    const html =
      options.file !== undefined
        ? await readHtmlFile(options.file)
        : (options.html ?? '');

    targetLabel =
      options.file !== undefined ? resolve(options.file) : 'HTML input';

    if (shouldPrintProgress) {
      spinner.start(`Scanning ${targetLabel}`);
      spinnerStarted = true;
    }

    const result = await scanHtml(html, {
      label: targetLabel,
      onProgressPrint: (message) => {
        if (shouldPrintProgress) {
          spinner.update(`${message} ${targetLabel}`);
        }
      },
      selector: options.selector?.trim(),
    });

    if (shouldPrintProgress) {
      spinner.succeed(
        result.issues.length === 0
          ? `Scan completed for ${targetLabel}`
          : `Scan completed with issues for ${targetLabel}`,
      );
    }

    const output = formatScanOutput(result, format, {
      command: 'axiony html',
      verbose: options.verbose,
    });

    if (options.output) {
      await writeOutputFile(options.output, output);
    } else {
      htmlLogger.print(output);
    }

    process.exitCode = result.issues.length === 0 ? 0 : 1;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    if (spinnerStarted) {
      spinner.fail(`Scan failed for ${targetLabel}`);
    }

    htmlLogger.print(message, { stream: 'stderr' });

    process.exitCode = 2;
  }
};

export const registerHtmlCommand = () => {
  program
    .command('html')
    .summary('Scan raw HTML for accessibility issues')
    .description(
      'Render raw HTML with Playwright, run axe-core, and print an accessibility report.',
    )
    .option('--file <path>', 'Read HTML from a local file')
    .option('--html <html>', 'Read HTML from an inline string')
    .option('--json', 'Print the scan result as pretty JSON')
    .option('--selector <selector>', 'Scan only within a matched DOM region')
    .option('--verbose', 'Print all matched elements and HTML snippets')
    .option(
      '-o, --output <name>',
      'Write JSON output to a file in axy-reports (requires --json)',
    )
    .addHelpText(
      'after',
      `

Examples:
  $ axiony html --file ./page.html
  $ axiony html --html "<main><img src='hero.png'></main>"
  $ axiony html --file ./page.html --verbose
  $ axiony html --file ./page.html --json
  $ axiony html --file ./page.html --json --output page
`,
    )
    .action(runHtmlCommand);
};

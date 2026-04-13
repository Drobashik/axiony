import { program } from 'commander';
import { validateUrl } from '../helpers';

const SCAN = 'scan';

const runScanCommand = async (url: string) => {
  try {
    validateUrl(url);

    console.log(`Scanning ${url}...`);
    console.log('');
    console.log('CLI is wired correctly. Scanner implementation comes next.');

    process.exit(0);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    console.error(message);

    process.exit(2);
  }
};

export const registerScanCommand = () => {
  program
    .command(SCAN)
    .description('Scan a page for accessibility issues')
    .argument('<url>', 'Target URL to scan')
    .action(runScanCommand);
};

export const BROWSER_TIMEOUT = 100_000;

export const MISSING_CHROMIUM_MESSAGE = [
  'Axiony needs Playwright Chromium to run scans.',
  '',
  'Run:',
  '  axiony install',
  '',
  'For CI/Linux:',
  '  axiony install --with-deps',
].join('\n');

export const IMPACT_UNKNOWN = 'unknown';

export const PAGE_READINESS_TIMEOUT = 12_000;

export const PAGE_READINESS_STABLE_WINDOW = 1_200;

export const PAGE_READINESS_MIN_OBSERVATION = 1_800;

export const PAGE_READINESS_SAMPLE_INTERVAL = 250;

export const PAGE_READINESS_RESOURCE_TIMEOUT = 2_500;

export const PAGE_READINESS_NETWORK_IDLE_TIMEOUT = 3_000;

export const PAGE_READINESS_MIN_TEXT_LENGTH = 20;

export const PAGE_READINESS_MIN_INTERACTIVE_ELEMENTS = 1;

export const PAGE_CHALLENGE_RETRY_TIMEOUT = 14_000;

export const PAGE_CHALLENGE_RETRY_DELAY = 1_200;

export const PAGE_CHALLENGE_MAX_RETRY_DELAY = 4_000;

export const PAGE_CHALLENGE_RETRY_ATTEMPTS = 2;

export const PAGE_SHORT_REFRESH_MAX_DELAY_SECONDS = 5;

export const SCAN_REFRESH_CONTEXT_ATTEMPTS = 2;

export const SCAN_REFRESH_CONTEXT_RETRY_DELAY = 1_500;

export const SCAN_VIEWPORT_WIDTH = 1366;

export const SCAN_VIEWPORT_HEIGHT = 768;

export const SCAN_ACCEPT_LANGUAGE = 'en-US,en;q=0.9';

export const SCAN_LOCALE = 'en-US';

export const SCAN_TIMEZONE_ID = 'UTC';

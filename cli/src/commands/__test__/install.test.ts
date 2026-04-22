import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildPlaywrightInstallArgs } from '../install';

test('builds Chromium-only Playwright install args by default', () => {
  assert.deepEqual(buildPlaywrightInstallArgs({}), ['install', 'chromium']);
});

test('adds system dependency installation when requested', () => {
  assert.deepEqual(buildPlaywrightInstallArgs({ withDeps: true }), [
    'install',
    '--with-deps',
    'chromium',
  ]);
});

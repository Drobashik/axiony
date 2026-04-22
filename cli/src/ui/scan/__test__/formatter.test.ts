import test from 'node:test';
import assert from 'node:assert/strict';
import { formatCiScanReport, formatScanOutput } from '../formatter';
import type { ScanResult } from '../../../core/scan/types';

const scanResult: ScanResult = {
  url: 'fixture',
  timestamp: '2026-04-21T00:00:00.000Z',
  issues: [
    {
      id: 'duplicate-id',
      impact: 'serious',
      description: 'Ensures id attribute values are unique.',
      help: 'ID attributes must be unique',
      helpUrl: 'https://example.com',
      selectors: ['#Path', '#Path'],
      snippets: ['<div id="Path">First</div>', '<span id="Path">Second</span>'],
      tags: ['wcag2a'],
    },
  ],
  manualChecks: [],
};

test('keeps text reports compact by default', () => {
  const output = formatScanOutput(scanResult, 'text', {
    command: 'axiony scan',
  });

  assert.match(output, /Elements:\s+#Path, #Path/);
  assert.doesNotMatch(output, /<div id="Path">First<\/div>/);
  assert.match(output, /re-run axiony scan after fixes/);
});

test('prints selectors and snippets in verbose text reports', () => {
  const output = formatScanOutput(scanResult, 'text', {
    command: 'axiony scan',
    verbose: true,
  });

  assert.match(output, /Elements:\s+2/);
  assert.match(output, /1\. #Path/);
  assert.match(output, /<div id="Path">First<\/div>/);
  assert.match(output, /2\. #Path/);
  assert.match(output, /<span id="Path">Second<\/span>/);
});

test('prints a compact CI scan report with JSON artifact path', () => {
  const output = formatCiScanReport(scanResult, {
    outputPath: 'axy-reports/component.json',
  });

  assert.match(output, /Axiony accessibility scan/);
  assert.match(output, /Target: fixture/);
  assert.match(output, /Status: failed/);
  assert.match(output, /Issues: 1/);
  assert.match(output, /serious\s+1/);
  assert.match(output, /serious\s+duplicate-id\s+#Path, #Path/);
  assert.match(output, /JSON report:\n\s{2}axy-reports\/component\.json/);
});

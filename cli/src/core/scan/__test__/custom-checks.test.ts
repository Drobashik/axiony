import test from 'node:test';
import assert from 'node:assert/strict';
import { scanHtml } from '../../html/scan-html';
import type { ScanIssue, ScanResult } from '../types';

const findDuplicateIdIssue = (
  result: ScanResult,
  duplicateValue: string,
): ScanIssue | undefined =>
  result.issues.find(
    (issue) =>
      issue.id === 'duplicate-id' &&
      issue.description.includes(`"${duplicateValue}"`),
  );

test('adds duplicate id issues with element snippets', async () => {
  const result = await scanHtml(
    `
      <main>
        <h1>Duplicate IDs</h1>
        <div id="Path">First</div>
        <span id="Path">Second</span>
      </main>
    `,
    { label: 'duplicate id fixture' },
  );

  const duplicateIdIssue = findDuplicateIdIssue(result, 'Path');

  assert.ok(duplicateIdIssue);
  assert.equal(duplicateIdIssue.impact, 'serious');
  assert.deepEqual(duplicateIdIssue.selectors, ['#Path', '#Path']);
  assert.deepEqual(duplicateIdIssue.snippets, [
    '<div id="Path">First</div>',
    '<span id="Path">Second</span>',
  ]);
});

test('ignores duplicate empty id attributes', async () => {
  const result = await scanHtml(
    `
      <main>
        <h1>Empty IDs</h1>
        <script id="">window.first = true;</script>
        <script id="">window.second = true;</script>
      </main>
    `,
    { label: 'empty id fixture' },
  );

  assert.equal(findDuplicateIdIssue(result, ''), undefined);
});

test('keeps duplicate IDs referenced by accessibility attributes serious', async () => {
  const result = await scanHtml(
    `
      <main>
        <h1>Referenced IDs</h1>
        <label for="Email">Email</label>
        <input id="Email">
        <div id="Email">Duplicate target</div>
      </main>
    `,
    { label: 'referenced id fixture' },
  );

  const duplicateIdIssue = findDuplicateIdIssue(result, 'Email');

  assert.ok(duplicateIdIssue);
  assert.equal(duplicateIdIssue.impact, 'serious');
});

test('keeps duplicate IDs referenced by fragment links serious', async () => {
  const result = await scanHtml(
    `
      <main>
        <h1>Fragment IDs</h1>
        <a href="#Details">Details</a>
        <section id="Details">First</section>
        <section id="Details">Second</section>
      </main>
    `,
    { label: 'fragment id fixture' },
  );

  const duplicateIdIssue = findDuplicateIdIssue(result, 'Details');

  assert.ok(duplicateIdIssue);
  assert.equal(duplicateIdIssue.impact, 'serious');
});

test('reports duplicate SVG definition IDs as minor', async () => {
  const result = await scanHtml(
    `
      <main>
        <h1>SVG IDs</h1>
        <svg aria-hidden="true">
          <defs>
            <linearGradient id="instagramGradient"></linearGradient>
          </defs>
        </svg>
        <svg aria-hidden="true">
          <defs>
            <linearGradient id="instagramGradient"></linearGradient>
          </defs>
        </svg>
      </main>
    `,
    { label: 'svg id fixture' },
  );

  const duplicateIdIssue = findDuplicateIdIssue(result, 'instagramGradient');

  assert.ok(duplicateIdIssue);
  assert.equal(duplicateIdIssue.impact, 'minor');
  assert.equal(duplicateIdIssue.help, 'SVG definition IDs should be unique');
});

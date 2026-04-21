import test from 'node:test';
import assert from 'node:assert/strict';
import { scanHtml } from '../../html/scan-html';

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

  const duplicateIdIssue = result.issues.find(
    (issue) => issue.id === 'duplicate-id',
  );

  assert.ok(duplicateIdIssue);
  assert.equal(duplicateIdIssue.impact, 'serious');
  assert.deepEqual(duplicateIdIssue.selectors, ['#Path', '#Path']);
  assert.deepEqual(duplicateIdIssue.snippets, [
    '<div id="Path">First</div>',
    '<span id="Path">Second</span>',
  ]);
});

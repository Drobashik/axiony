import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { COMPONENT_SCAN_DISABLED_RULES } from '../constants';
import { scanComponent } from '../scan-component';

test('scans a simple self-contained React component', async () => {
  const tempDir = await mkdtemp(join(process.cwd(), 'axiony-component-test-'));
  const componentPath = join(tempDir, 'ImageCard.tsx');

  try {
    await writeFile(
      componentPath,
      `
        export default function ImageCard() {
          return <main><img src="hero.png" /></main>;
        }
      `,
      'utf8',
    );

    const result = await scanComponent(componentPath);

    assert.equal(result.url, componentPath);
    assert.equal(result.metadata?.profile, 'component');
    assert.equal(result.metadata?.selector, '#root');
    assert.ok(result.issues.some((issue) => issue.id === 'image-alt'));
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
});

test('uses a component-focused axe profile without page-level rules', async () => {
  const tempDir = await mkdtemp(join(process.cwd(), 'axiony-component-test-'));
  const componentPath = join(tempDir, 'TodoList.tsx');

  try {
    await writeFile(
      componentPath,
      `
        export default function TodoList() {
          return (
            <div>
              <input type="text" placeholder="Enter comment" />
              <button>Add todo</button>
              <ul><li>Todo</li></ul>
            </div>
          );
        }
      `,
      'utf8',
    );

    const result = await scanComponent(componentPath);
    const issueIds = result.issues.map((issue) => issue.id);

    assert.equal(result.metadata?.profile, 'component');
    assert.deepEqual(
      result.metadata?.disabledRules,
      COMPONENT_SCAN_DISABLED_RULES,
    );
    assert.ok(!issueIds.includes('landmark-one-main'));
    assert.ok(!issueIds.includes('page-has-heading-one'));
    assert.ok(!issueIds.includes('region'));
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
});

test('fails clearly when the component throws while rendering', async () => {
  const tempDir = await mkdtemp(join(process.cwd(), 'axiony-component-test-'));
  const componentPath = join(tempDir, 'BrokenCard.jsx');

  try {
    await writeFile(
      componentPath,
      `
        export const Card = () => {
          throw new Error('AXIONY_RENDER_TEST');
        };
      `,
      'utf8',
    );

    await assert.rejects(
      () => scanComponent(componentPath),
      /Component could not be rendered with zero-config mode: it may require props, providers, or runtime context\.\nCreate a small wrapper component, for example Component\.axiony\.jsx, and pass required props or providers there\.\nCause: AXIONY_RENDER_TEST\nLocation: .*BrokenCard\.jsx:\d+:\d+/,
    );
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
});

test('fails clearly when no component export exists', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'axiony-component-test-'));
  const componentPath = join(tempDir, 'helpers.ts');

  try {
    await writeFile(componentPath, 'export const label = "Save";', 'utf8');

    await assert.rejects(
      () => scanComponent(componentPath),
      /no React component export found/,
    );
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
});

test('fails clearly when React dependencies are not installed in the target project', async () => {
  const tempDir = await mkdtemp(join(tmpdir(), 'axiony-component-test-'));
  const componentPath = join(tempDir, 'MissingReact.tsx');

  try {
    await writeFile(
      componentPath,
      'export default function MissingReact() { return <button>Save</button>; }',
      'utf8',
    );

    await assert.rejects(
      () => scanComponent(componentPath),
      /React dependencies were not found/,
    );
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
});

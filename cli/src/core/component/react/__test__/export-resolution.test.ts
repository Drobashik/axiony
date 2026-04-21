import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveReactComponentExport } from '../export-resolution';

test('prefers a default component export', () => {
  const selection = resolveReactComponentExport(
    `
      export function Secondary() {
        return <span />;
      }

      export default function Button() {
        return <button />;
      }
    `,
    'Button.tsx',
  );

  assert.deepEqual(selection, {
    kind: 'default',
    exportName: 'default',
  });
});

test('falls back to the first PascalCase named export', () => {
  const selection = resolveReactComponentExport(
    `
      export const useButton = () => null;
      export const Button = () => <button />;
      export function Card() {
        return <section />;
      }
    `,
    'Button.tsx',
  );

  assert.deepEqual(selection, {
    kind: 'named',
    exportName: 'Button',
  });
});

test('rejects files without a likely component export', () => {
  assert.throws(
    () =>
      resolveReactComponentExport(
        `
          export const buttonLabel = 'Save';
          export function useThing() {
            return null;
          }
        `,
        'helpers.ts',
      ),
    /no React component export found/,
  );
});

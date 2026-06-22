import type { AxeRunOptions, ScanUrlOptions } from './types';

type WcagLevel = NonNullable<ScanUrlOptions['level']>;

const WCAG_TAGS_BY_LEVEL: Record<WcagLevel, string[]> = {
  A: ['wcag2a', 'wcag21a', 'wcag22a'],
  AA: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'],
  AAA: [
    'wcag2a',
    'wcag2aa',
    'wcag2aaa',
    'wcag21a',
    'wcag21aa',
    'wcag21aaa',
    'wcag22a',
    'wcag22aa',
    'wcag22aaa',
  ],
};

export const DEFAULT_AXE_RUN_OPTIONS: AxeRunOptions = {};

export const createWcagAxeOptions = (level: WcagLevel): AxeRunOptions => ({
  ...DEFAULT_AXE_RUN_OPTIONS,
  runOnly: {
    type: 'tag',
    values: WCAG_TAGS_BY_LEVEL[level],
  },
});

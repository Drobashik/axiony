import type { AxeRunOptions } from '../scan/types';
import { COMPONENT_SCAN_DISABLED_RULES } from './constants';

export const COMPONENT_SCAN_AXE_OPTIONS: AxeRunOptions = {
  rules: Object.fromEntries(
    COMPONENT_SCAN_DISABLED_RULES.map((ruleId) => [ruleId, { enabled: false }]),
  ),
};

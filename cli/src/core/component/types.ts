import type { ScanProgressMessage } from '../scan/types';

export type ComponentExportSelection = {
  kind: 'default' | 'named';
  exportName: string;
};

export type ScanComponentOptions = {
  onProgressPrint?: (message: ScanProgressMessage) => void;
  selector?: string;
};

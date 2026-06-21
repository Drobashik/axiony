import path from "node:path";
import type { CliScanResult, ScanUrlOptions } from "../types";

interface CliScannerModule {
  scanUrl(url: string, options?: ScanUrlOptions): Promise<CliScanResult>;
}

const loadScanner = (): CliScannerModule => {
  const scanModulePath = path.resolve(
    __dirname,
    "../../../cli/dist/core/scan/scan-url.js",
  );
  // Reuse the CLI scanner so hosted and local scans stay behaviorally aligned.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(scanModulePath) as CliScannerModule;
};

export const scanUrl = (
  url: string,
  options?: ScanUrlOptions,
): Promise<CliScanResult> => loadScanner().scanUrl(url, options);

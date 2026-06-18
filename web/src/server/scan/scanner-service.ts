import type { WcagLevel } from "./types";

const SCANNER_API_URL = process.env.AXIONY_SCANNER_API_URL?.replace(/\/+$/, "");

interface ScannerProxyResult {
  body: unknown;
  status: number;
}

const toJsonBody = (value: string): unknown => {
  if (!value) return {};

  try {
    return JSON.parse(value);
  } catch {
    return { error: value };
  }
};

const scannerFetch = async (path: string, init?: RequestInit): Promise<ScannerProxyResult> => {
  if (!SCANNER_API_URL) {
    return {
      body: { error: "Scanner service is not configured. Set AXIONY_SCANNER_API_URL." },
      status: 503,
    };
  }

  let response: Response;

  try {
    response = await fetch(`${SCANNER_API_URL}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scanner service request failed.";

    return {
      body: { error: `Scanner service request failed: ${message}` },
      status: 502,
    };
  }

  return {
    body: toJsonBody(await response.text()),
    status: response.status,
  };
};

export const hasScannerService = (): boolean => Boolean(SCANNER_API_URL);

export const requiresScannerService = (): boolean => process.env.VERCEL === "1";

export const scannerServiceUnavailable = (): ScannerProxyResult => ({
  body: { error: "Scanner service is not configured. Set AXIONY_SCANNER_API_URL." },
  status: 503,
});

export const createRemoteScanJob = (url: string, level: WcagLevel): Promise<ScannerProxyResult> =>
  scannerFetch("/scans", {
    method: "POST",
    body: JSON.stringify({ url, level }),
  });

export const getRemoteScanJob = (jobId: string): Promise<ScannerProxyResult> =>
  scannerFetch(`/scans/${encodeURIComponent(jobId)}`);

import { NextResponse } from "next/server";
import { ScanRequestError, validateScanRequest } from "@/server/scan/security";
import {
  createRemoteScanJob,
  hasScannerService,
  requiresScannerService,
  scannerServiceUnavailable,
} from "@/server/scan/scanner-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { url, level } = await validateScanRequest(body);

    if (hasScannerService()) {
      const remoteJob = await createRemoteScanJob(url, level);
      return NextResponse.json(remoteJob.body, { status: remoteJob.status });
    }

    if (requiresScannerService()) {
      const unavailable = scannerServiceUnavailable();
      return NextResponse.json(unavailable.body, { status: unavailable.status });
    }

    const { createScanJob } = await import("@/server/scan/job-store");
    const job = createScanJob(url, level);

    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    const status = error instanceof ScanRequestError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Could not start scan.";

    return NextResponse.json({ error: message }, { status });
  }
};

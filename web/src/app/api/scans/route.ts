import { NextResponse } from "next/server";
import { ScanRequestError, validateScanRequest } from "@/server/scan/security";
import { getServerUserId } from "@/server/auth/session";
import { ScanLimitError, assertUserCanStartScan } from "@/server/billing/state";
import { createPersistedScanJob, isScanJobSnapshot } from "@/server/scan/persistence";
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
    const userId = await getServerUserId();

    if (hasScannerService()) {
      if (userId) {
        await assertUserCanStartScan(userId);
      }

      const remoteJob = await createRemoteScanJob(url, level);

      if (!userId) {
        return NextResponse.json(remoteJob.body, { status: remoteJob.status });
      }

      if (!isScanJobSnapshot(remoteJob.body)) {
        return NextResponse.json(remoteJob.body, { status: remoteJob.status });
      }

      const job = await createPersistedScanJob(userId, url, level, remoteJob.body);
      return NextResponse.json(job, { status: remoteJob.status });
    }

    if (userId) {
      await assertUserCanStartScan(userId);
    }

    if (requiresScannerService()) {
      const unavailable = scannerServiceUnavailable();
      return NextResponse.json(unavailable.body, { status: unavailable.status });
    }

    const { createScanJob } = await import("@/server/scan/job-store");
    const job = createScanJob(url, level);

    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    const status =
      error instanceof ScanRequestError || error instanceof ScanLimitError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Could not start scan.";

    return NextResponse.json({ error: message }, { status });
  }
};

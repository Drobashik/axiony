import { NextResponse } from "next/server";
import { getServerUserId } from "@/server/auth/session";
import {
  getPersistedScanJob,
  isScanJobSnapshot,
  syncPersistedScanJob,
  toClientScanJob,
} from "@/server/scan/persistence";
import {
  getRemoteScanJob,
  hasScannerService,
  requiresScannerService,
  scannerServiceUnavailable,
} from "@/server/scan/scanner-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

export const GET = async (_request: Request, { params }: RouteContext) => {
  const { jobId } = await params;
  const userId = await getServerUserId();

  if (userId) {
    const persistedJob = await getPersistedScanJob(userId, jobId);

    if (persistedJob) {
      const active = persistedJob.status === "queued" || persistedJob.status === "scanning";

      if (active && persistedJob.scannerJobId && hasScannerService()) {
        const remoteJob = await getRemoteScanJob(persistedJob.scannerJobId);

        if (isScanJobSnapshot(remoteJob.body)) {
          const synced = await syncPersistedScanJob(userId, persistedJob, remoteJob.body);
          return NextResponse.json(synced, { status: remoteJob.status });
        }
      }

      return NextResponse.json(toClientScanJob(persistedJob));
    }
  }

  if (hasScannerService()) {
    const remoteJob = await getRemoteScanJob(jobId);
    return NextResponse.json(remoteJob.body, { status: remoteJob.status });
  }

  if (requiresScannerService()) {
    const unavailable = scannerServiceUnavailable();
    return NextResponse.json(unavailable.body, { status: unavailable.status });
  }

  const { getScanJob } = await import("@/server/scan/job-store");
  const job = getScanJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Scan job was not found." }, { status: 404 });
  }

  return NextResponse.json(job);
};

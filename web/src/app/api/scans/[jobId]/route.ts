import { NextResponse } from "next/server";
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

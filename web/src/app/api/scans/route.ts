import { NextResponse } from "next/server";
import { createScanJob } from "@/server/scan/job-store";
import { ScanRequestError, validateScanRequest } from "@/server/scan/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const { url, level } = await validateScanRequest(body);
    const job = createScanJob(url, level);

    return NextResponse.json(job, { status: 202 });
  } catch (error) {
    const status = error instanceof ScanRequestError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Could not start scan.";

    return NextResponse.json({ error: message }, { status });
  }
};

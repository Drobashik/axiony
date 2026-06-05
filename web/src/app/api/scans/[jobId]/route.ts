import { NextResponse } from "next/server";
import { getScanJob } from "@/server/scan/job-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

export const GET = async (_request: Request, { params }: RouteContext) => {
  const { jobId } = await params;
  const job = getScanJob(jobId);

  if (!job) {
    return NextResponse.json({ error: "Scan job was not found." }, { status: 404 });
  }

  return NextResponse.json(job);
};

import { NextResponse } from "next/server";
import { getServerUserId } from "@/server/auth/session";
import { DomainReplacementError, replaceUserDomainWithScanReport } from "@/server/scan/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{
    jobId: string;
  }>;
}

export const POST = async (request: Request, { params }: RouteContext) => {
  const userId = await getServerUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const { jobId } = await params;
    const body = (await request.json()) as { replacedHost?: unknown };

    if (typeof body.replacedHost !== "string") {
      return NextResponse.json({ error: "Choose a project to replace." }, { status: 400 });
    }

    const result = await replaceUserDomainWithScanReport({
      userId,
      jobId,
      replacedHost: body.replacedHost,
    });

    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof DomainReplacementError ? error.status : 500;
    const message = error instanceof Error ? error.message : "Could not replace this project.";

    return NextResponse.json({ error: message }, { status });
  }
};

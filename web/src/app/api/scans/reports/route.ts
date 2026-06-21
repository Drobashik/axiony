import { NextResponse } from "next/server";
import { getServerUserId } from "@/server/auth/session";
import { deleteUserScanReportsByHost, latestUserScanReports } from "@/server/scan/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const userId = await getServerUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const reports = await latestUserScanReports(userId);

  return NextResponse.json({ reports });
};

export const DELETE = async (request: Request) => {
  const userId = await getServerUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const host = new URL(request.url).searchParams.get("host")?.trim();
  if (!host) {
    return NextResponse.json({ error: "host is required." }, { status: 400 });
  }

  const result = await deleteUserScanReportsByHost(userId, host);

  return NextResponse.json({ deleted: result.count });
};

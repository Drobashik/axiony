import { NextResponse } from "next/server";
import type { PendingScan } from "@/lib/workspace/types";
import { getServerUserId } from "@/server/auth/session";
import { importPendingScanReport } from "@/server/scan/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const isSeverity = (value: unknown) =>
  value === "critical" || value === "serious" || value === "moderate" || value === "minor";

const isPendingScan = (value: unknown): value is PendingScan => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const scan = value as Partial<PendingScan>;
  return (
    typeof scan.url === "string" &&
    typeof scan.host === "string" &&
    typeof scan.path === "string" &&
    (scan.level === "A" || scan.level === "AA" || scan.level === "AAA") &&
    typeof scan.score === "number" &&
    typeof scan.total === "number" &&
    typeof scan.scannedAt === "string" &&
    Boolean(Date.parse(scan.scannedAt)) &&
    Boolean(scan.counts) &&
    Array.isArray(scan.issues) &&
    scan.issues.every(
      (issue) =>
        issue &&
        typeof issue === "object" &&
        typeof issue.id === "string" &&
        typeof issue.title === "string" &&
        isSeverity(issue.severity) &&
        typeof issue.rule === "string" &&
        typeof issue.count === "number",
    )
  );
};

export const POST = async (request: Request) => {
  const userId = await getServerUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json()) as { pending?: unknown };

  if (!isPendingScan(body.pending)) {
    return NextResponse.json({ error: "Pending scan payload is invalid." }, { status: 400 });
  }

  const job = await importPendingScanReport(userId, body.pending);

  return NextResponse.json(job, { status: 201 });
};

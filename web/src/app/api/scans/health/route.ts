import { NextResponse } from "next/server";
import {
  getRemoteScannerHealth,
  hasScannerService,
  requiresScannerService,
  scannerServiceUnavailable,
} from "@/server/scan/scanner-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  if (hasScannerService()) {
    const health = await getRemoteScannerHealth();
    return NextResponse.json(health.body, { status: health.status });
  }

  if (requiresScannerService()) {
    const unavailable = scannerServiceUnavailable();
    return NextResponse.json(unavailable.body, { status: unavailable.status });
  }

  return NextResponse.json({
    ok: true,
    mode: "local",
    scanner: "in-process",
  });
};

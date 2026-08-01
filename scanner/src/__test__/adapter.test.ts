import test from "node:test";
import assert from "node:assert/strict";
import { toScanReportPayload } from "../scan/adapter";
import type { CliScanResult } from "../types";

test("preserves the site icon returned by the CLI scanner", () => {
  const siteIcon =
    "https://millennium-chocolate.com/cdn/shop/files/logo-star.svg?height=32&width=32";
  const result: CliScanResult = {
    url: "https://millennium-chocolate.com/",
    timestamp: "2026-08-01T16:01:04.918Z",
    metadata: { siteIcon },
    issues: [],
    manualChecks: [],
  };

  const report = toScanReportPayload(result, "AA");

  assert.equal(report.siteIcon, siteIcon);
});

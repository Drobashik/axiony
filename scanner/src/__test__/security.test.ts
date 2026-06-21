import test from "node:test";
import assert from "node:assert/strict";
import { validateScanRequest } from "../security";

test("rejects local and private URLs", async () => {
  const blocked = [
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://10.0.0.1",
    "http://192.168.1.1",
    "http://[::1]",
  ];

  for (const url of blocked) {
    await assert.rejects(
      () => validateScanRequest({ url, level: "AA" }),
      /Internal|private/,
    );
  }
});

test("rejects unsupported protocols and embedded credentials", async () => {
  await assert.rejects(
    () => validateScanRequest({ url: "ftp://example.com", level: "AA" }),
    /Only http/,
  );
  await assert.rejects(
    () =>
      validateScanRequest({
        url: "https://user:pass@example.com",
        level: "AA",
      }),
    /embedded credentials/,
  );
});

test("normalizes valid public scan requests", async () => {
  const result = await validateScanRequest({
    url: "https://93.184.216.34/path#section",
    level: "AA",
  });

  assert.equal(result.url, "https://93.184.216.34/path");
  assert.equal(result.level, "AA");
});

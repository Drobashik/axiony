import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import { config, validateConfig } from "./config";
import { HttpError, readJson, requireAuth, sendJson } from "./http";
import { createScanJob, getScanJob, stats } from "./jobs/store";
import { ScanRequestError, validateScanRequest } from "./security";

const route = async (
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> => {
  const url = new URL(
    request.url || "/",
    `http://${request.headers.host || "localhost"}`,
  );

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, {
      ok: true,
      uptimeSeconds: Math.round(process.uptime()),
      jobs: stats(),
    });
    return;
  }

  if (url.pathname === "/scans" && request.method === "POST") {
    requireAuth(request);
    const body = await readJson(request);
    const { url: targetUrl, level } = await validateScanRequest(body);
    const job = createScanJob(targetUrl, level);
    sendJson(response, 202, job);
    return;
  }

  const jobMatch = url.pathname.match(/^\/scans\/([^/]+)$/);
  if (jobMatch && request.method === "GET") {
    requireAuth(request);
    const job = getScanJob(decodeURIComponent(jobMatch[1]));

    if (!job) {
      sendJson(response, 404, { error: "Scan job was not found." });
      return;
    }

    sendJson(response, 200, job);
    return;
  }

  sendJson(response, 404, { error: "Route not found." });
};

const server = http.createServer((request, response) => {
  void route(request, response).catch((error) => {
    const status =
      error instanceof HttpError || error instanceof ScanRequestError
        ? error.status
        : 500;
    const message =
      error instanceof Error ? error.message : "Scanner request failed.";
    sendJson(response, status, { error: message });
  });
});

validateConfig();

server.on("error", (error) => {
  console.error(
    error instanceof Error ? error.message : "Scanner server failed to start.",
  );
  process.exitCode = 1;
});

server.listen(config.port, config.host, () => {
  console.log(
    `Axiony scanner listening on http://${config.host}:${config.port} · concurrency ${config.concurrency}`,
  );
});

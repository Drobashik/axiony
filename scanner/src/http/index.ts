import type { IncomingMessage, ServerResponse } from "node:http";
import { config } from "../config";

export class HttpError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export const sendJson = (
  response: ServerResponse,
  status: number,
  body: unknown,
): void => {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store",
  });
  response.end(payload);
};

export const readJson = async (request: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new HttpError("Request body must be valid JSON.", 400);
  }
};

export const requireAuth = (request: IncomingMessage): void => {
  if (config.allowUnauthenticated) return;

  const header = request.headers.authorization;
  const expected = `Bearer ${config.apiKey}`;

  if (header !== expected) {
    throw new HttpError("Unauthorized scanner request.", 401);
  }
};

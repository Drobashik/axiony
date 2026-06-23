import { NextResponse } from "next/server";
import type { IssueStatus } from "@/lib/workspace/types";
import { getServerUserId } from "@/server/auth/session";
import { upsertUserIssueState } from "@/server/scan/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set<IssueStatus>(["open", "in-progress", "resolved", "ignored"]);

const clean = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export const PATCH = async (request: Request) => {
  const userId = await getServerUserId();

  if (!userId) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const host = clean(body?.host);
  const path = clean(body?.path) || "/";
  const issueKey = clean(body?.issueKey);
  const status = body?.status;
  const createdAtRaw = clean(body?.createdAt);
  const createdAt = createdAtRaw ? new Date(createdAtRaw) : undefined;

  if (!host || !issueKey || !STATUSES.has(status as IssueStatus)) {
    return NextResponse.json({ error: "Invalid issue status payload." }, { status: 400 });
  }

  if (createdAt && !Number.isFinite(createdAt.getTime())) {
    return NextResponse.json({ error: "createdAt must be a valid ISO date." }, { status: 400 });
  }

  const issueState = await upsertUserIssueState({
    userId,
    host,
    path,
    issueKey,
    status: status as IssueStatus,
    createdAt,
  });

  return NextResponse.json({ issueState });
};

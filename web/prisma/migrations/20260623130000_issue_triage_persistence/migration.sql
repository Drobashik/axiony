-- Persist per-user issue triage separately from immutable scan reports.
CREATE TABLE "UserIssueState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "issueKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserIssueState_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserIssueState_userId_host_path_issueKey_key" ON "UserIssueState"("userId", "host", "path", "issueKey");

CREATE INDEX "UserIssueState_userId_host_path_idx" ON "UserIssueState"("userId", "host", "path");

ALTER TABLE "UserIssueState" ADD CONSTRAINT "UserIssueState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

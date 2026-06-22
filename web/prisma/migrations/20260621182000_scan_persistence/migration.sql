-- CreateTable
CREATE TABLE "UserBilling" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "cycle" TEXT NOT NULL DEFAULT 'monthly',
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "renewalAt" TIMESTAMP(3),
    "checkoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserBilling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "url" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "lines" JSONB,
    "report" JSONB,
    "error" TEXT,
    "scannerJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ScanJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserScanReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scanJobId" TEXT,
    "url" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "counts" JSONB NOT NULL,
    "report" JSONB NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserScanReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserBilling_userId_key" ON "UserBilling"("userId");

-- CreateIndex
CREATE INDEX "ScanJob_userId_status_idx" ON "ScanJob"("userId", "status");

-- CreateIndex
CREATE INDEX "ScanJob_scannerJobId_idx" ON "ScanJob"("scannerJobId");

-- CreateIndex
CREATE INDEX "ScanJob_createdAt_idx" ON "ScanJob"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserScanReport_scanJobId_key" ON "UserScanReport"("scanJobId");

-- CreateIndex
CREATE INDEX "UserScanReport_userId_scannedAt_idx" ON "UserScanReport"("userId", "scannedAt");

-- CreateIndex
CREATE INDEX "UserScanReport_userId_host_path_idx" ON "UserScanReport"("userId", "host", "path");

-- AddForeignKey
ALTER TABLE "UserBilling" ADD CONSTRAINT "UserBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanJob" ADD CONSTRAINT "ScanJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScanReport" ADD CONSTRAINT "UserScanReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserScanReport" ADD CONSTRAINT "UserScanReport_scanJobId_fkey" FOREIGN KEY ("scanJobId") REFERENCES "ScanJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "maintenance_requests" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "isPending" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "maintenance_requests_approvedById_idx" ON "maintenance_requests"("approvedById");

-- CreateIndex
CREATE INDEX "maintenance_requests_isPending_idx" ON "maintenance_requests"("isPending");

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

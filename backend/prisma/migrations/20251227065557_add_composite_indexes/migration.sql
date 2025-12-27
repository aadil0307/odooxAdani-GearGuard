-- CreateIndex
CREATE INDEX "equipment_category_department_idx" ON "equipment"("category", "department");

-- CreateIndex
CREATE INDEX "equipment_isScrap_category_idx" ON "equipment"("isScrap", "category");

-- CreateIndex
CREATE INDEX "equipment_department_isScrap_idx" ON "equipment"("department", "isScrap");

-- CreateIndex
CREATE INDEX "equipment_createdAt_idx" ON "equipment"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_requests_status_requestType_idx" ON "maintenance_requests"("status", "requestType");

-- CreateIndex
CREATE INDEX "maintenance_requests_teamId_status_idx" ON "maintenance_requests"("teamId", "status");

-- CreateIndex
CREATE INDEX "maintenance_requests_assignedToId_status_idx" ON "maintenance_requests"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "maintenance_requests_equipmentId_status_idx" ON "maintenance_requests"("equipmentId", "status");

-- CreateIndex
CREATE INDEX "maintenance_requests_requestType_scheduledDate_idx" ON "maintenance_requests"("requestType", "scheduledDate");

-- CreateIndex
CREATE INDEX "maintenance_requests_status_createdAt_idx" ON "maintenance_requests"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "maintenance_requests_teamId_createdAt_idx" ON "maintenance_requests"("teamId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

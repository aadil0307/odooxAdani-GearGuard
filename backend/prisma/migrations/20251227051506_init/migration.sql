-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'TECHNICIAN', 'USER');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('CORRECTIVE', 'PREVENTIVE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('MECHANICAL', 'ELECTRICAL', 'HVAC', 'PLUMBING', 'IT_HARDWARE', 'VEHICLES', 'TOOLS', 'FACILITIES', 'OTHER');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('PRODUCTION', 'MAINTENANCE', 'WAREHOUSE', 'ADMINISTRATION', 'IT', 'HR', 'QUALITY_ASSURANCE', 'LOGISTICS', 'SALES', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "department" "Department" NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "warrantyExpiry" TIMESTAMP(3),
    "physicalLocation" TEXT NOT NULL,
    "isScrap" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "assignedEmployeeId" TEXT,
    "defaultTeamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_requests" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT,
    "requestType" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
    "scheduledDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationHours" DOUBLE PRECISION,
    "equipmentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TeamMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_serialNumber_key" ON "equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "equipment_serialNumber_idx" ON "equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "equipment_category_idx" ON "equipment"("category");

-- CreateIndex
CREATE INDEX "equipment_department_idx" ON "equipment"("department");

-- CreateIndex
CREATE INDEX "equipment_isScrap_idx" ON "equipment"("isScrap");

-- CreateIndex
CREATE INDEX "equipment_assignedEmployeeId_idx" ON "equipment"("assignedEmployeeId");

-- CreateIndex
CREATE INDEX "equipment_defaultTeamId_idx" ON "equipment"("defaultTeamId");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_teams_name_key" ON "maintenance_teams"("name");

-- CreateIndex
CREATE INDEX "maintenance_teams_name_idx" ON "maintenance_teams"("name");

-- CreateIndex
CREATE INDEX "maintenance_teams_isActive_idx" ON "maintenance_teams"("isActive");

-- CreateIndex
CREATE INDEX "maintenance_requests_equipmentId_idx" ON "maintenance_requests"("equipmentId");

-- CreateIndex
CREATE INDEX "maintenance_requests_teamId_idx" ON "maintenance_requests"("teamId");

-- CreateIndex
CREATE INDEX "maintenance_requests_assignedToId_idx" ON "maintenance_requests"("assignedToId");

-- CreateIndex
CREATE INDEX "maintenance_requests_createdById_idx" ON "maintenance_requests"("createdById");

-- CreateIndex
CREATE INDEX "maintenance_requests_status_idx" ON "maintenance_requests"("status");

-- CreateIndex
CREATE INDEX "maintenance_requests_requestType_idx" ON "maintenance_requests"("requestType");

-- CreateIndex
CREATE INDEX "maintenance_requests_scheduledDate_idx" ON "maintenance_requests"("scheduledDate");

-- CreateIndex
CREATE INDEX "maintenance_requests_createdAt_idx" ON "maintenance_requests"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_TeamMembers_AB_unique" ON "_TeamMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_TeamMembers_B_index" ON "_TeamMembers"("B");

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_defaultTeamId_fkey" FOREIGN KEY ("defaultTeamId") REFERENCES "maintenance_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "maintenance_teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamMembers" ADD CONSTRAINT "_TeamMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "maintenance_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamMembers" ADD CONSTRAINT "_TeamMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

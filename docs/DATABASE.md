# GearGuard Database Design

## Entity Relationship Diagram

```
┌──────────────────────┐
│        User          │
│──────────────────────│
│ id (PK)              │
│ email (unique)       │
│ password (hashed)    │
│ name                 │
│ role (enum)          │◄──────────┐
│ isActive             │           │
│ createdAt            │           │
│ updatedAt            │           │
└──────────┬───────────┘           │
           │                       │
           │ M:N                   │ 1:N (assignedTo)
           │                       │
┌──────────▼───────────┐           │
│  MaintenanceTeam     │           │
│──────────────────────│           │
│ id (PK)              │           │
│ name (unique)        │           │
│ description          │           │
│ isActive             │           │
│ createdAt            │           │
│ updatedAt            │           │
└──────────┬───────────┘           │
           │                       │
           │ 1:N (defaultTeam)     │
           │                       │
┌──────────▼───────────────────────┐
│       Equipment                  │
│──────────────────────────────────│
│ id (PK)                          │
│ name                             │
│ serialNumber (unique)            │
│ category (enum)                  │
│ department (enum)                │
│ purchaseDate                     │
│ warrantyExpiry                   │
│ physicalLocation                 │
│ isScrap                          │
│ notes                            │
│ assignedEmployeeId (FK) ─────────┘
│ defaultTeamId (FK)               │
│ createdAt                        │
│ updatedAt                        │
└──────────┬───────────────────────┘
           │
           │ 1:N
           │
┌──────────▼─────────────────┐
│   MaintenanceRequest       │
│────────────────────────────│
│ id (PK)                    │
│ subject                    │
│ description                │
│ requestType (enum)         │
│ status (enum)              │
│ scheduledDate              │
│ completedAt                │
│ durationHours              │
│ equipmentId (FK) ──────────┘
│ teamId (FK)                │
│ assignedToId (FK) ─────────┐
│ createdById (FK) ──────────┤
│ createdAt                  │
│ updatedAt                  │
└────────────────────────────┘
```

## Data Models

### 1. User

Represents system users with role-based access.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Primary key | CUID, unique |
| email | String | User email | Unique, indexed |
| password | String | Hashed password | Bcrypt hashed |
| name | String | Full name | Required |
| role | UserRole | Access level | ADMIN, MANAGER, TECHNICIAN, USER |
| isActive | Boolean | Account status | Default: true |
| createdAt | DateTime | Creation timestamp | Auto-generated |
| updatedAt | DateTime | Last update timestamp | Auto-updated |

**Relationships:**
- Many-to-many with `MaintenanceTeam` (team members)
- One-to-many with `MaintenanceRequest` (assigned technician)
- One-to-many with `MaintenanceRequest` (request creator)
- One-to-many with `Equipment` (assigned employee)

---

### 2. MaintenanceTeam

Groups of technicians specialized in specific equipment types.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Primary key | CUID, unique |
| name | String | Team name | Unique, indexed |
| description | String | Team purpose | Optional |
| isActive | Boolean | Team status | Default: true |
| createdAt | DateTime | Creation timestamp | Auto-generated |
| updatedAt | DateTime | Last update timestamp | Auto-updated |

**Relationships:**
- Many-to-many with `User` (team members)
- One-to-many with `Equipment` (default maintenance team)
- One-to-many with `MaintenanceRequest` (assigned team)

---

### 3. Equipment

Company assets requiring maintenance.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Primary key | CUID, unique |
| name | String | Equipment name | Required |
| serialNumber | String | Unique identifier | Unique, indexed |
| category | EquipmentCategory | Equipment type | Enum, indexed |
| department | Department | Owning department | Enum, indexed |
| purchaseDate | DateTime | Date purchased | Required |
| warrantyExpiry | DateTime | Warranty end date | Optional |
| physicalLocation | String | Where it's located | Required |
| isScrap | Boolean | Unusable flag | Default: false, indexed |
| notes | String | Additional info | Optional |
| assignedEmployeeId | String | Assigned user FK | Optional, indexed |
| defaultTeamId | String | Default team FK | Optional, indexed |
| createdAt | DateTime | Creation timestamp | Auto-generated |
| updatedAt | DateTime | Last update timestamp | Auto-updated |

**Relationships:**
- Many-to-one with `User` (assigned employee)
- Many-to-one with `MaintenanceTeam` (default team)
- One-to-many with `MaintenanceRequest` (maintenance history)

**Business Rules:**
- When `isScrap = true`, equipment cannot receive new requests
- `defaultTeamId` auto-fills when creating maintenance requests
- `serialNumber` must be unique across all equipment

---

### 4. MaintenanceRequest

Work orders for equipment maintenance.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| id | String | Primary key | CUID, unique |
| subject | String | Brief title | Required |
| description | String | Detailed info | Optional |
| requestType | RequestType | Corrective or Preventive | Enum, indexed |
| status | RequestStatus | Current state | Enum, default: NEW, indexed |
| scheduledDate | DateTime | When to perform | Optional for CORRECTIVE, indexed |
| completedAt | DateTime | When finished | Optional |
| durationHours | Float | Time spent | Optional |
| equipmentId | String | Equipment FK | Required, indexed |
| teamId | String | Assigned team FK | Required, indexed |
| assignedToId | String | Technician FK | Optional, indexed |
| createdById | String | Creator FK | Required, indexed |
| createdAt | DateTime | Creation timestamp | Auto-generated, indexed |
| updatedAt | DateTime | Last update timestamp | Auto-updated |

**Relationships:**
- Many-to-one with `Equipment` (what needs maintenance)
- Many-to-one with `MaintenanceTeam` (which team handles it)
- Many-to-one with `User` (assigned technician)
- Many-to-one with `User` (who created the request)

**Business Rules:**
- `requestType = PREVENTIVE` requires `scheduledDate`
- `status = REPAIRED` requires `completedAt` and `durationHours`
- Only technicians in the assigned team can be assigned
- Overdue when `scheduledDate < NOW()` AND `status != REPAIRED`

---

## Enums

### UserRole
```typescript
enum UserRole {
  ADMIN       // Full system access
  MANAGER     // Create preventive requests, assign technicians
  TECHNICIAN  // Work on assigned requests
  USER        // Create breakdown requests only
}
```

### RequestType
```typescript
enum RequestType {
  CORRECTIVE  // Unplanned breakdown/reactive maintenance
  PREVENTIVE  // Scheduled/planned maintenance
}
```

### RequestStatus
```typescript
enum RequestStatus {
  NEW          // Request created, not started
  IN_PROGRESS  // Technician working on it
  REPAIRED     // Work completed successfully
  SCRAP        // Equipment beyond repair
}
```

### EquipmentCategory
```typescript
enum EquipmentCategory {
  MECHANICAL
  ELECTRICAL
  HVAC
  PLUMBING
  IT_HARDWARE
  VEHICLES
  TOOLS
  FACILITIES
  OTHER
}
```

### Department
```typescript
enum Department {
  PRODUCTION
  MAINTENANCE
  WAREHOUSE
  ADMINISTRATION
  IT
  HR
  QUALITY_ASSURANCE
  LOGISTICS
  SALES
  OTHER
}
```

---

## Indexes

Optimized for common query patterns:

### User
- `email` (unique lookup for authentication)
- `role` (filtering by role type)

### Equipment
- `serialNumber` (unique lookup)
- `category` (filtering by type)
- `department` (filtering by department)
- `isScrap` (filtering out unusable equipment)
- `assignedEmployeeId` (finding user's equipment)
- `defaultTeamId` (team-based queries)

### MaintenanceTeam
- `name` (unique lookup)
- `isActive` (filtering active teams)

### MaintenanceRequest
- `equipmentId` (equipment history)
- `teamId` (team workload)
- `assignedToId` (technician tasks)
- `createdById` (user's requests)
- `status` (Kanban board columns)
- `requestType` (report filtering)
- `scheduledDate` (calendar view)
- `createdAt` (chronological sorting)

---

## Database Relationships

### Cascade Rules

**ON DELETE CASCADE:**
- `MaintenanceRequest.equipmentId` → If equipment deleted, delete all related requests

**ON DELETE RESTRICT:**
- `MaintenanceRequest.teamId` → Cannot delete team with active requests
- `MaintenanceRequest.createdById` → Cannot delete user who created requests

**ON DELETE SET NULL:**
- `Equipment.assignedEmployeeId` → If employee deleted, unassign equipment
- `Equipment.defaultTeamId` → If team deleted, remove default assignment
- `MaintenanceRequest.assignedToId` → If technician deleted, unassign request

---

## Data Validation Rules

### User
- Email must be valid format
- Password must be hashed with bcrypt (min 10 rounds)
- Name cannot be empty
- Role must be one of enum values

### Equipment
- Serial number must be unique
- Purchase date cannot be in future
- Warranty expiry must be after purchase date
- Physical location cannot be empty
- If isScrap = true, prevent new request creation

### MaintenanceRequest
- Subject required (min 5 chars)
- If requestType = PREVENTIVE, scheduledDate required
- If status = REPAIRED, completedAt and durationHours required
- assignedTo must be member of assigned team
- Cannot assign request to scrapped equipment
- Duration hours must be positive

---

## Migration Strategy

### Initial Setup
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Apply migration
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### Future Migrations
```bash
# Create new migration
npx prisma migrate dev --name <migration-name>

# Production deployment
npx prisma migrate deploy
```

---

## Seed Data

The seed script creates:

**Users:**
- 1 Admin
- 2 Managers
- 5 Technicians (2 mechanical, 2 electrical, 1 IT)
- 2 Regular users

**Teams:**
- Mechanical Team
- Electrical Team
- IT Support Team
- Facilities Team

**Equipment:**
- 8 equipment items across various categories
- 1 scrapped equipment (for testing)

**Maintenance Requests:**
- 9 requests with various statuses
- Mix of corrective and preventive
- Some overdue, some upcoming
- Demonstrates full workflow

**Test Credentials:**
- All users have password: `password123`
- Email format: `<role>@gearguard.com`

---

## Performance Considerations

### Query Optimization
- Use `include` for eager loading relationships
- Avoid N+1 queries with `select` and `include`
- Paginate large result sets
- Use database indexes for common filters

### Connection Pooling
```typescript
// Prisma Client with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

### Best Practices
- Always use transactions for multi-step operations
- Validate data before database operations
- Use soft deletes for audit trails
- Implement proper error handling
- Log all data modifications

---

## Security Considerations

### Password Security
- Use bcrypt with 10+ rounds
- Never store plain text passwords
- Implement password strength validation

### Data Access
- Filter queries by user role
- Team-based isolation for technicians
- Validate all foreign key relationships
- Prevent SQL injection via Prisma

### Audit Trail
- Track createdAt and updatedAt timestamps
- Store createdById for accountability
- Log all status changes
- Maintain request history

---

## Backup & Recovery

### Automated Backups
- Daily full backups
- Point-in-time recovery enabled
- 30-day retention period

### Manual Backup
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Import database
psql $DATABASE_URL < backup.sql
```

---

## Next Steps

✅ Schema designed  
✅ Seed data created  
→ **Phase 3**: Implement backend APIs  
→ **Phase 4**: Build frontend  
→ **Phase 5**: Deploy to production

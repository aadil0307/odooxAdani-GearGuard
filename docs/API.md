# GearGuard Backend API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER" // Optional: ADMIN, MANAGER, TECHNICIAN, USER
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "isActive": true,
      "createdAt": "2024-12-27T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "admin@gearguard.com",
  "password": "password123"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

### Change Password
```http
POST /auth/change-password
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## 🔧 Equipment Endpoints

### List All Equipment
```http
GET /equipment
Authorization: Bearer <token>

Query Parameters:
- category: MECHANICAL | ELECTRICAL | HVAC | PLUMBING | IT_HARDWARE | VEHICLES | TOOLS | FACILITIES | OTHER
- department: PRODUCTION | MAINTENANCE | WAREHOUSE | ADMINISTRATION | IT | HR | QUALITY_ASSURANCE | LOGISTICS | SALES | OTHER
- assignedEmployeeId: string
- isScrap: boolean
- search: string (searches name, serial number, location)
- page: number (default: 1)
- limit: number (default: 10)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "equipment": [
      {
        "id": "clx...",
        "name": "CNC Milling Machine",
        "serialNumber": "CNC-2024-001",
        "category": "MECHANICAL",
        "department": "PRODUCTION",
        "purchaseDate": "2023-01-15T00:00:00.000Z",
        "warrantyExpiry": "2025-01-15T00:00:00.000Z",
        "physicalLocation": "Production Floor - Bay A1",
        "isScrap": false,
        "assignedEmployee": {
          "id": "clx...",
          "name": "Bob Employee",
          "email": "user1@gearguard.com"
        },
        "defaultTeam": {
          "id": "clx...",
          "name": "Mechanical Team"
        },
        "_count": {
          "maintenanceRequests": 5
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

### Get Equipment by ID
```http
GET /equipment/:id
Authorization: Bearer <token>
```

### Get Equipment Maintenance History
```http
GET /equipment/:id/maintenance-history
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "equipment": {
      "id": "clx...",
      "name": "CNC Milling Machine",
      "serialNumber": "CNC-2024-001",
      "category": "MECHANICAL"
    },
    "requests": [...],
    "stats": {
      "total": 5,
      "corrective": 3,
      "preventive": 2,
      "repaired": 4,
      "active": 1
    }
  }
}
```

### Create Equipment
```http
POST /equipment
Authorization: Bearer <token>
Role: MANAGER or ADMIN
```

**Body:**
```json
{
  "name": "New Machine",
  "serialNumber": "MCH-2024-999",
  "category": "MECHANICAL",
  "department": "PRODUCTION",
  "purchaseDate": "2024-12-27T00:00:00.000Z",
  "warrantyExpiry": "2027-12-27T00:00:00.000Z",
  "physicalLocation": "Floor 2 - Bay C",
  "assignedEmployeeId": "clx...", // Optional
  "defaultTeamId": "clx...", // Optional
  "notes": "Important notes" // Optional
}
```

### Update Equipment
```http
PUT /equipment/:id
Authorization: Bearer <token>
Role: MANAGER or ADMIN
```

### Mark Equipment as Scrap
```http
PATCH /equipment/:id/scrap
Authorization: Bearer <token>
Role: MANAGER or ADMIN
```

### Delete Equipment
```http
DELETE /equipment/:id
Authorization: Bearer <token>
Role: ADMIN only
```

---

## 👥 Team Endpoints

### List All Teams
```http
GET /teams
Authorization: Bearer <token>

Query Parameters:
- isActive: boolean
- search: string
```

### Get Team by ID
```http
GET /teams/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "Mechanical Team",
    "description": "Handles all mechanical equipment",
    "isActive": true,
    "members": [
      {
        "id": "clx...",
        "name": "Mike Mechanic",
        "email": "tech.mech1@gearguard.com",
        "role": "TECHNICIAN",
        "isActive": true
      }
    ],
    "maintenanceRequests": [...],
    "defaultForEquipment": [...]
  }
}
```

### Create Team
```http
POST /teams
Authorization: Bearer <token>
Role: MANAGER or ADMIN
```

**Body:**
```json
{
  "name": "New Team",
  "description": "Team description",
  "memberIds": ["user-id-1", "user-id-2"] // Optional
}
```

### Update Team
```http
PUT /teams/:id
Authorization: Bearer <token>
Role: MANAGER or ADMIN
```

### Delete Team
```http
DELETE /teams/:id
Authorization: Bearer <token>
Role: MANAGER or ADMIN
```

### Add Member to Team
```http
POST /teams/:id/members
Authorization: Bearer <token>
Role: MANAGER or ADMIN
```

**Body:**
```json
{
  "userId": "clx..."
}
```

### Remove Member from Team
```http
DELETE /teams/:id/members/:userId
Authorization: Bearer <token>
Role: MANAGER or ADMIN
```

---

## 🔨 Maintenance Request Endpoints

### List All Requests
```http
GET /requests
Authorization: Bearer <token>

Query Parameters:
- status: NEW | IN_PROGRESS | REPAIRED | SCRAP
- requestType: CORRECTIVE | PREVENTIVE
- equipmentId: string
- teamId: string
- assignedToId: string
- createdById: string
- search: string
- page: number (default: 1)
- limit: number (default: 20)
```

**Access Control:**
- **USER**: Only sees their own created requests
- **TECHNICIAN**: Sees requests for their teams or assigned to them
- **MANAGER/ADMIN**: Sees all requests

### Get Request by ID
```http
GET /requests/:id
Authorization: Bearer <token>
```

### Get Calendar Requests (Preventive Only)
```http
GET /requests/calendar
Authorization: Bearer <token>

Query Parameters:
- startDate: ISO date string (required)
- endDate: ISO date string (required)
```

### Get Overdue Requests
```http
GET /requests/overdue
Authorization: Bearer <token>
```

Returns requests where `scheduledDate < now` AND `status != REPAIRED/SCRAP`

### Create Maintenance Request
```http
POST /requests
Authorization: Bearer <token>
```

**Body:**
```json
{
  "subject": "CNC Machine - Unusual Noise",
  "description": "Machine making grinding noise during operation",
  "requestType": "CORRECTIVE", // or "PREVENTIVE"
  "equipmentId": "clx...",
  "scheduledDate": "2025-01-15T10:00:00.000Z", // Required for PREVENTIVE
  "teamId": "clx...", // Optional - auto-filled from equipment
  "assignedToId": "clx..." // Optional
}
```

**Business Rules:**
- Equipment's `defaultTeamId` auto-fills if `teamId` not provided
- Cannot create request for scrapped equipment
- PREVENTIVE requests require `scheduledDate`
- Only MANAGER/ADMIN can create PREVENTIVE requests
- Assigned technician must be member of the team

### Update Request
```http
PUT /requests/:id
Authorization: Bearer <token>
```

**Permissions:** MANAGER/ADMIN or assigned technician

**Body:**
```json
{
  "subject": "Updated subject",
  "description": "Updated description",
  "scheduledDate": "2025-01-20T10:00:00.000Z",
  "assignedToId": "clx...",
  "durationHours": 2.5
}
```

### Update Request Status
```http
PATCH /requests/:id/status
Authorization: Bearer <token>
```

**Permissions:** MANAGER/ADMIN or assigned technician

**Body:**
```json
{
  "status": "IN_PROGRESS", // NEW | IN_PROGRESS | REPAIRED | SCRAP
  "durationHours": 2.5 // Required when marking as REPAIRED
}
```

**Workflow Transitions:**
```
NEW → IN_PROGRESS
NEW → SCRAP
IN_PROGRESS → REPAIRED
IN_PROGRESS → SCRAP
```

**Business Rules:**
- Marking as REPAIRED requires `durationHours` and `assignedToId`
- Marking as SCRAP also marks the equipment as scrap
- Moving to IN_PROGRESS auto-assigns current user if not assigned

### Assign Technician
```http
PATCH /requests/:id/assign
Authorization: Bearer <token>
Role: MANAGER or ADMIN
```

**Body:**
```json
{
  "technicianId": "clx..."
}
```

**Business Rules:**
- Technician must be member of the request's team
- Auto-transitions status from NEW to IN_PROGRESS

---

## 📊 Report Endpoints

### Get Dashboard Statistics
```http
GET /reports/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": {
      "total": 50,
      "new": 10,
      "inProgress": 15,
      "repaired": 20,
      "overdue": 5,
      "recentlyCreated": 8
    },
    "equipment": {
      "total": 25,
      "scrap": 2,
      "active": 23
    },
    "teams": {
      "total": 4
    },
    "myTasks": {
      "active": 3
    }
  }
}
```

### Requests by Team
```http
GET /reports/by-team
Authorization: Bearer <token>

Query Parameters:
- startDate: ISO date (optional)
- endDate: ISO date (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "teamId": "clx...",
        "teamName": "Mechanical Team",
        "totalRequests": 25,
        "statusBreakdown": {
          "NEW": 5,
          "IN_PROGRESS": 8,
          "REPAIRED": 10,
          "SCRAP": 2
        }
      }
    ],
    "total": 50
  }
}
```

### Requests by Equipment Category
```http
GET /reports/by-category
Authorization: Bearer <token>

Query Parameters:
- startDate: ISO date (optional)
- endDate: ISO date (optional)
```

### Requests by Status
```http
GET /reports/by-status
Authorization: Bearer <token>

Query Parameters:
- startDate: ISO date (optional)
- endDate: ISO date (optional)
```

### Duration Analysis
```http
GET /reports/duration
Authorization: Bearer <token>

Query Parameters:
- startDate: ISO date (optional)
- endDate: ISO date (optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalRequests": 20,
      "totalHours": 45.5,
      "averageHours": 2.28,
      "minHours": 0.5,
      "maxHours": 5.0
    },
    "byType": {
      "CORRECTIVE": {
        "count": 12,
        "totalHours": 30.0,
        "averageHours": 2.5
      },
      "PREVENTIVE": {
        "count": 8,
        "totalHours": 15.5,
        "averageHours": 1.94
      }
    },
    "byCategory": {...},
    "byTeam": [...]
  }
}
```

---

## 🔄 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional validation details
  }
}
```

### Common Error Codes:
- `VALIDATION_ERROR` (400) - Invalid input data
- `UNAUTHORIZED` (401) - Missing or invalid token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Resource not found
- `CONFLICT` (409) - Duplicate entry
- `INTERNAL_SERVER_ERROR` (500) - Server error

---

## 🧪 Testing with Sample Data

After running `npx prisma db seed`, you can test with these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gearguard.com | password123 |
| Manager | manager1@gearguard.com | password123 |
| Technician | tech.mech1@gearguard.com | password123 |
| User | user1@gearguard.com | password123 |

### Example Flow:

1. **Login as Admin:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gearguard.com","password":"password123"}'
```

2. **List Equipment:**
```bash
curl http://localhost:5000/api/v1/equipment \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Create Maintenance Request:**
```bash
curl -X POST http://localhost:5000/api/v1/requests \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Request",
    "requestType": "CORRECTIVE",
    "equipmentId": "EQUIPMENT_ID"
  }'
```

4. **Get Dashboard Stats:**
```bash
curl http://localhost:5000/api/v1/reports/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📝 Notes

- All dates are in ISO 8601 format
- Pagination defaults: page=1, limit=10 (equipment) or 20 (requests)
- Role-based access is automatically applied to all endpoints
- Equipment marked as scrap cannot receive new maintenance requests
- Preventive maintenance requests appear in the calendar view
- Overdue requests are highlighted when `scheduledDate < now` AND not completed

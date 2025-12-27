# 🚀 GearGuard Backend - Quick Start Guide

## Prerequisites
- Node.js >= 18.0.0
- PostgreSQL database (Railway or local)
- npm >= 9.0.0

---

## 📦 Installation

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup Environment Variables
The `.env` file has already been created with your Railway PostgreSQL connection. Verify it contains:

```env
NODE_ENV=development
PORT=5000
API_VERSION=v1
DATABASE_URL="postgresql://postgres:SBhpjsvuBWYLaibjtpRVZtGAAEdFIkpl@nozomi.proxy.rlwy.net:56898/railway"
JWT_SECRET=your-super-secret-jwt-key-change-in-production-gearguard-2024
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=debug
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Run Database Migrations
```bash
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Apply the schema to your Railway PostgreSQL database
- Generate TypeScript types

### Step 5: Seed the Database
```bash
npx prisma db seed
```

This creates:
- 10 users (1 admin, 2 managers, 5 technicians, 2 users)
- 4 maintenance teams
- 8 equipment items (1 scrapped)
- 9 maintenance requests (various statuses)

---

## 🎯 Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

Server will start on `http://localhost:5000`

You should see:
```
🚀 GearGuard Backend Server Started
=====================================
📡 Server running on: http://localhost:5000
🌐 Environment: development
📦 API Version: v1
🔗 API Base URL: http://localhost:5000/api/v1
❤️  Health Check: http://localhost:5000/api/v1/health
=====================================
```

### Production Mode
```bash
npm run build
npm start
```

---

## ✅ Verify Installation

### 1. Check Health Endpoint
```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "GearGuard API is running",
  "timestamp": "2024-12-27T...",
  "version": "1.0.0"
}
```

### 2. Test Authentication
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gearguard.com","password":"password123"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "admin@gearguard.com",
      "name": "Admin User",
      "role": "ADMIN",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

Save the token for authenticated requests!

### 3. Test Equipment API
```bash
# Replace YOUR_TOKEN with the token from step 2
curl http://localhost:5000/api/v1/equipment \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Test Credentials

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | admin@gearguard.com | password123 | Full system access |
| **Manager** | manager1@gearguard.com | password123 | Create preventive requests, assign technicians |
| **Manager** | manager2@gearguard.com | password123 | Create preventive requests, assign technicians |
| **Technician** | tech.mech1@gearguard.com | password123 | Work on assigned requests (Mechanical Team) |
| **Technician** | tech.elec1@gearguard.com | password123 | Work on assigned requests (Electrical Team) |
| **Technician** | tech.it@gearguard.com | password123 | Work on assigned requests (IT Team) |
| **User** | user1@gearguard.com | password123 | Create breakdown requests only |
| **User** | user2@gearguard.com | password123 | Create breakdown requests only |

---

## 📊 Database Management

### View Database in Prisma Studio
```bash
npx prisma studio
```

Opens at `http://localhost:5555` - Visual database browser

### Reset Database (careful!)
```bash
npx prisma migrate reset
```

This will:
- Drop all tables
- Re-run migrations
- Re-seed data

### Create New Migration
```bash
npx prisma migrate dev --name <migration-name>
```

---

## 🛠️ Common Tasks

### Check Database Connection
```bash
npx prisma db pull
```

### Format Prisma Schema
```bash
npx prisma format
```

### Validate Schema
```bash
npx prisma validate
```

---

## 📝 Available Scripts

```json
{
  "dev": "Start development server with auto-reload",
  "build": "Compile TypeScript to JavaScript",
  "start": "Run production server",
  "prisma:generate": "Generate Prisma Client",
  "prisma:migrate": "Run migrations",
  "prisma:deploy": "Deploy migrations (production)",
  "prisma:seed": "Seed database",
  "prisma:studio": "Open Prisma Studio",
  "db:push": "Push schema without migration",
  "db:seed": "Seed database"
}
```

---

## 🔍 Project Structure

```
backend/
├── src/
│   ├── index.ts                    # Server entry point
│   ├── config/
│   │   ├── database.ts             # Prisma client
│   │   └── constants.ts            # App constants
│   ├── controllers/                # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── equipment.controller.ts
│   │   ├── team.controller.ts
│   │   ├── request.controller.ts
│   │   └── report.controller.ts
│   ├── services/                   # Business logic
│   │   ├── auth.service.ts
│   │   ├── equipment.service.ts
│   │   ├── team.service.ts
│   │   ├── request.service.ts
│   │   └── report.service.ts
│   ├── routes/                     # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── equipment.routes.ts
│   │   ├── team.routes.ts
│   │   ├── request.routes.ts
│   │   └── report.routes.ts
│   ├── middleware/                 # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── logger.middleware.ts
│   ├── utils/                      # Helper functions
│   │   ├── errors.ts
│   │   ├── response.ts
│   │   ├── jwt.ts
│   │   └── password.ts
│   └── types/                      # TypeScript types
│       └── express.d.ts
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Seed data
├── .env                            # Environment variables
├── package.json
└── tsconfig.json
```

---

## 🎯 Example API Workflows

### Workflow 1: Create and Complete a Breakdown Request

1. **Login as User:**
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@gearguard.com","password":"password123"}' \
  | jq -r '.data.token')
```

2. **Create Breakdown Request:**
```bash
curl -X POST http://localhost:5000/api/v1/requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Machine Not Starting",
    "description": "CNC machine fails to power on",
    "requestType": "CORRECTIVE",
    "equipmentId": "USE_EQUIPMENT_ID_FROM_SEED"
  }'
```

3. **Login as Technician:**
```bash
TECH_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tech.mech1@gearguard.com","password":"password123"}' \
  | jq -r '.data.token')
```

4. **Update Status to In Progress:**
```bash
curl -X PATCH http://localhost:5000/api/v1/requests/REQUEST_ID/status \
  -H "Authorization: Bearer $TECH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_PROGRESS"}'
```

5. **Mark as Repaired:**
```bash
curl -X PATCH http://localhost:5000/api/v1/requests/REQUEST_ID/status \
  -H "Authorization: Bearer $TECH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REPAIRED",
    "durationHours": 2.5
  }'
```

### Workflow 2: Schedule Preventive Maintenance

1. **Login as Manager:**
```bash
MGR_TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager1@gearguard.com","password":"password123"}' \
  | jq -r '.data.token')
```

2. **Create Preventive Request:**
```bash
curl -X POST http://localhost:5000/api/v1/requests \
  -H "Authorization: Bearer $MGR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Monthly HVAC Inspection",
    "description": "Regular monthly maintenance check",
    "requestType": "PREVENTIVE",
    "equipmentId": "USE_HVAC_EQUIPMENT_ID",
    "scheduledDate": "2025-01-15T09:00:00.000Z",
    "assignedToId": "TECHNICIAN_ID"
  }'
```

3. **View Calendar:**
```bash
curl "http://localhost:5000/api/v1/requests/calendar?startDate=2025-01-01T00:00:00.000Z&endDate=2025-01-31T23:59:59.999Z" \
  -H "Authorization: Bearer $MGR_TOKEN"
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: P1001: Can't reach database server
```
**Solution:** Check your DATABASE_URL in `.env` is correct and Railway database is accessible.

### Prisma Client Not Generated
```
Error: Cannot find module '@prisma/client'
```
**Solution:** Run `npx prisma generate`

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in `.env` or kill process on port 5000:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Migration Failed
```
Error: Migration failed
```
**Solution:** Reset database and try again:
```bash
npx prisma migrate reset
```

---

## 📚 Next Steps

1. ✅ **Backend Complete** - All APIs are functional
2. 🔜 **Frontend Development** - Build Next.js UI
3. 🔜 **Testing** - Add integration tests
4. 🔜 **Deployment** - Deploy to Railway + Vercel

---

## 📖 Documentation

- [API Documentation](./API.md) - Complete API reference
- [Architecture](./ARCHITECTURE.md) - System design
- [Database](./DATABASE.md) - Schema and relationships
- [Progress Tracker](./PROGRESS.md) - Development roadmap

---

## 🎉 Success!

If you've completed all steps, your GearGuard backend is now running with:
- ✅ Authentication & RBAC
- ✅ Equipment Management
- ✅ Team Management
- ✅ Maintenance Request Workflows
- ✅ Reporting & Analytics
- ✅ Complete seed data for testing

**Ready to build the frontend!** 🚀

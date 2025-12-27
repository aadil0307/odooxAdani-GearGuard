# 🛠️ GearGuard CMMS

**GearGuard** is a comprehensive Computerized Maintenance Management System (CMMS) designed to streamline equipment maintenance, work order management, and team coordination in industrial and enterprise environments.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [User Roles & Permissions](#-user-roles--permissions)
- [Database Schema](#-database-schema)
- [Features in Detail](#-features-in-detail)
- [Development](#-development)
- [Deployment](#-deployment)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure Authentication** with JWT tokens and NextAuth.js
- **Role-Based Access Control (RBAC)** with 4 user roles:
  - 👑 **Admin**: Full system access
  - 👨‍💼 **Manager**: Team and request management
  - 🔧 **Technician**: Assigned maintenance tasks
  - 👤 **User**: Request submission
- **Session Management** with secure cookie handling
- **Password Hashing** using bcrypt

### 🏭 Equipment Management
- **Complete Equipment Lifecycle Tracking**
  - Equipment creation, editing, and deletion
  - Serial number tracking and categorization
  - Department assignment and location tracking
  - Purchase date and warranty expiry management
- **Equipment Categories**: Mechanical, Electrical, HVAC, Plumbing, IT Hardware, Vehicles, Tools, Facilities
- **Status Monitoring**: Active, Under Maintenance, Scrapped
- **Equipment Details View** with:
  - Uptime percentage calculation
  - Maintenance history timeline
  - Active and completed request counts
  - Visual status indicators
- **Search & Filter** by category, department, and status
- **Scrap Management** for end-of-life equipment

### 🎫 Maintenance Request Management
- **Multi-View Request Interface**:
  - 📋 **List View**: Paginated table with filtering
  - 📅 **Calendar View**: FullCalendar integration with drag-and-drop scheduling
  - 🗂️ **Kanban Board**: Drag-and-drop status management
- **Request Types**:
  - ⚠️ **Corrective**: Breakdown/reactive maintenance
  - 🔄 **Preventive**: Scheduled/planned maintenance
- **Status Workflow**:
  - 🆕 NEW → ⏳ IN_PROGRESS → ✅ REPAIRED → 🗑️ SCRAP
- **Request Features**:
  - Priority assignment
  - Scheduled date management
  - Team and technician assignment
  - Duration tracking (repair time in hours)
  - Equipment association
  - Detailed descriptions and notes
- **Approval Workflow**:
  - User-created requests require manager approval
  - Managers assign team and technician during approval
  - Reject functionality to decline requests

### 👥 Team Management
- **Team Creation & Management**
  - Create maintenance teams with descriptions
  - Activate/deactivate teams
  - View team member rosters
- **Member Management**
  - Add/remove team members
  - View assigned equipment and requests per team
- **Team Assignment**
  - Default team assignment for equipment
  - Request assignment to specific teams
  - Team-based workload distribution

### 👤 User Management
- **User CRUD Operations**
  - Create, read, update, and delete users
  - Role assignment and modification
  - Account activation/deactivation
- **User Profiles** with:
  - Contact information
  - Role designation
  - Team membership
  - Activity tracking
- **Search & Filter** by role, status, and name

### 📊 Reports & Analytics
- **Dashboard Statistics**:
  - Total requests by status
  - Pending approvals count
  - Team workload distribution
  - Equipment utilization metrics
- **Visual Analytics**:
  - 📈 **Bar Charts**: Requests by team
  - 🥧 **Pie Charts**: Requests by category
  - 📊 **Status Distribution**: Request status breakdown
  - ⏱️ **Duration Analysis**: Average repair times
- **Detailed Breakdowns**:
  - Requests by maintenance team
  - Requests by equipment category
  - Requests by status
  - Duration analysis with averages

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Intuitive Navigation**: Sidebar with role-based menu items
- **Interactive Components**:
  - Drag-and-drop interfaces (Kanban, Calendar)
  - Modal dialogs for confirmations
  - Toast notifications for actions
  - Loading states and error handling
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### 🔍 Advanced Features
- **Real-time Updates**: React Query for automatic data synchronization
- **Optimistic Updates**: Instant UI feedback
- **Pagination**: Server-side pagination for large datasets
- **Search & Filter**: Advanced filtering across all modules
- **Data Validation**: Zod schema validation on frontend and backend
- **Error Handling**: Comprehensive error messages and recovery
- **Performance Optimization**: 
  - Indexed database queries
  - Memoized calculations
  - Code splitting and lazy loading
  - Debounced search inputs

---

## 🚀 Tech Stack

### Frontend
- **Framework**: [Next.js 16.1](https://nextjs.org/) (App Router, React Server Components)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **UI Framework**: [React 19.2](https://react.dev/)
- **Styling**: [TailwindCSS 4.0](https://tailwindcss.com/)
- **State Management**: 
  - [TanStack Query (React Query) 5.90](https://tanstack.com/query) - Server state management
  - React Hooks - Component state
- **Authentication**: [NextAuth.js 4.24](https://next-auth.js.org/)
- **Form Validation**: [Zod 4.2](https://zod.dev/)
- **HTTP Client**: [Axios 1.13](https://axios-http.com/)
- **Drag & Drop**: [@dnd-kit 6.3](https://dndkit.com/)
- **Calendar**: [FullCalendar 6.1](https://fullcalendar.io/)
- **Charts**: [Recharts 3.6](https://recharts.org/)
- **Icons**: [Lucide React 0.562](https://lucide.dev/)
- **Date Utilities**: [date-fns 4.1](https://date-fns.org/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js 4.21](https://expressjs.com/)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/)
- **Database ORM**: [Prisma 5.22](https://www.prisma.io/)
- **Database**: [PostgreSQL 15](https://www.postgresql.org/)
- **Authentication**: 
  - [JWT (jsonwebtoken) 9.0](https://github.com/auth0/node-jsonwebtoken)
  - [bcryptjs 2.4](https://github.com/dcodeIO/bcrypt.js)
- **Validation**: 
  - [Zod 3.23](https://zod.dev/)
  - [express-validator 7.2](https://express-validator.github.io/)
- **Security**: [CORS 2.8](https://github.com/expressjs/cors)
- **Environment**: [dotenv 16.4](https://github.com/motdotla/dotenv)

### Development Tools
- **Package Manager**: npm
- **Code Quality**: ESLint
- **Code Formatting**: Prettier
- **Version Control**: Git
- **API Testing**: Thunder Client / Postman
- **Database Management**: Prisma Studio

### Deployment
- **Frontend**: Vercel (recommended) / Netlify
- **Backend**: Railway / Heroku / AWS
- **Database**: Railway PostgreSQL / AWS RDS / Supabase

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Browser   │  │   Mobile   │  │   Tablet   │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        └────────────────┴────────────────┘                  │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                    HTTPS/WSS
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                  FRONTEND (Next.js)                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  App Router (Pages & Layouts)                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │  │
│  │  │Dashboard │  │ Requests │  │Equipment │            │  │
│  │  └──────────┘  └──────────┘  └──────────┘            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  State Management (React Query)                       │  │
│  │  - Query Caching   - Optimistic Updates              │  │
│  │  - Auto Refetch    - Background Sync                 │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Authentication (NextAuth.js)                         │  │
│  │  - JWT Session     - Credential Provider             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────┘
                          │
                    REST API (JSON)
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                  BACKEND (Express.js)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Routes & Controllers                             │  │
│  │  /api/v1/auth    /api/v1/requests    /api/v1/users   │  │
│  │  /api/v1/equipment    /api/v1/teams    /api/v1/reports│  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                     │  │
│  │  - Authentication  - Authorization  - Validation      │  │
│  │  - Error Handling  - CORS          - Logging         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Service Layer (Business Logic)                       │  │
│  │  - Request Management  - User Management              │  │
│  │  - Equipment Tracking  - Team Coordination            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Data Access Layer (Prisma ORM)                       │  │
│  │  - Query Building  - Transactions  - Migrations       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────┘
                          │
                     Prisma Client
                          │
┌─────────────────────────┼────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Users    │  │ Equipment  │  │  Requests  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐                            │
│  │   Teams    │  │   Indexes  │                            │
│  └────────────┘  └────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow Example

```
User Action (Click "Create Request")
         ↓
Frontend Form Validation (Zod)
         ↓
React Query Mutation
         ↓
Axios HTTP POST to /api/v1/requests
         ↓
Backend Authentication Middleware
         ↓
Request Validation (express-validator)
         ↓
Service Layer (createRequest)
         ↓
Prisma ORM (Database Insert)
         ↓
PostgreSQL Transaction
         ↓
Response to Frontend
         ↓
React Query Cache Update
         ↓
UI Re-render with New Data
```

---

## 🎯 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** or **yarn**
- **PostgreSQL** >= 15.0
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gearguard.git
cd gearguard
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env` file:**

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/gearguard?schema=public"

# JWT Secret (use a strong random string)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

**Initialize Database:**

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database with sample data (optional)
npm run db:seed
```

**Start Backend Server:**

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

#### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

**Configure `.env.local` file:**

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret-key-change-this-in-production"
```

**Start Frontend Server:**

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

#### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api/v1`
- **Prisma Studio** (Database GUI): Run `npm run prisma:studio` in backend folder

### Default Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gearguard.com | admin123 |
| Manager | manager@gearguard.com | manager123 |
| Technician | tech@gearguard.com | tech123 |
| User | user@gearguard.com | user123 |



---

## 📁 Project Structure

```
gearguard/
├── backend/                      # Express.js Backend
│   ├── prisma/
│   │   ├── migrations/          # Database migrations
│   │   ├── schema.prisma        # Database schema
│   │   └── seed.ts              # Database seeding script
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── equipment.controller.ts
│   │   │   ├── request.controller.ts
│   │   │   ├── team.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   └── report.controller.ts
│   │   ├── services/            # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── equipment.service.ts
│   │   │   ├── request.service.ts
│   │   │   ├── team.service.ts
│   │   │   ├── user.service.ts
│   │   │   └── report.service.ts
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── routes/              # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── equipment.routes.ts
│   │   │   ├── request.routes.ts
│   │   │   ├── team.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── report.routes.ts
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utility functions
│   │   └── index.ts             # Server entry point
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                    # Next.js Frontend
│   ├── app/
│   │   ├── (auth)/             # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/        # Protected dashboard pages
│   │   │   ├── dashboard/
│   │   │   ├── requests/
│   │   │   │   ├── page.tsx              # List view
│   │   │   │   ├── kanban/               # Kanban board
│   │   │   │   ├── calendar/             # Calendar view
│   │   │   │   ├── pending/              # Pending approvals
│   │   │   │   ├── new/                  # Create request
│   │   │   │   ├── [id]/                 # Request details
│   │   │   │   └── [id]/edit/            # Edit request
│   │   │   ├── equipment/
│   │   │   │   ├── page.tsx              # Equipment list
│   │   │   │   ├── [id]/                 # Equipment details
│   │   │   │   └── [id]/edit/            # Edit equipment
│   │   │   ├── teams/
│   │   │   │   ├── page.tsx              # Teams list
│   │   │   │   ├── new/                  # Create team
│   │   │   │   ├── [id]/                 # Team details
│   │   │   │   └── [id]/edit/            # Edit team
│   │   │   ├── users/
│   │   │   │   └── page.tsx              # User management
│   │   │   └── reports/
│   │   │       └── page.tsx              # Analytics & reports
│   │   ├── api/                # API route handlers
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── features/           # Feature-specific components
│   │   │   ├── kanban-column.tsx
│   │   │   ├── request-card.tsx
│   │   │   ├── equipment-form.tsx
│   │   │   └── ...
│   │   └── layout/             # Layout components
│   │       ├── sidebar.tsx
│   │       ├── navbar.tsx
│   │       └── dashboard-layout.tsx
│   ├── lib/
│   │   ├── api-client.ts       # Axios configuration
│   │   ├── utils.ts            # Utility functions
│   │   └── auth-options.ts     # NextAuth configuration
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── .env.local              # Environment variables
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Documentation
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer {token}
```

### Equipment Endpoints

#### Get All Equipment
```http
GET /equipment
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string
- category: EquipmentCategory
- department: Department
- isScrap: boolean
```

#### Create Equipment
```http
POST /equipment
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "CNC Machine 01",
  "serialNumber": "CNC-2024-001",
  "category": "MECHANICAL",
  "department": "PRODUCTION",
  "physicalLocation": "Building A, Floor 2",
  "purchaseDate": "2024-01-15",
  "warrantyExpiry": "2026-01-15",
  "notes": "High-precision CNC machine"
}
```

### Request Endpoints

#### Get All Requests
```http
GET /requests
Authorization: Bearer {token}

Query Parameters:
- page, limit, status, type, equipmentId, teamId
- assignedToId, createdById, isPending
- startDate, endDate
```

#### Create Request
```http
POST /requests
Authorization: Bearer {token}
Content-Type: application/json

{
  "subject": "Machine not starting",
  "description": "CNC machine shows error code E404",
  "equipmentId": "equipment_id",
  "type": "CORRECTIVE",
  "scheduledDate": "2024-12-28T10:00:00Z",
  "teamId": "team_id"
}
```

#### Update Request Status
```http
PATCH /requests/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "REPAIRED",
  "durationHours": 2.5
}
```

#### Approve Request
```http
POST /requests/:id/approve
Authorization: Bearer {token}
Content-Type: application/json

{
  "teamId": "team_id",
  "assignedToId": "technician_id"
}
```

### Report Endpoints

```http
GET /reports/dashboard        # Dashboard statistics
GET /reports/by-team          # Requests by team
GET /reports/by-category      # Requests by category
GET /reports/by-status        # Requests by status
GET /reports/duration         # Duration analysis
Authorization: Bearer {token}
```

---

## 👥 User Roles & Permissions

| Feature | Admin | Manager | Technician | User |
|---------|-------|---------|------------|------|
| **Dashboard Access** | ✅ | ✅ | ✅ | ✅ |
| **View Equipment** | ✅ | ✅ | ✅ | ✅ |
| **Create Equipment** | ✅ | ✅ | ✅ | ❌ |
| **Edit Equipment** | ✅ | ✅ | ✅ | ❌ |
| **Delete Equipment** | ✅ | ❌ | ❌ | ❌ |
| **View All Requests** | ✅ | ✅ | ✅* | ✅* |
| **Create Request** | ✅ | ✅ | ✅ | ✅** |
| **Edit Request** | ✅ | ✅ | ✅* | ✅*** |
| **Change Request Status** | ✅ | ✅ | ✅* | ❌ |
| **Approve/Reject Request** | ✅ | ✅ | ❌ | ❌ |
| **Manage Teams** | ✅ | ✅ | ❌ | ❌ |
| **Manage Users** | ✅ | ❌ | ❌ | ❌ |
| **View Reports** | ✅ | ✅ | ✅ | ✅ |

**Notes:**
- *Technician: Only assigned requests
- **User requests require manager approval
- ***Users: Only own NEW requests

---

## 🗄️ Database Schema

### Core Models

#### User
```typescript
{
  id: string              // Unique identifier
  email: string           // Unique email
  password: string        // Hashed password
  name: string           // Full name
  role: UserRole         // ADMIN | MANAGER | TECHNICIAN | USER
  isActive: boolean      // Account status
}
```

#### Equipment
```typescript
{
  id: string
  name: string
  serialNumber: string   // Unique
  category: EquipmentCategory
  department: Department
  physicalLocation: string
  purchaseDate: DateTime
  warrantyExpiry: DateTime?
  isScrap: boolean
  notes: string?
}
```

#### MaintenanceRequest
```typescript
{
  id: string
  subject: string
  description: string
  type: RequestType      // CORRECTIVE | PREVENTIVE
  status: RequestStatus  // NEW | IN_PROGRESS | REPAIRED | SCRAP
  scheduledDate: DateTime
  completedAt: DateTime?
  durationHours: number?
  isPending: boolean     // Requires approval
  approvedAt: DateTime?
}
```

#### MaintenanceTeam
```typescript
{
  id: string
  name: string
  description: string?
  isActive: boolean
}
```

---

## 🎯 Features in Detail

### Kanban Board
- **Drag & Drop**: Move requests between status columns
- **Real-time Updates**: Automatic sync across users
- **Permission Control**: Role-based drag permissions
- **Duration Dialog**: Required input when marking as REPAIRED
- **Visual Indicators**: Color-coded status badges

### Calendar View
- **Month/Week/Day Views**: FullCalendar integration
- **Drag to Reschedule**: Visual date management
- **Color Coding**: Requests by type and status
- **Quick Info**: Hover for request details
- **Click to Edit**: Direct navigation to request page

### Approval Workflow
1. User creates a maintenance request
2. Request is marked as **Pending Approval**
3. Manager sees request in **Pending Requests** page
4. Manager reviews request details
5. Manager assigns team and specific technician
6. Manager approves or rejects
7. Approved requests become active for technicians

### Equipment Tracking
- **Uptime Calculation**: Based on active vs. repaired requests
- **Maintenance History**: Timeline of all requests
- **Status Indicators**: Visual status badges
- **Associated Requests**: View all related maintenance
- **Scrap Management**: Mark and track scrapped equipment

---

## 💻 Development

### Backend Development

```bash
cd backend

# Run in development mode
npm run dev

# Build for production
npm run build

# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run db:seed
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate
```

---

## 🚀 Deployment

### Backend Deployment (Railway)

1. Create Railway account at [railway.app](https://railway.app)
2. Add PostgreSQL database
3. Deploy from GitHub
4. Set environment variables:
   - `DATABASE_URL` (auto-provided)
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL`
5. Run migrations: `npx prisma migrate deploy`

### Frontend Deployment (Vercel)

1. Create Vercel account at [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
4. Deploy

---

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [TanStack Query](https://tanstack.com/query) - Async state management
- [FullCalendar](https://fullcalendar.io/) - Event calendar
- [dnd-kit](https://dndkit.com/) - Drag and drop toolkit

---

## 📊 Project Status

**Status**: ✅ Production Ready

**Version**: 1.0.0

**Last Updated**: December 27, 2025

---
# GearGuard – The Ultimate Maintenance Tracker

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Railway-316192)](https://railway.app/)

A comprehensive maintenance management system that connects equipment, teams, and maintenance requests with automated workflows and role-based access control.

---

## 🎯 Product Overview

GearGuard seamlessly connects:
- **Equipment** → What needs maintenance
- **Teams** → Who performs the maintenance  
- **Requests** → The work to be done

### Key Capabilities
- ✅ Track company assets with maintenance history
- ✅ Manage specialized maintenance teams
- ✅ Handle corrective (breakdown) and preventive (scheduled) maintenance
- ✅ Kanban board with drag & drop
- ✅ Calendar view for planned maintenance
- ✅ Real-time analytics and reports
- ✅ Role-based access control (RBAC)

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access - manage users, teams, equipment, and all requests |
| **Manager** | Create preventive requests, assign technicians, view all requests |
| **Technician** | View team requests, update status, log work duration |
| **User** | Create breakdown requests, view own requests |

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Authentication**: NextAuth.js (Credentials Provider)
- **Drag & Drop**: @dnd-kit
- **Calendar**: FullCalendar
- **Charts**: Recharts
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 4.21
- **ORM**: Prisma 5.22
- **Database**: PostgreSQL (Railway)
- **Auth**: JWT (jsonwebtoken)
- **Validation**: Zod

### DevOps & Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway PostgreSQL
- **CI/CD**: GitHub Actions (planned)

---

## 📂 Project Structure

```
GearGuard/
├── backend/                          # Node.js + Express API
│   ├── prisma/                       # Database schema & migrations
│   │   ├── migrations/               # Auto-generated migrations
│   │   ├── schema.prisma             # Prisma schema
│   │   └── seed.ts                   # Seed data
│   ├── src/
│   │   ├── config/                   # Configuration
│   │   ├── controllers/              # Route handlers
│   │   ├── services/                 # Business logic
│   │   ├── routes/                   # API routes
│   │   ├── middleware/               # Auth, RBAC, error handling
│   │   ├── utils/                    # Helpers
│   │   ├── types/                    # TypeScript types
│   │   └── index.ts                  # Server entry point
│   ├── .env.example                  # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Next.js 14 Application
│   ├── app/                          # App Router
│   │   ├── (auth)/                   # Auth pages (login, register)
│   │   ├── (dashboard)/              # Protected dashboard pages
│   │   └── api/auth/[...nextauth]/   # NextAuth handler
│   ├── components/
│   │   └── ui/                       # Reusable UI components
│   ├── lib/
│   │   ├── providers/                # React providers
│   │   ├── api-client.ts             # Axios client with JWT
│   │   └── utils.ts                  # Helper functions
│   ├── types/                        # TypeScript types
│   ├── middleware.ts                 # Route protection
│   ├── .env.example                  # Environment template
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # System design
│   ├── DATABASE.md                   # Schema docs
│   ├── API.md                        # API reference
│   ├── QUICKSTART.md                 # Setup guide
│   └── PROGRESS.md                   # Development tracker
│
├── PROJECT_STRUCTURE.md              # Detailed folder structure
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

**See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed folder documentation.**

---

## 🚀 Core Features

### 1. Equipment Management
- 📦 Track all company assets with detailed metadata
- 🔍 Search & filter by department, category, assigned employee
- 🚫 Scrap flag prevents new maintenance requests
- 📊 Smart maintenance button shows request history with badge count

### 2. Maintenance Teams
- 👥 Organize technicians into specialized groups
- 🎯 Team-based request assignment and visibility
- 🔒 Restricted access - technicians see only team requests

### 3. Maintenance Requests
#### Request Types
- **Corrective**: Unplanned breakdown repairs (any user)
- **Preventive**: Scheduled routine maintenance (managers only)

#### Workflow States
```
New → In Progress → Repaired
                  ↘ Scrap (equipment marked unusable)
```

#### Smart Features
- Auto-fill category & team from equipment selection
- Scheduled date validation for preventive requests
- Overdue detection (scheduled date passed + not repaired)
- Duration tracking in hours

### 4. Kanban Board
- 🎨 Drag & drop interface with @dnd-kit
- 👤 Assigned technician avatars
- 🔴 Overdue requests highlighted in red
- 🔄 Real-time status updates

### 5. Calendar View
- 📅 FullCalendar integration
- 🗓️ Displays only preventive maintenance
- ➕ Click date to create scheduled request

### 6. Reports & Analytics
- 📈 Dashboard with real-time metrics
- 📊 Requests by team, category, status
- ⏱️ Duration analysis (avg, min, max)
- 🎯 Role-based filtering (USER sees own, TECHNICIAN sees team, MANAGER/ADMIN sees all)

---

## 🚦 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database (Railway recommended)
- npm or yarn

### 1. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/gearguard.git
cd gearguard

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
PORT=5000
NODE_ENV=development
```

**Frontend** (`frontend/.env.local`):
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-super-secret-nextauth-key-min-32-chars"
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 3. Database Setup

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with test data
npx prisma db seed
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### 5. Login & Test

Visit `http://localhost:3000` and login with test credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gearguard.com | password123 |
| Manager | manager1@gearguard.com | password123 |
| Technician | tech.mech1@gearguard.com | password123 |
| User | user1@gearguard.com | password123 |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture & design decisions |
| [DATABASE.md](docs/DATABASE.md) | Database schema & relationships |
| [API.md](docs/API.md) | Complete API reference with examples |
| [QUICKSTART.md](docs/QUICKSTART.md) | Detailed setup guide |
| [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) | Folder structure & conventions |
| [PROGRESS.md](docs/PROGRESS.md) | Development progress tracker |

---

## 🔒 Security Features

- ✅ JWT-based authentication with secure token storage
- ✅ Role-Based Access Control (RBAC) with 4 permission levels
- ✅ Team-restricted visibility for technicians
- ✅ Permission-guarded API endpoints
- ✅ Password hashing with bcrypt
- ✅ Environment variable security
- ✅ CORS configuration for API protection

---

## 📊 Business Logic & Automation

### Smart Workflows
- ✨ **Auto-fill**: Equipment selection auto-populates category & team
- 🚫 **Scrap Prevention**: Scrapped equipment cannot receive new requests
- 🔔 **Overdue Detection**: Automatic flagging when scheduled date passes
- 📝 **Maintenance History**: Track all work done on each equipment

### Workflow Rules
1. **Corrective Requests**: 
   - Created by any user
   - No scheduled date required
   - Immediate attention workflow

2. **Preventive Requests**:
   - Created by managers only
   - Scheduled date required
   - Appears in calendar view

3. **Status Transitions**:
   - NEW → IN_PROGRESS (technician assigns self)
   - IN_PROGRESS → REPAIRED (work completed)
   - IN_PROGRESS → SCRAP (equipment beyond repair, auto-marks equipment)

4. **RBAC Filtering**:
   - USER: See only own requests
   - TECHNICIAN: See team requests
   - MANAGER/ADMIN: See all requests

---

## 🎯 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (returns JWT)
- `GET /api/v1/auth/me` - Get current user

### Equipment
- `GET /api/v1/equipment` - List all equipment (with filters)
- `POST /api/v1/equipment` - Create equipment
- `GET /api/v1/equipment/:id` - Get equipment details
- `PATCH /api/v1/equipment/:id` - Update equipment
- `DELETE /api/v1/equipment/:id` - Delete equipment

### Teams
- `GET /api/v1/teams` - List all teams
- `POST /api/v1/teams` - Create team
- `PATCH /api/v1/teams/:id` - Update team
- `DELETE /api/v1/teams/:id` - Delete team

### Maintenance Requests
- `GET /api/v1/requests` - List requests (role-filtered)
- `POST /api/v1/requests` - Create request
- `PATCH /api/v1/requests/:id/status` - Update status
- `PATCH /api/v1/requests/:id/assign` - Assign technician
- `GET /api/v1/requests/calendar` - Calendar view
- `GET /api/v1/requests/overdue` - Overdue requests

### Reports
- `GET /api/v1/reports/dashboard` - Dashboard stats
- `GET /api/v1/reports/by-team` - Requests by team
- `GET /api/v1/reports/by-category` - Requests by category
- `GET /api/v1/reports/duration` - Duration analysis

**See [API.md](docs/API.md) for complete documentation with curl examples.**

---

## 🚀 Deployment

### Backend (Railway)
1. Push code to GitHub
2. Connect repository to Railway
3. Add environment variables
4. Deploy automatically on push

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy automatically on push

**Detailed deployment guide coming in Phase 7.**

---

## 🛠️ Development Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Architecture & planning |
| Phase 2 | ✅ Complete | Database design & schema |
| Phase 3 | ✅ Complete | Backend APIs (Auth, CRUD, Reports) |
| Phase 4 | ✅ Complete | Frontend foundation (Auth, Dashboard, UI) |
| Phase 5 | 🚧 In Progress | Core screens (Equipment, Kanban, Calendar) |
| Phase 6 | ⏳ Pending | Reports & analytics dashboard |
| Phase 7 | ⏳ Pending | Deployment & production setup |

**Last Updated**: December 27, 2025

---

## 🤝 Contributing

This is a proprietary project. Contact the development team for contribution guidelines.

---

## 📝 License

Proprietary - All rights reserved

---

## 📧 Support

For issues or questions, contact the development team or refer to the documentation in the `docs/` folder.

---

**Built with ❤️ using Next.js, Express, Prisma, and PostgreSQL**

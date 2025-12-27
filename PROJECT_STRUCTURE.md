# ============================================================================
# GEARGUARD - PROJECT STRUCTURE
# ============================================================================
# Last Updated: December 27, 2025
# 
# This document defines the standardized folder structure for the entire
# GearGuard project (backend + frontend + documentation).
# ============================================================================

```
GearGuard/
│
├── backend/                          # Node.js + Express + Prisma Backend
│   ├── prisma/                       # Database Schema & Migrations
│   │   ├── migrations/               # Auto-generated migration files
│   │   ├── schema.prisma             # Prisma schema definition
│   │   └── seed.ts                   # Database seed script
│   │
│   ├── src/                          # Source code
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.ts           # Database connection config
│   │   │   └── constants.ts          # App-wide constants
│   │   │
│   │   ├── controllers/              # Route handlers (request → response)
│   │   │   ├── auth.controller.ts
│   │   │   ├── equipment.controller.ts
│   │   │   ├── team.controller.ts
│   │   │   ├── request.controller.ts
│   │   │   └── report.controller.ts
│   │   │
│   │   ├── services/                 # Business logic layer
│   │   │   ├── auth.service.ts
│   │   │   ├── equipment.service.ts
│   │   │   ├── team.service.ts
│   │   │   ├── request.service.ts
│   │   │   └── report.service.ts
│   │   │
│   │   ├── routes/                   # API route definitions
│   │   │   ├── index.ts              # Route aggregator
│   │   │   ├── auth.routes.ts
│   │   │   ├── equipment.routes.ts
│   │   │   ├── team.routes.ts
│   │   │   ├── request.routes.ts
│   │   │   └── report.routes.ts
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── auth.middleware.ts    # JWT authentication
│   │   │   ├── rbac.middleware.ts    # Role-based access control
│   │   │   ├── error.middleware.ts   # Global error handler
│   │   │   └── logger.middleware.ts  # Request logging
│   │   │
│   │   ├── utils/                    # Helper utilities
│   │   │   ├── errors.ts             # Custom error classes
│   │   │   ├── response.ts           # Standardized API responses
│   │   │   ├── jwt.ts                # JWT token utilities
│   │   │   └── password.ts           # Password hashing
│   │   │
│   │   ├── types/                    # TypeScript type definitions
│   │   │   └── index.ts
│   │   │
│   │   └── index.ts                  # Express server entry point
│   │
│   ├── .env                          # Environment variables (NOT IN GIT)
│   ├── .env.example                  # Example environment template
│   ├── package.json                  # Backend dependencies
│   └── tsconfig.json                 # TypeScript configuration
│
├── frontend/                         # Next.js 14 + TypeScript Frontend
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (no layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   └── register/
│   │   │       └── page.tsx          # Registration page
│   │   │
│   │   ├── (dashboard)/              # Dashboard route group (with layout)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Dashboard home
│   │   │   ├── equipment/
│   │   │   │   └── page.tsx          # Equipment management
│   │   │   ├── teams/
│   │   │   │   └── page.tsx          # Team management
│   │   │   ├── requests/
│   │   │   │   └── page.tsx          # Maintenance requests
│   │   │   ├── reports/
│   │   │   │   └── page.tsx          # Reports & analytics
│   │   │   └── layout.tsx            # Dashboard layout (sidebar + header)
│   │   │
│   │   ├── api/                      # API routes (NextAuth)
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts      # NextAuth handler
│   │   │
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout (providers)
│   │   └── page.tsx                  # Root page (redirect to login)
│   │
│   ├── components/                   # React components
│   │   └── ui/                       # Reusable UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── textarea.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── modal.tsx
│   │       ├── loading.tsx
│   │       └── error-message.tsx
│   │
│   ├── lib/                          # Utility libraries
│   │   ├── providers/                # React context providers
│   │   │   ├── auth-provider.tsx     # NextAuth session provider
│   │   │   └── query-provider.tsx    # React Query provider
│   │   ├── api-client.ts             # Axios HTTP client
│   │   └── utils.ts                  # Helper functions
│   │
│   ├── types/                        # TypeScript types
│   │   └── index.ts                  # Shared type definitions
│   │
│   ├── public/                       # Static assets
│   │
│   ├── .env.local                    # Local environment variables (NOT IN GIT)
│   ├── .env.example                  # Example environment template
│   ├── middleware.ts                 # Next.js middleware (route protection)
│   ├── next.config.ts                # Next.js configuration
│   ├── package.json                  # Frontend dependencies
│   ├── postcss.config.mjs            # PostCSS configuration
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   └── tsconfig.json                 # TypeScript configuration
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md               # System architecture overview
│   ├── DATABASE.md                   # Database schema documentation
│   ├── API.md                        # API endpoints reference
│   ├── QUICKSTART.md                 # Setup & installation guide
│   ├── FOLDER_STRUCTURE.md           # This file
│   ├── PROGRESS.md                   # Development progress tracker
│   └── PHASE_4_COMPLETE.md           # Phase completion summary
│
├── .gitignore                        # Git ignore rules
└── README.md                         # Project overview

```

## 📂 Folder Structure Principles

### Backend Architecture (3-Layer)
```
Controller → Service → Database (Prisma)
   ↓           ↓           ↓
Routes → Business Logic → Data Access
```

### Frontend Architecture (Next.js App Router)
```
Pages (app/) → Components (components/) → API Client (lib/)
     ↓              ↓                           ↓
  Routes    →  UI Elements        →    Backend Communication
```

## 🎯 Naming Conventions

### Backend
- **Files**: `kebab-case` for folders, `camelCase.type.ts` for files
  - ✅ `auth.controller.ts`, `equipment.service.ts`
  - ❌ `AuthController.ts`, `Equipment_Service.ts`

- **Classes**: `PascalCase`
  - ✅ `AuthController`, `EquipmentService`

- **Functions**: `camelCase`
  - ✅ `getUserById()`, `createRequest()`

### Frontend
- **Components**: `PascalCase` for React components
  - ✅ `Button.tsx`, `ErrorMessage.tsx`

- **Utilities**: `camelCase` for utilities
  - ✅ `api-client.ts`, `utils.ts`

- **Route Groups**: Wrap in parentheses `(group-name)`
  - ✅ `(auth)`, `(dashboard)`

## 🚫 What NOT to Include

### Files to Exclude from Git
- `node_modules/` - Dependencies (reinstall via npm)
- `.env`, `.env.local` - Secrets (use `.env.example` template)
- `build/`, `dist/`, `.next/` - Build outputs
- `*.log` - Log files
- `.DS_Store`, `Thumbs.db` - OS-specific files

### Folders to NOT Create
- No `tests/` folder yet (Phase 6)
- No `docker/` folder yet (Phase 7)
- No `scripts/` folder yet (Phase 7)

## 📊 File Count Summary

| Category | Count | Status |
|----------|-------|--------|
| Backend Source Files | 27 | ✅ Complete |
| Frontend Components | 40+ | ✅ Complete |
| Documentation | 7 | ✅ Complete |
| Configuration Files | 12 | ✅ Complete |
| **Total Project Files** | **86+** | **✅ Phase 4 Complete** |

## 🔄 Migration Notes

### From Old Structure
If migrating from an older structure:
1. ✅ Removed `backend/frontend/` duplicate folder
2. ✅ Removed nested `.git` repositories
3. ✅ Standardized `.gitignore` rules
4. ✅ Unified naming conventions

### Phase 5 Additions (Upcoming)
- `frontend/app/(dashboard)/equipment/[id]/page.tsx` - Equipment details
- `frontend/app/(dashboard)/requests/kanban/page.tsx` - Kanban board
- `frontend/app/(dashboard)/requests/calendar/page.tsx` - Calendar view
- `frontend/components/features/` - Feature-specific components

## ✅ Structure Validation Checklist

- [x] No duplicate folders
- [x] No nested git repositories
- [x] Consistent naming conventions
- [x] Proper .gitignore rules
- [x] Clear separation of concerns
- [x] Documentation up-to-date
- [x] All configs in root of their domain (backend/frontend)
- [x] TypeScript types properly organized

---

**Last Verified**: December 27, 2025
**Project Phase**: Phase 4 Complete → Phase 5 Ready

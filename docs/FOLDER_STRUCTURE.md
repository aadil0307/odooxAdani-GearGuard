# GearGuard - Folder Structure

## Project Organization

```
GearGuard/
├── frontend/                     # Next.js 14 Application
│   ├── public/                   # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── app/                  # App Router (Next.js 14)
│   │   │   ├── (auth)/          # Auth route group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (dashboard)/     # Protected route group
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx     # Dashboard home
│   │   │   │   │
│   │   │   │   ├── equipment/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── new/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── teams/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   ├── requests/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── kanban/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── calendar/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   │
│   │   │   │   └── reports/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── api/             # NextAuth API routes
│   │   │   │   └── auth/
│   │   │   │       └── [...nextauth]/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── layout.tsx       # Root layout
│   │   │   └── globals.css      # Global styles
│   │   │
│   │   ├── components/          # React components
│   │   │   ├── ui/              # Base UI components
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   └── Loading.tsx
│   │   │   │
│   │   │   ├── equipment/
│   │   │   │   ├── EquipmentList.tsx
│   │   │   │   ├── EquipmentCard.tsx
│   │   │   │   ├── EquipmentForm.tsx
│   │   │   │   ├── EquipmentFilters.tsx
│   │   │   │   └── MaintenanceSmartButton.tsx
│   │   │   │
│   │   │   ├── teams/
│   │   │   │   ├── TeamList.tsx
│   │   │   │   ├── TeamCard.tsx
│   │   │   │   ├── TeamForm.tsx
│   │   │   │   └── MemberList.tsx
│   │   │   │
│   │   │   ├── requests/
│   │   │   │   ├── RequestForm.tsx
│   │   │   │   ├── RequestCard.tsx
│   │   │   │   ├── RequestList.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   ├── KanbanCard.tsx
│   │   │   │   └── CalendarView.tsx
│   │   │   │
│   │   │   ├── reports/
│   │   │   │   ├── TeamChart.tsx
│   │   │   │   ├── CategoryChart.tsx
│   │   │   │   └── DurationChart.tsx
│   │   │   │
│   │   │   └── shared/
│   │   │       ├── Navbar.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       ├── Footer.tsx
│   │   │       ├── UserMenu.tsx
│   │   │       └── ProtectedRoute.tsx
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useEquipment.ts
│   │   │   ├── useTeams.ts
│   │   │   ├── useRequests.ts
│   │   │   ├── useFilters.ts
│   │   │   └── useToast.ts
│   │   │
│   │   ├── lib/                 # Utilities & helpers
│   │   │   ├── api.ts           # API client
│   │   │   ├── auth.ts          # Auth utilities
│   │   │   ├── utils.ts         # General utilities
│   │   │   ├── constants.ts     # App constants
│   │   │   └── validations.ts   # Form validations
│   │   │
│   │   ├── types/               # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── equipment.ts
│   │   │   ├── team.ts
│   │   │   ├── request.ts
│   │   │   ├── user.ts
│   │   │   └── api.ts
│   │   │
│   │   └── providers/           # Context providers
│   │       ├── AuthProvider.tsx
│   │       └── QueryProvider.tsx
│   │
│   ├── .env.local.example
│   ├── .eslintrc.json
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                      # Node.js API Server
│   ├── src/
│   │   ├── routes/              # API route definitions
│   │   │   ├── index.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── equipment.routes.ts
│   │   │   ├── team.routes.ts
│   │   │   ├── request.routes.ts
│   │   │   └── report.routes.ts
│   │   │
│   │   ├── controllers/         # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── equipment.controller.ts
│   │   │   ├── team.controller.ts
│   │   │   ├── request.controller.ts
│   │   │   └── report.controller.ts
│   │   │
│   │   ├── services/            # Business logic layer
│   │   │   ├── equipment.service.ts
│   │   │   ├── team.service.ts
│   │   │   ├── request.service.ts
│   │   │   └── report.service.ts
│   │   │
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.middleware.ts
│   │   │   ├── rbac.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── logger.middleware.ts
│   │   │
│   │   ├── utils/               # Helper functions
│   │   │   ├── errors.ts
│   │   │   ├── response.ts
│   │   │   ├── validation.ts
│   │   │   ├── password.ts
│   │   │   └── jwt.ts
│   │   │
│   │   ├── config/              # Configuration
│   │   │   ├── database.ts
│   │   │   ├── auth.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── types/               # TypeScript types
│   │   │   ├── express.d.ts
│   │   │   └── request.types.ts
│   │   │
│   │   └── index.ts             # Entry point
│   │
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed.ts              # Seed data
│   │   └── migrations/          # DB migrations (generated)
│   │
│   ├── tests/                   # Unit & integration tests
│   │   ├── unit/
│   │   └── integration/
│   │
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
│
├── .gitignore
└── README.md
```

## Key Design Decisions

### 1. Route Organization (Frontend)
- **Route Groups**: `(auth)` and `(dashboard)` for logical separation
- **Parallel routes**: Not needed initially
- **Intercepting routes**: Future enhancement for modals

### 2. Component Organization
- **UI components**: Reusable, presentational
- **Feature components**: Domain-specific (equipment, teams, requests)
- **Shared components**: Layout and navigation

### 3. Backend Layers
- **Routes**: Endpoint definitions only
- **Controllers**: Request/response handling
- **Services**: Business logic and data access
- **Middleware**: Cross-cutting concerns (auth, validation, logging)

### 4. Type Safety
- Shared types between frontend and backend
- Prisma-generated types for database models
- Custom types for API contracts

### 5. Configuration Management
- Environment variables for secrets
- Constants files for app configuration
- Separate configs for dev/prod

## Next Steps

1. ✅ Architecture defined
2. → **Phase 2**: Database schema design
3. → **Phase 3**: Backend API implementation
4. → **Phase 4**: Frontend setup
5. → **Phase 5**: UI screens
6. → **Phase 6**: Reports & analytics
7. → **Phase 7**: Deployment

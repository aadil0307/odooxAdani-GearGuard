# GearGuard System Architecture

## 1. System Overview

GearGuard is a client-server application following a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                          │
│  Next.js 14 (App Router) + TypeScript + Tailwind CSS       │
│  React Query + @dnd-kit + FullCalendar + Recharts          │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTPS / REST API
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                      APPLICATION TIER                        │
│  Node.js + Express + NextAuth                               │
│  Business Logic + RBAC + Workflow Management                │
└─────────────────┬───────────────────────────────────────────┘
                  │ Prisma ORM
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                          DATA TIER                           │
│  PostgreSQL (Railway)                                        │
│  Transactional + Relational + ACID Compliant                │
└─────────────────────────────────────────────────────────────┘
```

## 2. Architecture Principles

### 2.1 Separation of Concerns
- **Frontend**: UI/UX, state management, user interactions
- **Backend**: Business logic, data validation, authorization
- **Database**: Data persistence, relationships, integrity

### 2.2 RESTful API Design
- Resource-based endpoints
- HTTP methods: GET, POST, PUT, DELETE
- Consistent response structure
- Status codes: 200, 201, 400, 401, 403, 404, 500

### 2.3 Type Safety
- End-to-end TypeScript
- Shared types between frontend and backend
- Prisma-generated types
- Runtime validation with Zod

### 2.4 Security First
- Authentication via NextAuth
- Role-Based Access Control (RBAC)
- Permission checks on every API call
- Team-based data isolation
- SQL injection prevention via Prisma

## 3. Data Flow Architecture

### 3.1 Request Flow (Breakdown Maintenance)

```
User (Dashboard)
    ↓
Click "New Request"
    ↓
Select Equipment → Auto-fill Category & Team
    ↓
Submit Request (Status: New)
    ↓
Backend Validation
    ↓
Database (Prisma)
    ↓
Response to Frontend
    ↓
Kanban Board Update
```

### 3.2 Workflow State Machine

```
         ┌──────┐
    ┌────│ NEW  │────┐
    │    └──────┘    │
    │                │
    ▼                ▼
┌─────────────┐  ┌──────────┐
│ IN PROGRESS │  │  SCRAP   │
└──────┬──────┘  └──────────┘
       │
       ▼
  ┌─────────┐
  │ REPAIRED│
  └─────────┘
```

**Transition Rules:**
- NEW → IN PROGRESS (Technician assigns self)
- IN PROGRESS → REPAIRED (Work completed)
- IN PROGRESS → SCRAP (Equipment unrepairable)
- NEW → SCRAP (Equipment deemed unusable)

## 4. Component Architecture

### 4.1 Frontend Architecture (Next.js App Router)

```
src/
├── app/                          # App Router (Pages)
│   ├── (auth)/                   # Auth routes
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected routes
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── equipment/
│   │   ├── teams/
│   │   ├── requests/
│   │   │   ├── kanban/
│   │   │   └── calendar/
│   │   └── reports/
│   └── api/                      # API routes for NextAuth
│
├── components/                    # React components
│   ├── ui/                       # Base components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── Card.tsx
│   ├── equipment/
│   │   ├── EquipmentList.tsx
│   │   ├── EquipmentForm.tsx
│   │   └── EquipmentCard.tsx
│   ├── requests/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   ├── RequestCard.tsx
│   │   └── CalendarView.tsx
│   └── shared/
│       ├── Navbar.tsx
│       └── Sidebar.tsx
│
├── lib/                          # Utilities
│   ├── api.ts                    # API client
│   ├── auth.ts                   # Auth helpers
│   └── utils.ts                  # General helpers
│
├── hooks/                        # Custom hooks
│   ├── useAuth.ts
│   ├── useEquipment.ts
│   └── useRequests.ts
│
└── types/                        # TypeScript types
    ├── equipment.ts
    ├── request.ts
    └── user.ts
```

### 4.2 Backend Architecture (Node.js + Express)

```
backend/
├── src/
│   ├── index.ts                  # Entry point
│   ├── routes/                   # API routes
│   │   ├── auth.routes.ts
│   │   ├── equipment.routes.ts
│   │   ├── team.routes.ts
│   │   └── request.routes.ts
│   │
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── equipment.controller.ts
│   │   ├── team.controller.ts
│   │   └── request.controller.ts
│   │
│   ├── services/                 # Business logic
│   │   ├── equipment.service.ts
│   │   ├── team.service.ts
│   │   └── request.service.ts
│   │
│   ├── middleware/               # Middleware
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── rbac.middleware.ts   # Role checks
│   │   └── validation.middleware.ts
│   │
│   ├── utils/                    # Helpers
│   │   ├── errors.ts
│   │   ├── validation.ts
│   │   └── response.ts
│   │
│   └── types/                    # TypeScript types
│       └── express.d.ts
│
└── prisma/
    ├── schema.prisma             # Database schema
    ├── seed.ts                   # Seed data
    └── migrations/               # DB migrations
```

## 5. Database Architecture

### 5.1 Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────────┐
│     User     │─────────│ MaintenanceTeam  │
│              │  N : M  │                  │
└──────┬───────┘         └────────┬─────────┘
       │                          │
       │ 1:N                      │ 1:N
       │                          │
┌──────▼───────────────────────┬──▼────────────────┐
│         Equipment            │                   │
│ - defaultTeamId (FK)         │                   │
└──────┬───────────────────────┴───────────────────┘
       │
       │ 1:N
       │
┌──────▼───────────────┐
│ MaintenanceRequest   │
│ - equipmentId (FK)   │
│ - teamId (FK)        │
│ - assignedToId (FK)  │
└──────────────────────┘
```

### 5.2 Core Entities

**User**
- Authentication & authorization
- Role: Admin, Manager, Technician, User
- Member of multiple teams

**Equipment**
- Company assets
- Belongs to department
- Assigned to default team
- Has category
- Can be marked as scrap

**MaintenanceTeam**
- Group of technicians
- Specialized by equipment type

**MaintenanceRequest**
- Work order
- Type: Corrective or Preventive
- Status: New, In Progress, Repaired, Scrap
- Assigned to specific technician

## 6. Security Architecture

### 6.1 Authentication Flow

```
1. User Login
   ↓
2. NextAuth validates credentials
   ↓
3. Backend verifies user & password
   ↓
4. JWT token issued (with role & userId)
   ↓
5. Token stored in HTTP-only cookie
   ↓
6. Frontend includes token in API calls
   ↓
7. Backend middleware verifies token
   ↓
8. Request processed with user context
```

### 6.2 Authorization Matrix

| Resource | Admin | Manager | Technician | User |
|----------|-------|---------|------------|------|
| View Equipment | ✓ | ✓ | ✓ | ✓ |
| Create Equipment | ✓ | ✓ | ✗ | ✗ |
| Edit Equipment | ✓ | ✓ | ✗ | ✗ |
| Delete Equipment | ✓ | ✗ | ✗ | ✗ |
| Create Corrective Request | ✓ | ✓ | ✓ | ✓ |
| Create Preventive Request | ✓ | ✓ | ✗ | ✗ |
| Assign Technician | ✓ | ✓ | Self Only | ✗ |
| Change Request Status | ✓ | ✓ | Assigned Only | ✗ |
| View All Requests | ✓ | ✓ | Team Only | Own Only |
| Manage Teams | ✓ | ✓ | ✗ | ✗ |
| View Reports | ✓ | ✓ | ✓ | ✗ |

## 7. API Architecture

### 7.1 Standard Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [/* validation errors */]
  }
}
```

### 7.2 API Endpoints Structure

```
/api/v1
├── /auth
│   ├── POST /register
│   ├── POST /login
│   └── POST /logout
│
├── /equipment
│   ├── GET    /equipment
│   ├── POST   /equipment
│   ├── GET    /equipment/:id
│   ├── PUT    /equipment/:id
│   ├── DELETE /equipment/:id
│   └── GET    /equipment/:id/requests
│
├── /teams
│   ├── GET    /teams
│   ├── POST   /teams
│   ├── GET    /teams/:id
│   ├── PUT    /teams/:id
│   └── DELETE /teams/:id
│
├── /requests
│   ├── GET    /requests
│   ├── POST   /requests
│   ├── GET    /requests/:id
│   ├── PUT    /requests/:id
│   ├── PATCH  /requests/:id/status
│   └── GET    /requests/calendar
│
└── /reports
    ├── GET /reports/by-team
    └── GET /reports/by-category
```

## 8. State Management Strategy

### 8.1 Frontend State
- **Server State**: React Query (API data caching)
- **UI State**: React useState/useReducer
- **Form State**: React Hook Form
- **Auth State**: NextAuth session

### 8.2 Caching Strategy
- React Query automatic caching
- Stale-while-revalidate pattern
- Cache invalidation on mutations
- Optimistic updates for better UX

## 9. Performance Considerations

### 9.1 Frontend Optimization
- Code splitting (Next.js automatic)
- Image optimization (Next.js Image component)
- Lazy loading components
- Memoization (React.memo, useMemo)

### 9.2 Backend Optimization
- Database indexing (Prisma)
- Query optimization
- Connection pooling
- Pagination for large datasets

### 9.3 Database Optimization
- Indexes on foreign keys
- Composite indexes for common queries
- Eager loading relationships
- Avoid N+1 queries

## 10. Scalability Considerations

### 10.1 Horizontal Scaling
- Stateless backend (JWT tokens)
- Railway auto-scaling
- CDN for static assets (Vercel)

### 10.2 Vertical Scaling
- Database connection pooling
- Query optimization
- Caching layer (Redis optional)

## 11. Monitoring & Logging

### 11.1 Application Logging
- Request/response logging
- Error tracking
- Performance metrics
- User activity logs

### 11.2 Error Handling
- Global error handlers
- Graceful degradation
- User-friendly error messages
- Error boundary components

## 12. Tech Stack Justification

### Why Next.js 14 (App Router)?
- **Server Components**: Reduced client bundle size
- **Server Actions**: Simplified data mutations
- **File-based routing**: Intuitive structure
- **Built-in optimization**: Image, font, script optimization
- **Vercel deployment**: Seamless CI/CD

### Why TypeScript?
- **Type safety**: Catch errors at compile time
- **Better IDE support**: Autocomplete, refactoring
- **Self-documenting code**: Types serve as documentation
- **Prisma integration**: Auto-generated types

### Why Prisma ORM?
- **Type-safe queries**: TypeScript integration
- **Migration management**: Version control for schema
- **Developer experience**: Intuitive API
- **Multi-database support**: PostgreSQL, MySQL, etc.

### Why PostgreSQL?
- **ACID compliance**: Data integrity
- **Relational model**: Perfect for equipment/team/request relationships
- **JSON support**: Flexible data when needed
- **Performance**: Excellent for read-heavy workloads

### Why NextAuth?
- **Next.js integration**: Built for Next.js
- **Flexible providers**: Credentials, OAuth
- **Session management**: JWT or database sessions
- **Security**: Built-in CSRF protection

### Why React Query?
- **Caching**: Automatic caching and invalidation
- **Background updates**: Keep data fresh
- **Optimistic updates**: Better UX
- **DevTools**: Debugging support

### Why @dnd-kit?
- **Accessibility**: Keyboard and screen reader support
- **Performance**: Optimized for drag operations
- **Flexible**: Works with any component structure
- **Touch support**: Mobile-friendly

### Why FullCalendar?
- **Feature-rich**: Drag & drop, multiple views
- **Customizable**: Themeable and extensible
- **React integration**: Official React component
- **Time zone support**: Important for scheduling

### Why Recharts?
- **React-first**: Built for React
- **Composable**: Build custom charts
- **Responsive**: Mobile-friendly
- **SVG-based**: Smooth animations

## 13. Development Workflow

### 13.1 Version Control
```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

### 13.2 Deployment Pipeline
```
Git Push
  ↓
Vercel (Frontend) - Automatic deployment
Railway (Backend) - Automatic deployment
  ↓
Run Tests
  ↓
Deploy to Production
```

## 14. Future Enhancements

- Real-time notifications (WebSockets)
- Mobile app (React Native)
- AI-powered predictive maintenance
- Integration with IoT sensors
- Advanced analytics dashboard
- Multi-language support
- Dark mode theme

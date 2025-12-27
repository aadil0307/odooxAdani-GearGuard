# GearGuard Backend

Express + Prisma + PostgreSQL API server.

## Structure

```
backend/
├── prisma/              # Database schema & migrations
└── src/
    ├── controllers/     # Route handlers
    ├── services/        # Business logic
    ├── routes/          # API routes
    ├── middleware/      # Auth, RBAC, errors
    └── utils/           # Helper functions
```

## Scripts

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript
npm run start            # Start production server
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed database
```

## Environment Variables

See `.env.example` for required variables.

## Documentation

See root [README.md](../README.md) for full documentation.

# GearGuard Frontend

Next.js 14 application with TypeScript, Tailwind CSS, and NextAuth.

## Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Public auth pages
│   ├── (dashboard)/       # Protected dashboard
│   └── api/               # API routes
├── components/ui/         # Reusable UI components
├── lib/                   # Utilities & providers
└── types/                 # TypeScript types
```

## Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

## Environment Variables

See `.env.example` for required variables.

## Documentation

See root [README.md](../README.md) for full documentation.

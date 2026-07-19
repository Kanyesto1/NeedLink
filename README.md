# NeedLink — Procurement Marketplace

Bringing suppliers and buyers together

Connect buyers who post procurement requests with verified suppliers capable of fulfilling those requests through competitive quotations.

## Architecture

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI primitives
- **Backend**: Supabase Cloud (PostgreSQL, Auth, Storage)
- **Containerization**: Docker (multi-stage build)
- **Testing**: Vitest, Playwright
- **CI/CD**: GitHub Actions

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## Environments

| Environment | Config File | Purpose |
|-------------|-------------|---------|
| Development | `.env.development` | Local development |
| Testing | `.env.testing` | Automated tests |
| Staging | `.env.staging` | Pre-production validation |
| Production | `.env.production` | Live application |

## Project Structure

```
NeedLink/
├── app/              # Next.js App Router pages and API routes
├── components/       # UI primitives and shared components
├── services/         # Business logic and external service abstractions
├── features/         # Feature-specific modules
├── utils/            # Pure utility functions
├── config/           # Centralized application configuration
├── database/         # Database schema, migrations, seeds
├── docs/             # Documentation and ADRs
├── scripts/          # Development and build scripts
└── types/            # Shared TypeScript type definitions
```

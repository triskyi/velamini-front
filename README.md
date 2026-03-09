# Velamini — Contributing Guide

Thank you for your interest in contributing to Velamini. This document covers everything you need to get the project running locally, understand the codebase, and submit quality contributions.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Project Structure](#project-structure)
6. [Tech Stack](#tech-stack)
7. [Development Workflow](#development-workflow)
8. [Code Conventions](#code-conventions)
9. [Branching Strategy](#branching-strategy)
10. [Submitting a Pull Request](#submitting-a-pull-request)
11. [Key Concepts](#key-concepts)

---

## Prerequisites

| Tool | Minimum Version |
|------|-----------------|
| Node.js | 18.x |
| npm | 9.x |
| PostgreSQL | 14.x |
| Git | 2.x |

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/velamini.git
cd velamini/velamini-front

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env.local

# 4. Apply database migrations
npx prisma migrate dev

# 5. Generate the Prisma client
npx prisma generate

# 6. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

Create a `.env.local` file at the project root. All variables below are required unless marked optional.

```env
# ── Database ────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/velamini"

# ── Authentication (NextAuth v5) ─────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"

# ── Google OAuth (optional — needed for Google sign-in) ──────────────────────
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ── AI ───────────────────────────────────────────────────────────────────────
DEEPSEEK_API_KEY="your-deepseek-api-key"

# ── WhatsApp / Twilio (optional — needed for org WhatsApp features) ──────────
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="whatsapp:+14155238886"

# ── Search (optional — needed for web-search tool in personal chat) ──────────
TAVILY_API_KEY="your-tavily-api-key"

# ── Payment / Flutterwave (optional — needed for billing flows) ──────────────
FLUTTERWAVE_SECRET_KEY="your-flutterwave-secret-key"
FLUTTERWAVE_PUBLIC_KEY="your-flutterwave-public-key"

# ── App ──────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Never commit `.env.local`.** It is already listed in `.gitignore`.

---

## Database Setup

Velamini uses **PostgreSQL** with **Prisma ORM**.

```bash
# Run all pending migrations (creates tables)
npx prisma migrate dev

# Open Prisma Studio to inspect data locally
npx prisma studio

# Reset the database (drops all data — dev only)
npx prisma migrate reset
```

The schema lives at [`prisma/schema.prisma`](prisma/schema.prisma). After editing it, always create a named migration:

```bash
npx prisma migrate dev --name describe_your_change
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router — pages and API routes
│   ├── api/                # All backend API routes
│   │   ├── agent/          # Public agent chat endpoints (used by embed widget)
│   │   ├── chat/           # Personal & shared virtual-self chat
│   │   ├── organizations/  # Org CRUD, stats, analytics, training
│   │   ├── billing/        # Flutterwave payment & invoice routes
│   │   ├── admin/          # Admin-only platform management routes
│   │   └── ...
│   ├── Dashboard/          # Authenticated personal dashboard
│   ├── admin/              # Admin panel
│   └── chat/               # Public shared virtual-self chat pages
│
├── components/
│   ├── admin/              # Admin panel UI components
│   ├── chat-ui/            # Reusable chat UI primitives
│   ├── dashboard/          # Personal dashboard views
│   └── organization/       # Org dashboard views (overview, analytics, billing…)
│
├── lib/
│   ├── prisma.ts           # Singleton Prisma client
│   ├── ai-config.ts        # DeepSeek system prompts
│   ├── quota.ts            # Org message quota helpers
│   ├── rateLimiter.ts      # In-memory rate limiting
│   ├── logger.ts           # Server-side structured logger
│   ├── agentAuth.ts        # API key validation middleware for agent endpoints
│   └── rag/                # Retrieval-Augmented Generation helpers
│
├── types/
│   ├── next-auth.d.ts      # NextAuth session type extensions
│   └── organization/       # Shared org TypeScript interfaces
│
├── auth.ts                 # NextAuth configuration
└── middleware.ts           # Route protection middleware

prisma/
├── schema.prisma           # Data model
└── migrations/             # Migration history (committed)

public/
└── embed/
    └── agent.js            # Drop-in embeddable chat widget (vanilla JS)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS v4 + custom inline CSS-in-JS |
| Auth | NextAuth v5 (Credentials + Google) |
| Database | PostgreSQL via Prisma 7 + `@prisma/adapter-pg` |
| AI | DeepSeek Chat Completions API |
| Messaging | Twilio WhatsApp API |
| Payments | Flutterwave |
| Animation | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |

---

## Development Workflow

```bash
# Start dev server with hot reload
npm run dev

# Type-check without emitting
npx tsc --noEmit

# Lint all files
npm run lint

# Build for production (also runs prisma generate)
npm run build
```

### Useful Prisma commands

```bash
npx prisma studio          # Visual DB browser at localhost:5555
npx prisma db push         # Push schema changes without a migration (prototyping only)
npx prisma migrate deploy  # Apply migrations in production/CI
```

---

## Code Conventions

### General
- **TypeScript everywhere.** Avoid `any`; use proper interfaces or infer types from Prisma.
- **No `console.log` in committed code.** Use `log()` / `warn()` / `error()` from `src/lib/logger.ts` in API routes and `src/lib/client-logger.ts` in client components.
- Keep API route files focused — one concern per route file.
- Validate all user input at API boundaries before touching the database.

### React / Next.js
- Mark client components with `"use client"` only when necessary (interactivity, browser APIs, hooks).
- Prefer server components and server-side data fetching for initial page loads.
- Never expose secrets in client components or `NEXT_PUBLIC_` variables.

### Styling
- Use the CSS custom property theming system (`--c-bg`, `--c-surface`, `--c-accent`, etc.) for all colours. Do not hard-code hex values.
- Scope component styles with short, unique class prefixes (e.g., `.ov-` for overview, `.oan-` for analytics).

### Database
- Never count all rows without a `where` clause in a user-facing route (unfiltered counts leak cross-org data).
- When counting messages, always filter by `role: "user"` to exclude AI responses from user-visible totals.
- Use `@unique` indexes and check ownership (`ownerId: session.user.id`) before reading or modifying any org record.

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code — deploys automatically to Vercel |
| `dev` | Integration branch — merge feature branches here first |
| `feat/<name>` | New feature development |
| `fix/<name>` | Bug fixes |
| `chore/<name>` | Tooling, dependencies, refactors |

```bash
# Create a feature branch off dev
git checkout dev
git pull origin dev
git checkout -b feat/your-feature-name
```

---

## Submitting a Pull Request

1. **Keep PRs focused.** One logical change per PR.
2. **Write a clear description** — what the change does, why it's needed, and how it was tested.
3. **Target `dev`**, not `main`, unless it is a hotfix.
4. **Ensure the build passes** locally before opening the PR:
   ```bash
   npm run lint && npx tsc --noEmit && npm run build
   ```
5. **No secrets, no `.env` files, no generated files** (e.g., `prisma/generated/`) in the diff.
6. **Migration files are required** whenever the Prisma schema changes.

PR title format: `[type]: short description`  
Examples: `feat: add org monthly token reset cron`, `fix: prevent error text leaking into chat history`

---

## Key Concepts

### Account Types
- **Personal** — individuals creating and sharing a virtual self (digital twin).
- **Organization** — businesses deploying a branded AI agent via embed widget.

### Quota System
- Each org has `monthlyMessageCount` and `monthlyMessageLimit` tracked in the `Organization` table.
- `src/lib/quota.ts` exposes `checkQuota()` — call it before every AI inference in org-facing routes.
- A 3-day grace period applies when token limits are exhausted (`tokensExhaustedAt`).

### Agent Authentication
- External API calls to agent endpoints (from the embed widget or third-party integrations) are authenticated via a hashed API key.
- Use `authenticateAgent(req)` from `src/lib/agentAuth.ts` — never re-implement key validation inline.

### Admin Routes
- All `/api/admin/*` routes require `session.user.isAdminAuth === true`.
- Admin auth is separate from regular user auth and must be explicitly verified in every admin route handler.


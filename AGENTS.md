<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Commands

| Command               | What it does                                  |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Dev server on :3000                           |
| `npm run build`       | Production build                              |
| `npm run lint`        | ESLint (eslint-config-next)                   |
| `npm run test:e2e`    | Playwright (chromium, auto-starts dev server) |
| `npm run test:e2e:ui` | Playwright in UI mode                         |

No typecheck script in package.json, but TypeScript strict mode is on.

## Stack

- Next.js **16** (App Router), React 19, TypeScript strict
- Tailwind CSS **v4** — uses `@theme` directive in `app/globals.css`, **not** `tailwind.config.ts`
- shadcn/ui (`components/ui/`), configured via `components.json`
- Supabase (`@supabase/ssr`) for auth, PostgreSQL, storage
- OpenAI GPT-4o Vision → pet photo analysis
- React Three Fiber + Drei + GSAP for 3D / animations
- Zod + React Hook Form (@hookform/resolvers) for forms
- Resend (email), Twilio (WhatsApp)
- Deployed on Netlify via `@netlify/plugin-nextjs`

## Architecture

**Route groups** (no path prefix in URLs):

- `app/(public)/` → landing page at `/`
- `app/(auth)/` → login at `/login`
- `app/(admin)/` → dashboard, appointments, customers, products, CMS, form-builder, services, reviews, settings

**Server Actions** in `app/actions/` — every file must start with `'use server'`. Used for all mutations and AI calls. Return pattern: `{data, error}` (never throw from actions).

**API Routes** in `app/api/` — used only for external webhooks (Twilio WhatsApp, form-config, salon-location). Everything else goes through Server Actions.

**Middleware** (`middleware.ts`) checks raw URL path segments (`/dashboard`, `/appointments`, etc.) and redirects unauthenticated users to `/login`. Session refresh is handled by `lib/supabase/middleware.ts`.

## Supabase clients (3 files, 3 contexts)

| File                         | Context                     | Client type                            |
| ---------------------------- | --------------------------- | -------------------------------------- |
| `lib/supabase/client.ts`     | Browser (`'use client'`)    | `createBrowserClient`                  |
| `lib/supabase/server.ts`     | Server Components / Actions | `createServerClient` + cookies         |
| `lib/supabase/middleware.ts` | Middleware                  | `createServerClient` + request cookies |

## File conventions

- Server Components: no directive needed (default for page/layout)
- Client Components: must have `'use client'` at the top
- `@/` alias → project root (configured in `tsconfig.json`)
- `cn()` from `lib/utils.ts` for className merging (clsx + tailwind-merge)
- `lib/utils.ts` also has `formatCurrency` (MXN), `formatDate` (es-MX), `getInitials`
- Zod schemas in `lib/schemas/`, domain types in `types/index.ts`, DB types in `types/database.ts`
- AI logic in `lib/ai/` — called only from server actions (never directly from client components)
- 3D components in `components/3d/` — always lazy-load: `next/dynamic(() => import('...'), { ssr: false })`
- Forms in `components/forms/`, admin layout in `components/layout/`, landing in `components/landing/`

## Design system (see `DESIGN.md` for full spec)

- **Primary**: `#FF8C7A` (coral) — NOT indigo
- **Background**: `#FFF8F0` (cream), **Cards**: `#FFFFFF`
- **Font**: Quicksand (everywhere, max 2 weights per view)
- **Radius scale**: 8px → 12px → 20px → full
- **Shadows**: colored (coral tint), never black
- **Errors**: `#FFB3B3` (soft pink), never pure red
- **One primary button per view**

## Environment

- Copy `.env.example` → `.env.local`
- Supabase vars must use `NEXT_PUBLIC_` prefix (both browser and server clients read them)
- OpenAI key, Resend key, Twilio creds are server-only (no `NEXT_PUBLIC_`)

## Database

- RLS on all Supabase tables, `snake_case` identifiers, UUID PKs
- Every table has `created_at` and `updated_at`
- Full schema: `supabase/schema.sql`

## Testing

- Playwright e2e in `e2e/`, organized as `landing/`, `admin/`, `api/`
- Config auto-starts dev server; reuse if already running (unless CI)
- Fixtures in `e2e/fixtures/`, report in `e2e/playwright-report/` (gitignored)

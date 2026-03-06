# Khalsa Community Pitch Project (KCCP)

A fundraiser web app where supporters can sponsor 1m² sections of an artificial hockey pitch for **Khalsa Hockey Club**.

## Overview

The pitch is divided into a 20×10 grid of 200 sections. Supporters browse the interactive pitch, select sections to sponsor, and review their basket before completing a pledge. Centre sections are priced at **£100** and surrounding sections at **£50**.

## Routes

| Route | Description |
|---|---|
| `/` | Homepage — hero section with CTA |
| `/pitch` | Interactive pitch grid — browse and select sections |
| `/basket` | Review selected sections, total cost, and clear basket *(requires sign-in)* |
| `/auth/sign-in` | Sign in with email+password or Google |
| `/auth/sign-up` | Create an account with email+password or Google |
| `/auth/complete-profile` | Set your name after first sign-in (required) |

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 via PostCSS
- **UI Components**: ShadCN UI
- **Fonts**: Geist Sans & Geist Mono
- **Auth & Database**: Supabase (`@supabase/ssr`) — Email+Password and Google OAuth

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and add your Supabase credentials, then open [http://localhost:3000](http://localhost:3000).

> **Note**: `.env.local` is required — the app will not start without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Commands

```bash
npm run dev           # Development server (Turbopack)
npm run build         # Production build
npm run start         # Production server
npm run lint          # ESLint
npm run typecheck     # TypeScript type check
npm test              # Unit & component tests (Vitest)
npm run test:watch    # Vitest in watch mode
npm run test:coverage # Vitest with coverage report
npm run test:e2e      # Cypress E2E tests (auto-starts dev server)
npm run test:e2e:open # Cypress interactive mode (auto-starts dev server)
```

## Testing

Unit and component tests use **Vitest** + **Testing Library** and run entirely in-process with a jsdom environment — no running server required.

```bash
npm test
```

End-to-end tests use **Cypress** and are driven against the real Next.js dev server, which is started automatically via `start-server-and-test`:

```bash
npm run test:e2e
```

Coverage includes unit tests for utilities and pitch data, hook tests for the basket context, middleware auth-phase tests, component tests for all UI components, page and route handler tests for all auth flows, and Cypress E2E tests for pitch selection, basket management, and auth redirects.

## Project Structure

```
app/                        # Next.js App Router pages
  page.tsx                  # Homepage
  pitch/page.tsx            # Pitch grid page
  basket/page.tsx           # Basket page (protected)
  auth/
    sign-in/page.tsx        # Sign-in page
    sign-up/page.tsx        # Sign-up page
    callback/route.ts       # OAuth PKCE callback
    complete-profile/page.tsx  # Profile completion form
    sign-out/route.ts       # POST sign-out handler
    auth-code-error/page.tsx   # Auth error fallback
middleware.ts               # Route protection + session refresh
components/
  ui/                       # ShadCN UI primitives
  navbar.tsx                # Top nav with basket count + auth status
  auth-status.tsx           # Sign in link or user email + sign out
  footer.tsx                # Site footer
  pitch-grid.tsx            # 20×10 CSS grid with running total
  pitch-section-cell.tsx    # Individual grid cell
  basket-content.tsx        # Basket item list and total
lib/
  types.ts                  # PitchSection and Profile interfaces
  pitch-data.ts             # 200-section grid data
  basket-context.tsx        # BasketProvider + useBasket hook
  utils.ts                  # cn() utility (clsx + tailwind-merge)
  supabase/
    client.ts               # Browser Supabase client
    server.ts               # Server Supabase client
    middleware.ts           # updateSession() helper
    database.types.ts       # Generated DB types
```

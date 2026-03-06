# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start development server (Next.js with Turbopack)
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm run typecheck     # TypeScript type check (tsc --noEmit)
npm test              # Run Vitest unit/component tests (vitest run)
npm run test:watch    # Vitest in watch mode
npm run test:coverage # Vitest with coverage report
npm run test:e2e      # Cypress E2E (auto-starts dev server via start-server-and-test)
npm run test:e2e:open # Cypress interactive mode (also auto-starts dev server)
```

## Architecture

This is a **Next.js 16.1.6** project using the **App Router** (`app/` directory). It is the **Khalsa Community Pitch Project** — a fundraiser where supporters sponsor 1m² sections of an artificial hockey pitch for Khalsa Hockey Club.

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss`)
- **UI Components**: ShadCN UI (v3.8.5) — components live in `components/ui/`
- **Fonts**: Geist Sans and Geist Mono (Google Fonts, loaded via `next/font`)
- **Path alias**: `@/*` resolves to the project root

## Routes

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Homepage — hero + CTA to `/pitch` |
| `/pitch` | `app/pitch/page.tsx` | Interactive 20×10 pitch grid; fetches `purchased_sections` server-side |
| `/basket` | `app/basket/page.tsx` | Selected sections list + "Proceed to Checkout" CTA |
| `/checkout` | `app/checkout/page.tsx` | 3-step checkout — **protected** (redirects to sign-in or complete-profile) |
| `/checkout/confirmation` | `app/checkout/confirmation/page.tsx` | Post-payment confirmation; reads `payment_intent` from URL |
| `/api/checkout/create-payment-intent` | `app/api/checkout/create-payment-intent/route.ts` | POST — creates Stripe PaymentIntent + pending order |
| `/api/webhooks/stripe` | `app/api/webhooks/stripe/route.ts` | POST — Stripe webhook; fulfils or refunds orders |
| `/auth/sign-in` | `app/auth/sign-in/page.tsx` | Email+password + Google OAuth sign-in |
| `/auth/sign-up` | `app/auth/sign-up/page.tsx` | Email+password + Google OAuth sign-up |
| `/auth/callback` | `app/auth/callback/route.ts` | PKCE OAuth callback — exchanges code for session |
| `/auth/complete-profile` | `app/auth/complete-profile/page.tsx` | Profile form (required after first sign-in) |
| `/auth/sign-out` | `app/auth/sign-out/route.ts` | POST — signs out and redirects to `/` |
| `/auth/auth-code-error` | `app/auth/auth-code-error/page.tsx` | OAuth error fallback |

## Key Files

| File | Purpose |
|---|---|
| `lib/types.ts` | All interfaces: `PitchSection`, `Profile`, `BillingAddress`, `SectionOwnerConfig`, `Order`, `OrderItem`, `PurchasedSection` |
| `lib/pitch-data.ts` | 200-section grid (20×10); centre sections £100, others £50 |
| `lib/basket-context.tsx` | `BasketProvider` + `useBasket` hook (Set-based, client-only); includes `removeMultiple()` |
| `lib/stripe/server.ts` | Stripe Node.js client singleton (server-only) |
| `lib/stripe/client.ts` | `loadStripe()` promise for client-side Stripe Elements |
| `lib/supabase/client.ts` | Browser Supabase client (`createBrowserClient`) |
| `lib/supabase/server.ts` | Server Supabase client (`createServerClient` with async cookies) |
| `lib/supabase/admin.ts` | service_role Supabase client — only used in webhook, bypasses RLS |
| `lib/supabase/middleware.ts` | `updateSession()` — 3-phase: refresh → route protection → profile check |
| `lib/supabase/database.types.ts` | Generated TypeScript types for the Supabase schema |
| `middleware.ts` | Next.js middleware entry — calls `updateSession()` |
| `components/navbar.tsx` | Top nav with active-link highlight, basket count badge, and `<AuthStatus />` |
| `components/auth-status.tsx` | Client component — shows "Sign in" or email + "Sign out" |
| `components/footer.tsx` | Minimal footer with Separator |
| `components/pitch-grid.tsx` | CSS Grid layout, running count + total, marks sold sections slate |
| `components/pitch-section-cell.tsx` | Single grid cell — green / amber / sold (slate) states |
| `components/basket-content.tsx` | Basket list, stale-section detection, "Proceed to Checkout" CTA |
| `components/checkout-content.tsx` | Client orchestrator for 3-step checkout flow |
| `components/checkout/section-owner-names.tsx` | Step 1: per-section owner name + show/hide toggle |
| `components/checkout/billing-payment.tsx` | Step 2: billing address form + GiftAid declaration |
| `components/checkout/order-review.tsx` | Step 3: order summary + Stripe Elements wrapper |
| `components/checkout/payment-form.tsx` | Stripe `PaymentElement` + `confirmPayment` handler |
| `components/checkout/clear-basket-on-success.tsx` | Client component — clears basket on confirmation page load |

## Key Conventions

- ESLint uses the new flat config format (`eslint.config.mjs`) extending `eslint-config-next` core-web-vitals and TypeScript rules.
- Tailwind v4 is configured via `globals.css` (`@import "tailwindcss"`) and CSS custom properties (`@theme inline`) — no `tailwind.config.js` file.
- ShadCN theming uses CSS variables defined in `app/globals.css` — colors use `bg-background`, `text-foreground`, `text-muted-foreground`, etc.
- ShadCN config is in `components.json` (style: default, base color: neutral, CSS variables enabled).
- The `cn` utility (`lib/utils.ts`) combines `clsx` and `tailwind-merge` — always use it for conditional class merging.
- Add new ShadCN components with `npx shadcn@latest add <component> -y`.
- Use `import type` for type-only imports (`@typescript-eslint/consistent-type-imports` is enforced).
- Use `"use client"` only where interactivity or hooks require it; server components are the default.
- Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

## Testing

- **Unit/component**: Vitest 4 + `@testing-library/react` 16 + jsdom. Config in `vitest.config.ts`.
- **E2E**: Cypress 15, config in `cypress.config.ts`, specs in `cypress/e2e/`. `start-server-and-test` auto-starts the dev server — no manual `npm run dev` needed.
- **Setup file**: `tests/setup.ts` — imports jest-dom matchers, stubs `NEXT_PUBLIC_SUPABASE_*` env vars, auto-cleanup after each test.
- **Mocks**:
  - `tests/mocks/supabase.ts` — `createMockSupabaseClient(authConfig, dbConfig)` factory; exports `TEST_USER` and `TEST_PROFILE` fixtures.
  - Supabase browser client (components): `vi.mock("@/lib/supabase/client", () => ({ createClient: () => mockSupabase }))`
  - Supabase server client (route handlers): `vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn().mockResolvedValue(mockSupabase) }))`
  - Supabase SSR (middleware): `vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn().mockReturnValue(mockSupabase) }))`
  - Always import `vi` explicitly — `globals: true` only provides runtime access, not TS types.
- **Test locations**: `lib/__tests__/`, `lib/supabase/__tests__/`, `components/__tests__/`, `app/auth/__tests__/`
- **Protected routes** (actual, in `PROTECTED_ROUTES`): `/checkout`, `/profile` — **not** `/basket`.

## Auth

- **Package**: `@supabase/ssr` (NOT the deprecated `auth-helpers`)
- **Providers**: Email+Password and Google OAuth
- **Protected routes**: `/checkout`, `/profile` (defined in `PROTECTED_ROUTES` array in `lib/supabase/middleware.ts`)
- **Auth decision**: always use `getUser()` (contacts auth server), never `getSession()` (unverified)
- **Profile requirement**: users must complete a profile (`profiles` table) before accessing protected routes — no auto-creation trigger, manual form at `/auth/complete-profile`
- **Credentials**: stored in `.env.local` — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Google OAuth**: requires manual configuration in Supabase Dashboard → Authentication → Providers → Google; redirect URI is `https://fazbttucywkxnjesktri.supabase.co/auth/v1/callback`

## Payments (Stripe)

- **Packages**: `stripe` (server), `@stripe/stripe-js` + `@stripe/react-stripe-js` (client)
- **Flow**: basket → `POST /api/checkout/create-payment-intent` → Stripe Elements → webhook fulfils order
- **Env vars**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`
- **Webhook**: verify signature with `stripe.webhooks.constructEvent`; use `supabaseAdmin` (service_role) to bypass RLS when writing `purchased_sections`
- **Race condition**: two users paying for the same section → `purchased_sections` PK constraint ensures only the first webhook insert succeeds; the loser is automatically refunded via `stripe.refunds.create`
- **Local webhook testing**: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- **Stripe API version**: `2026-02-25.clover`

## Database Tables

| Table | RLS | Notes |
|---|---|---|
| `profiles` | users read/write own row | Required before checkout |
| `orders` | users SELECT/INSERT own rows | One per checkout; status: pending → completed/failed |
| `order_items` | users SELECT/INSERT via order ownership | One per section |
| `purchased_sections` | anyone SELECT; service_role INSERT only | Source of truth for sold sections |
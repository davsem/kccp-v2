# Khalsa Community Pitch Project (KCCP)

A fundraiser web app where supporters can sponsor 1m² sections of an artificial hockey pitch for **Khalsa Hockey Club**.

## Overview

The pitch is divided into a 20×10 grid of 200 sections. Supporters browse the interactive pitch, select sections to sponsor, name each section, declare GiftAid, and pay via Stripe. Centre sections are priced at **£100** and surrounding sections at **£50**.

## Routes

| Route | Description |
|---|---|
| `/` | Homepage — hero section with CTA |
| `/pitch` | Interactive pitch grid — browse and select sections |
| `/basket` | Review selected sections and proceed to checkout |
| `/checkout` | 3-step checkout: name sections → billing + GiftAid → pay *(protected)* |
| `/checkout/confirmation` | Order confirmation after payment |
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
- **Payments**: Stripe (PaymentIntents + Elements + webhooks)

## Getting Started

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in all credentials, then open [http://localhost:3000](http://localhost:3000).

### Required environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Stripe webhook (local dev)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

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

Unit and component tests use **Vitest** + **Testing Library** and run entirely in-process — no running server required.

End-to-end tests use **Cypress** driven against the real dev server (auto-started via `start-server-and-test`).

## Project Structure

```
app/                              # Next.js App Router pages
  page.tsx                        # Homepage
  pitch/page.tsx                  # Pitch grid (fetches purchased sections server-side)
  basket/page.tsx                 # Basket page
  checkout/
    page.tsx                      # Checkout entry (protected, fetches profile)
    confirmation/page.tsx         # Order confirmation
  api/
    checkout/
      create-payment-intent/      # POST — creates Stripe PaymentIntent + order rows
    webhooks/
      stripe/                     # POST — handles payment_intent.succeeded / failed
  auth/
    sign-in / sign-up / callback / complete-profile / sign-out / auth-code-error
middleware.ts                     # Route protection + session refresh
components/
  ui/                             # ShadCN UI primitives
  navbar.tsx                      # Top nav with basket count + auth status
  pitch-grid.tsx                  # 20×10 CSS grid, marks sold sections
  pitch-section-cell.tsx          # Grid cell — green / amber / sold (slate) states
  basket-content.tsx              # Basket list, stale-item detection, checkout CTA
  checkout-content.tsx            # Multi-step checkout orchestrator (client)
  checkout/
    section-owner-names.tsx       # Step 1: name each section + visibility toggle
    billing-payment.tsx           # Step 2: billing address + GiftAid declaration
    order-review.tsx              # Step 3: summary + Stripe Elements payment
    payment-form.tsx              # Stripe PaymentElement wrapper
    clear-basket-on-success.tsx   # Client component — clears basket after confirmation
lib/
  types.ts                        # All TypeScript interfaces
  pitch-data.ts                   # 200-section grid data and price logic
  basket-context.tsx              # BasketProvider + useBasket hook
  utils.ts                        # cn() utility
  stripe/
    server.ts                     # Stripe Node.js client singleton
    client.ts                     # loadStripe() promise for client-side
  supabase/
    client.ts                     # Browser Supabase client
    server.ts                     # Server Supabase client
    admin.ts                      # service_role client (webhook use only)
    middleware.ts                 # updateSession() helper
    database.types.ts             # Generated DB types
```

## Database Schema

| Table | Purpose |
|---|---|
| `profiles` | User display names and email |
| `orders` | One row per checkout — links to Stripe PaymentIntent |
| `order_items` | One row per section in an order — stores owner name + visibility |
| `purchased_sections` | Populated by webhook on successful payment — queried by pitch grid |

RLS is enabled on all tables. `purchased_sections` is publicly readable (pitch grid needs it); only the service_role key (webhook) can insert. The webhook handles race conditions via PK constraint — the first successful insert wins; losers are automatically refunded.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js with Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
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
| `/pitch` | `app/pitch/page.tsx` | Interactive 20×10 pitch grid |
| `/basket` | `app/basket/page.tsx` | Selected sections list + total — **protected** |
| `/auth/sign-in` | `app/auth/sign-in/page.tsx` | Email+password + Google OAuth sign-in |
| `/auth/sign-up` | `app/auth/sign-up/page.tsx` | Email+password + Google OAuth sign-up |
| `/auth/callback` | `app/auth/callback/route.ts` | PKCE OAuth callback — exchanges code for session |
| `/auth/complete-profile` | `app/auth/complete-profile/page.tsx` | Profile form (required after first sign-in) |
| `/auth/sign-out` | `app/auth/sign-out/route.ts` | POST — signs out and redirects to `/` |
| `/auth/auth-code-error` | `app/auth/auth-code-error/page.tsx` | OAuth error fallback |

## Key Files

| File | Purpose |
|---|---|
| `lib/types.ts` | `PitchSection` and `Profile` interfaces |
| `lib/pitch-data.ts` | 200-section grid (20×10); centre sections £100, others £50 |
| `lib/basket-context.tsx` | `BasketProvider` + `useBasket` hook (Set-based, client-only) |
| `lib/supabase/client.ts` | Browser Supabase client (`createBrowserClient`) |
| `lib/supabase/server.ts` | Server Supabase client (`createServerClient` with async cookies) |
| `lib/supabase/middleware.ts` | `updateSession()` — 3-phase: refresh → route protection → profile check |
| `lib/supabase/database.types.ts` | Generated TypeScript types for the Supabase schema |
| `middleware.ts` | Next.js middleware entry — calls `updateSession()` |
| `components/navbar.tsx` | Top nav with active-link highlight, basket count badge, and `<AuthStatus />` |
| `components/auth-status.tsx` | Client component — shows "Sign in" or email + "Sign out" |
| `components/footer.tsx` | Minimal footer with Separator |
| `components/pitch-grid.tsx` | CSS Grid layout, running count + total, "View Basket" CTA |
| `components/pitch-section-cell.tsx` | Single grid cell — green/amber/muted states |
| `components/basket-content.tsx` | Basket item list, total, clear, empty state |

## Key Conventions

- ESLint uses the new flat config format (`eslint.config.mjs`) extending `eslint-config-next` core-web-vitals and TypeScript rules.
- Tailwind v4 is configured via `globals.css` (`@import "tailwindcss"`) and CSS custom properties (`@theme inline`) — no `tailwind.config.js` file.
- ShadCN theming uses CSS variables defined in `app/globals.css` — colors use `bg-background`, `text-foreground`, `text-muted-foreground`, etc.
- ShadCN config is in `components.json` (style: default, base color: neutral, CSS variables enabled).
- The `cn` utility (`lib/utils.ts`) combines `clsx` and `tailwind-merge` — always use it for conditional class merging.
- Add new ShadCN components with `npx shadcn@latest add <component> -y`.
- Use `import type` for type-only imports (`@typescript-eslint/consistent-type-imports` is enforced).
- Use `"use client"` only where interactivity or hooks require it; server components are the default.
- No testing framework is configured yet.
- Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

## Auth

- **Package**: `@supabase/ssr` (NOT the deprecated `auth-helpers`)
- **Providers**: Email+Password and Google OAuth
- **Protected routes**: `/basket`, `/checkout` (defined in `PROTECTED_ROUTES` array in `lib/supabase/middleware.ts`)
- **Auth decision**: always use `getUser()` (contacts auth server), never `getSession()` (unverified)
- **Profile requirement**: users must complete a profile (`profiles` table) before accessing protected routes — no auto-creation trigger, manual form at `/auth/complete-profile`
- **Credentials**: stored in `.env.local` — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Google OAuth**: requires manual configuration in Supabase Dashboard → Authentication → Providers → Google; redirect URI is `https://fazbttucywkxnjesktri.supabase.co/auth/v1/callback`
- **No checkout/payment flow yet**
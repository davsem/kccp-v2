# Feature: Supabase Authentication

## Goal

Add authentication (Email+Password and Google OAuth) using Supabase so that /basket (and future /checkout) is only accessible to authenticated users who have completed a profile.

## Background & Context

- The app currently has no auth — all pages are public
- No Supabase packages, middleware, or env files exist yet
- The Supabase project exists but has zero tables
- The basket is client-side only (React context) — no persistence changes needed for this feature
- Builds on: lib/basket-context.tsx (provider pattern), components/navbar.tsx (will add auth UI), app/basket/page.tsx (to be protected)

## Research Summary

- @supabase/ssr is the correct package for Next.js App Router (NOT the deprecated auth-helpers)
- Three client factories needed: browser, server, middleware — each with different cookie handling
- Middleware must call getUser() (NOT getSession()) for authorization — it contacts the auth server
- OAuth uses PKCE flow: redirect → callback route handler → exchangeCodeForSession(code)
- cookies() from next/headers is async in Next.js 16

## Approach

Layer Supabase auth on top of the existing architecture:
1. Database: profiles table with RLS (no auto-creation trigger — manual profile form)
2. Middleware: Three-phase — session refresh → route protection → profile check
3. Auth pages: Dedicated /auth/* routes using existing ShadCN components
4. Navbar: Add AuthStatus component showing sign-in link or user info + sign-out

## User Decisions

- Auth methods: Email+Password AND Google OAuth
- Profile fields: First Name, Last Name, Email
- Profile creation: Manual form after sign-up (pre-fill from Google when available)
- Unauthenticated → /basket: Redirect to /auth/sign-in?redirectTo=/basket
- Email confirmation: Required for email+password sign-up
- Password minimum: 8 characters
- Auth UI: Dedicated pages at /auth/sign-in and /auth/sign-up

## Implementation Tasks

### Phase 0: Setup

- [ ] Install @supabase/supabase-js and @supabase/ssr
- [ ] Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Add ShadCN Label component via CLI
- [ ] Configure Google OAuth in Supabase Dashboard (manual step — will provide instructions)
- [ ] Set minimum password length to 8 in Supabase Dashboard Auth settings

### Phase 1: Database

- [ ] Apply migration create_profiles_table — profiles table with RLS policies (select/insert/update own row)

### Phase 2: Supabase Client Utilities

- [ ] Create lib/supabase/client.ts — browser client (createBrowserClient)
- [ ] Create lib/supabase/server.ts — server client (createServerClient with cookies())
- [ ] Create lib/supabase/middleware.ts — updateSession() helper with 3-phase logic:
  - a. Session refresh via getUser()
  - b. Route protection: unauthenticated → redirect to sign-in
  - c. Profile check: no profile → redirect to complete-profile

### Phase 3: Middleware

- [ ] Create middleware.ts at project root — calls updateSession(), matcher excludes static assets

### Phase 4: Auth Pages

- [ ] app/auth/sign-in/page.tsx — email+password form + Google OAuth button, redirectTo passthrough
- [ ] app/auth/sign-up/page.tsx — email+password form + Google OAuth button, email confirmation message
- [ ] app/auth/callback/route.ts — PKCE code exchange, redirects to next param
- [ ] app/auth/complete-profile/page.tsx — first/last name form, pre-fills from Google user_metadata, inserts into profiles, redirects to redirectTo
- [ ] app/auth/auth-code-error/page.tsx — error fallback with link to sign-in

### Phase 5: Sign-Out & Navbar

- [ ] app/auth/sign-out/route.ts — POST handler that signs out and redirects to /
- [ ] components/auth-status.tsx — client component: shows "Sign In" or user name + "Sign Out"
- [ ] Modify components/navbar.tsx — render <AuthStatus /> in the nav bar

### Phase 6: Types

- [ ] Add Profile interface to lib/types.ts
- [ ] Generate Supabase TypeScript types to lib/supabase/database.types.ts and use in client factories

## Files to Create / Modify

### New Files

| File | Purpose |
|---|---|
| `.env.local` | Supabase credentials |
| `lib/supabase/client.ts` | Browser client factory |
| `lib/supabase/server.ts` | Server client factory |
| `lib/supabase/middleware.ts` | updateSession helper |
| `lib/supabase/database.types.ts` | Generated TypeScript types |
| `middleware.ts` | Next.js middleware entry |
| `app/auth/sign-in/page.tsx` | Sign-in page |
| `app/auth/sign-up/page.tsx` | Sign-up page |
| `app/auth/callback/route.ts` | OAuth callback |
| `app/auth/complete-profile/page.tsx` | Profile form |
| `app/auth/auth-code-error/page.tsx` | Error page |
| `app/auth/sign-out/route.ts` | Sign-out handler |
| `components/auth-status.tsx` | Navbar auth UI |
| `components/ui/label.tsx` | ShadCN Label (via CLI) |

### Modified Files

| File | Change |
|---|---|
| `components/navbar.tsx` | Add `<AuthStatus />` |
| `lib/types.ts` | Add Profile interface |
| `package.json` | Add Supabase dependencies |

## Auth Flow Sequences

**Email+Password sign-up:**
`/auth/sign-up` → `signUp()` → confirmation email → click link → `/auth/callback` → `/auth/complete-profile` → fill name → insert profile → redirect to `/basket`

**Google OAuth (new user):**
`/auth/sign-in` → "Sign in with Google" → Google consent → `/auth/callback` → redirect to `/basket` → middleware: no profile → `/auth/complete-profile?redirectTo=/basket` → fill name (pre-filled) → redirect to `/basket`

**Returning user:**
`/basket` → middleware: no session → `/auth/sign-in?redirectTo=/basket` → sign in → middleware: profile exists → `/basket`

## Constraints & Hard Rules

- Use @supabase/ssr only (NOT deprecated auth-helpers)
- Always getUser() for auth decisions, never getSession()
- No auto-profile creation trigger — manual form only
- middleware.ts must be at project root
- All promises must be awaited (ESLint enforced)
- Use `import type` for type-only imports (ESLint enforced)
- Don't modify BasketProvider or basket context
- PROTECTED_ROUTES array must be easy to extend for /checkout

## Testing Plan

Manual verification (no test framework configured):
1. Email+password sign-up → email confirmation → profile completion → basket access
2. Email+password sign-in for returning user
3. Google OAuth full flow (new user and returning user)
4. Unauthenticated /basket redirects to sign-in with redirectTo preserved
5. Authenticated user without profile redirects to complete-profile
6. Sign-out clears session, protected routes redirect again
7. Public routes (/, /pitch) remain accessible without auth
8. `npm run lint` passes with no violations

## Open Questions

- Google OAuth provider setup requires manual configuration in both Google Cloud Console and Supabase Dashboard — will provide step-by-step instructions during implementation

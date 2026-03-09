# Feature: Server-Side Auth Display (Eliminate Navbar Flash)

## Goal
Move the auth state display in the navbar from client-side to server-side rendering, eliminating the flash where "Sign in" briefly appears before the authenticated user's email is shown.

## Background & Context
- The navbar currently flashes "Sign in" on every page load for authenticated users because `AuthStatus` initialises with `user = null` and fetches via `useEffect` after hydration.
- `Navbar` (`components/navbar.tsx`) is a `"use client"` component because it uses `usePathname()` and `useBasket()` — this drags auth rendering client-side unnecessarily.
- The middleware (`lib/supabase/middleware.ts`) already calls `supabase.auth.getUser()` on every request; re-reading the user in a server component is cheap (session cookie already refreshed).
- `BasketProvider` (`lib/basket-context.tsx`) wraps the whole layout — the basket badge must stay client-side.
- The sign-in link must preserve `redirectTo` with the current pathname (user preference).

## Research Summary
- `components/auth-status.tsx` — client component, `useState<User | null>(null)`, fetches user in `useEffect`, subscribes to `onAuthStateChange`. This is the root cause of the flash.
- `components/navbar.tsx` — client component, uses `usePathname()` (active link styling) and `useBasket()` (basket count badge). These can be extracted into small client leaf components.
- `app/layout.tsx` — server component; renders `<BasketProvider> → <Navbar>`. Structure can stay the same once Navbar becomes a server component.
- `lib/supabase/server.ts` — provides `createClient()` for server-side Supabase access with async cookies. Used in the new server Navbar.
- `app/auth/complete-profile/page.tsx` — client component that uses `useEffect` to prefill form fields from `getUser()`. Same flash pattern, can be fixed alongside.

## Approach
Split the monolithic client Navbar into a **server component shell** with small **client leaf components**. The server Navbar fetches the user via `createClient()` (server) and renders auth state directly in the initial HTML. Client children handle only what genuinely requires browser APIs.

A tiny `AuthStateListener` client component subscribes to `onAuthStateChange` and calls `router.refresh()` to re-render the server Navbar after sign-in/sign-out events.

To support `redirectTo` in the sign-in link, the middleware will forward the pathname as an `x-pathname` response header, which the server component reads via `headers()`.

**Alternatives rejected:**
- Keeping `AuthStatus` client-side but initialising from a cookie value — fragile, requires manual cookie parsing.
- Using a React context to pass user from layout to AuthStatus — still client-side, still flashes.

## Architecture

**Before:**
```
layout.tsx (server) → BasketProvider (client) → Navbar (client) → AuthStatus (client, useEffect)
```

**After:**
```
layout.tsx (server) → BasketProvider (client) → Navbar (server, async, fetches user)
  ├─ NavLinks (client)             — usePathname, active link styling
  ├─ BasketBadge (client)          — useBasket count badge + Basket link
  ├─ AuthStatusServer (server)     — sign-in link or user dropdown, zero flash
  │    └─ AuthStatusDropdown (client) — dropdown interactivity only
  └─ AuthStateListener (client)    — router.refresh() on auth changes
```

## Implementation Tasks

- [ ] **Middleware** — add `x-pathname` header in `lib/supabase/middleware.ts` so server components can read the current pathname
- [ ] **Create `components/nav-links.tsx`** — client component with `usePathname()` for Home + The Pitch links
- [ ] **Create `components/basket-badge.tsx`** — client component with `useBasket()` for Basket link + count badge
- [ ] **Create `components/auth-status-dropdown.tsx`** — client component wrapping ShadCN `DropdownMenu` for signed-in user; receives `email` prop
- [ ] **Create `components/auth-status-server.tsx`** — server component; receives `user` and `pathname` props; renders sign-in link (with `redirectTo`) or `<AuthStatusDropdown />`
- [ ] **Create `components/auth-state-listener.tsx`** — client component (renders null); subscribes to `onAuthStateChange`, calls `router.refresh()` on `SIGNED_IN` / `SIGNED_OUT` / `TOKEN_REFRESHED`
- [ ] **Rewrite `components/navbar.tsx`** — remove `"use client"`, make `async`, read user via `createClient()` + `getUser()`, read pathname from `headers()`, compose new child components
- [ ] **Delete `components/auth-status.tsx`** — fully replaced
- [ ] **Rewrite `app/auth/complete-profile/page.tsx`** — convert page wrapper to async server component; fetch user + redirect if unauthenticated; pass user data as props
- [ ] **Create `components/complete-profile-form.tsx`** — extracted client form; receives `email`, `fullName`, `givenName`, `familyName`, `redirectTo` as props; removes `useEffect` prefill
- [ ] **Update tests** — see Testing Plan below

## Files to Create / Modify

| File | Action |
|---|---|
| `lib/supabase/middleware.ts` | Edit — add `x-pathname` response header |
| `components/navbar.tsx` | Rewrite — server component (async) |
| `components/auth-status.tsx` | Delete |
| `components/nav-links.tsx` | Create (client) |
| `components/basket-badge.tsx` | Create (client) |
| `components/auth-status-server.tsx` | Create (server) |
| `components/auth-status-dropdown.tsx` | Create (client) |
| `components/auth-state-listener.tsx` | Create (client) |
| `app/auth/complete-profile/page.tsx` | Rewrite — server wrapper |
| `components/complete-profile-form.tsx` | Create (client) — extracted form |
| `components/__tests__/navbar.test.tsx` | Rewrite for async server component |
| `components/__tests__/auth-status.test.tsx` | Delete |
| `components/__tests__/nav-links.test.tsx` | Create |
| `components/__tests__/basket-badge.test.tsx` | Create |
| `components/__tests__/auth-status-server.test.tsx` | Create |
| `components/__tests__/auth-status-dropdown.test.tsx` | Create |
| `components/__tests__/auth-state-listener.test.tsx` | Create |

## Constraints & Hard Rules
- `app/layout.tsx` must not change — `BasketProvider` stays wrapping everything including the (now server) Navbar; client children of the server Navbar hydrate within that provider tree and retain basket context access.
- Do not use `getSession()` — always `getUser()` (contacts auth server, per project convention).
- The sign-in link must include `redirectTo` with the current pathname.
- Follow existing ShadCN + Tailwind CSS variable patterns.
- Use `import type` for type-only imports (`@typescript-eslint/consistent-type-imports` enforced).

## Testing Plan

**Unit/component tests (`npm test`):**
- `navbar.test.tsx` — mock `@/lib/supabase/server` and `next/headers`; await async component; assert it renders NavLinks, BasketBadge, AuthStatusServer, AuthStateListener
- `auth-status-server.test.tsx` — prop-based: `user=null` renders sign-in link with `redirectTo`; `user=<User>` renders `AuthStatusDropdown`
- `auth-status-dropdown.test.tsx` — renders email, Profile link, Sign out form
- `auth-state-listener.test.tsx` — subscribes to `onAuthStateChange`, calls `router.refresh()` on auth events
- `nav-links.test.tsx` — active link class applied to current pathname (mock `usePathname`)
- `basket-badge.test.tsx` — badge shows when `count > 0` (mock `useBasket`)

**Manual verification:**
1. Load pages signed out → "Sign in" renders immediately with no flash
2. Load pages signed in → email renders immediately with no flash
3. Sign in → navbar updates to show email
4. Sign out → navbar updates to show "Sign in"
5. Sign-in link from navbar includes correct `?redirectTo=<current path>`
6. Basket badge count still works
7. Active link highlighting still works
8. Complete-profile form pre-fills without flash

**Run:** `npm run typecheck && npm run lint && npm test`

## Open Questions
- None — all decisions made. (`redirectTo` via `x-pathname` header; `router.refresh()` for post-auth-event re-render.)

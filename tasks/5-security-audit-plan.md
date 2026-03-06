# Security Audit Fixes

## Goal

Fix critical and high-severity vulnerabilities identified in the security audit: open redirect attacks, missing security headers, unvalidated profile inputs, and raw error message exposure.

## Background & Context

- Security audit identified open redirect vulnerabilities across all auth pages — `redirectTo`/`next` URL params are used without validation
- `next.config.ts` is empty — no security headers (CSP, HSTS, X-Frame-Options, etc.)
- Profile form fields (`firstName`, `lastName`) are inserted/updated into the DB with no validation
- Raw Supabase error messages are displayed in the UI, leaking internal details
- The middleware (`lib/supabase/middleware.ts`) is **already safe** — it uses `request.nextUrl.pathname`, not user-supplied params
- Lower-priority issues deferred: CSRF on sign-out (mitigated by SameSite cookies), rate limiting (Supabase built-in), session timeout, RLS (database config), CSP (complex with ShadCN/Tailwind inline styles)

## Research Summary

**Open redirect locations:**
- `app/auth/sign-in/page.tsx:14` — `const redirectTo = searchParams.get("redirectTo") ?? "/"` → used in `router.push(redirectTo)` (line 36) and passed into OAuth URL (line 47)
- `app/auth/sign-up/page.tsx:13` — same pattern, passed into OAuth and email confirmation URLs
- `app/auth/complete-profile/page.tsx:13` — same pattern, used in `router.push(redirectTo)` (line 69)
- `app/auth/callback/route.ts:7` — `const next = searchParams.get("next") ?? "/"` → used in `NextResponse.redirect(\`${origin}${next}\`)` (line 14) — **most critical**, server-side, constructs full URL

**No existing validation utilities** — `lib/utils.ts` only contains `cn()`.

**Error display pattern** (same in all auth pages):
```typescript
{error && <p className="text-sm text-destructive">{error}</p>}
```

**Existing tests to update:**
- `app/auth/__tests__/sign-in.test.tsx:111` — asserts `"Invalid login credentials"` (raw), will need updating
- `app/auth/__tests__/callback-route.test.ts` — no open redirect test exists yet

## Approach

Centralise all security utilities in `lib/utils.ts` (existing file), apply them at the point where params are first read. Sanitise errors at the point they're set. This keeps each fix minimal and surgical with no structural changes.

## Implementation Tasks

- [ ] **Step 1** — Add `safeRedirectPath()`, `validateName()`, `sanitizeAuthError()` to `lib/utils.ts`
- [ ] **Step 2** — Apply `safeRedirectPath()` + `sanitizeAuthError()` to `app/auth/sign-in/page.tsx`
- [ ] **Step 3** — Apply `safeRedirectPath()` + `sanitizeAuthError()` to `app/auth/sign-up/page.tsx`
- [ ] **Step 4** — Apply `safeRedirectPath()` + `validateName()` + `sanitizeAuthError()` to `app/auth/complete-profile/page.tsx`
- [ ] **Step 5** — Apply `safeRedirectPath()` to `app/auth/callback/route.ts` (server-side, highest risk)
- [ ] **Step 6** — Apply `validateName()` + `sanitizeAuthError()` to `app/profile/page.tsx`
- [ ] **Step 7** — Add security headers to `next.config.ts`
- [ ] **Step 8** — Add unit tests for new utilities in `lib/__tests__/utils.test.ts`
- [ ] **Step 9** — Update broken existing tests
- [ ] **Step 10** — Run `npm run typecheck && npm run lint && npm test`

## Files to Create / Modify

- `lib/utils.ts` — add 3 new exported utility functions
- `app/auth/sign-in/page.tsx` — import + apply utilities
- `app/auth/sign-up/page.tsx` — import + apply utilities
- `app/auth/complete-profile/page.tsx` — import + apply utilities
- `app/auth/callback/route.ts` — import + apply `safeRedirectPath`
- `app/profile/page.tsx` — import + apply utilities
- `next.config.ts` — add `headers()` function
- `lib/__tests__/utils.test.ts` — extend with 3 new `describe` blocks
- `app/auth/__tests__/sign-in.test.tsx` — update error text assertion (line 111)
- `app/auth/__tests__/callback-route.test.ts` — add open redirect attack test

## Utility Specifications

### `safeRedirectPath(path: string): string`
- Returns `path` trimmed if it starts with `/` and does not start with `//`
- Checks after `decodeURIComponent` to catch encoded attacks (e.g. `/%2F%2Fevil.com`)
- Rejects any URI scheme via regex (`/^[a-zA-Z][a-zA-Z0-9+.-]*:/`)
- Returns `"/"` as safe fallback for any invalid input or decode failure

### `validateName(value: string): string | null`
- Trims whitespace
- Returns trimmed value if length is 1–100 chars, otherwise `null`
- No character restrictions (supports hyphens, apostrophes, accented/non-Latin chars)

### `sanitizeAuthError(message: string): string`
- Maps known Supabase messages to user-friendly text:
  - `"Invalid login credentials"` → `"Incorrect email or password."`
  - `"Email not confirmed"` → `"Please check your email and confirm your account."`
  - `"User already registered"` → `"An account with this email already exists."`
  - `"Email rate limit exceeded"` → `"Too many attempts. Please try again later."`
  - `"For security purposes, you can only request this after"` (partial match) → `"Too many attempts. Please wait a moment and try again."`
- Falls back to `"Something went wrong. Please try again."` for unknown errors

## Security Headers (`next.config.ts`)

Apply to all routes (`source: "/(.*)"`) — no new packages needed:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |
| `X-DNS-Prefetch-Control` | `on` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |

CSP deferred — complex to configure correctly with Next.js + ShadCN inline styles.

## Constraints & Hard Rules

- No new npm packages — all fixes use existing dependencies and TypeScript
- Do not change middleware.ts or lib/supabase/middleware.ts — already safe
- Do not change the `PROTECTED_ROUTES` array or route protection logic
- `sanitizeAuthError` must use partial matching for rate-limit errors (Supabase appends dynamic suffixes)

## Testing Plan

**New tests** (`lib/__tests__/utils.test.ts`):
- `safeRedirectPath`: valid paths, absolute URLs, protocol-relative, `javascript:`, `data:`, encoded attacks, empty/whitespace
- `validateName`: valid/trimmed, empty, over-limit, special characters
- `sanitizeAuthError`: exact matches, partial matches, unknown errors

**Updated tests**:
- `app/auth/__tests__/sign-in.test.tsx:111`: `"Invalid login credentials"` → `"Incorrect email or password."`
- `app/auth/__tests__/callback-route.test.ts`: add test — `?next=https://evil.com` → redirects to `http://localhost:3000/`

**Verification commands:**
```bash
npm run typecheck
npm run lint
npm test
```

Manual: start dev server, check response headers in browser DevTools (Network tab).

## Open Questions

- Should CSP be added in a follow-up task? (Recommended — requires careful allowlist for Google Fonts, Supabase, inline styles)
- Should CSRF protection be added to sign-out in a future task, or is SameSite cookie mitigation sufficient?

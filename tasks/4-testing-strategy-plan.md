# Testing Strategy Plan

## Context

The KCCP-v2 project has zero test coverage. The user is hitting auth bugs (auth-code-error page) and wants confidence in both auth flows and core pitch/basket features. This plan adds Vitest (unit/component) and Cypress (E2E) testing with mocked Supabase clients.

---

## Packages to Install

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event cypress
```

---

## File Structure

```
vitest.config.ts                          # Vitest config (jsdom, path aliases, setup file)
cypress.config.ts                         # Cypress config (baseUrl localhost:3000)
cypress/tsconfig.json                     # Cypress TS config
cypress/support/e2e.ts                    # Cypress support (custom commands)
tests/
  setup.ts                               # Vitest global setup (jest-dom matchers, env vars, cleanup)
  mocks/
    supabase.ts                          # Reusable mock factory for Supabase clients
    next-navigation.ts                   # Mocks for useRouter, usePathname, useSearchParams
```

## npm Scripts to Add

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "cypress run",
"test:e2e:open": "cypress open"
```

---

## Implementation Phases

### Phase 1: Foundation — Config & Mock Setup
1. Install devDependencies
2. Create `vitest.config.ts` — jsdom environment, `@/` path alias, `tests/setup.ts` reference, coverage config (exclude `components/ui/`, `database.types.ts`)
3. Create `tests/setup.ts` — import `@testing-library/jest-dom/vitest`, auto-cleanup, stub `NEXT_PUBLIC_SUPABASE_*` env vars
4. Create `tests/mocks/supabase.ts` — factory function `createMockSupabaseClient(authConfig, dbConfig)` returning chainable mock with `auth.getUser()`, `signInWithPassword()`, `signInWithOAuth()`, `signUp()`, `signOut()`, `exchangeCodeForSession()`, `onAuthStateChange()`, `from().select().eq().single()`. Exports `TEST_USER` and `TEST_PROFILE` fixtures.
5. Create `tests/mocks/next-navigation.ts` — mock `useRouter`, `usePathname`, `useSearchParams`
6. Add npm scripts to `package.json`
7. **Verify**: `npx vitest run` exits cleanly with 0 tests

### Phase 2: Pure Logic Unit Tests
8. `lib/__tests__/utils.test.ts` — `cn()` merging, Tailwind dedup, falsy filtering
9. `lib/__tests__/pitch-data.test.ts` — 200 sections, centre pricing (£100), edge pricing (£50), `getSectionById()`, grid constants

### Phase 3: Context/Hook Tests
10. `lib/__tests__/basket-context.test.tsx` — `useBasket()` via `renderHook`: add, remove, toggle, clear, isSelected, count, throw outside provider

### Phase 4: Middleware Tests
11. `lib/supabase/__tests__/middleware.test.ts` — mock `@supabase/ssr` directly (middleware imports `createServerClient` from there, not from `@/lib/supabase/server`). Test all 3 phases:
    - Phase A: always calls `getUser()`
    - Phase B: unauthenticated + protected route → redirect to `/auth/sign-in?redirectTo=...`
    - Phase C: authenticated + protected + no profile → redirect to `/auth/complete-profile?redirectTo=...`
    - Happy path: authenticated + profile → passes through

### Phase 5: Component Tests
12. `components/__tests__/footer.test.tsx` — static render, copyright year
13. `components/__tests__/pitch-section-cell.test.tsx` — click toggle, visual states, disabled handling (wrap in `BasketProvider`)
14. `components/__tests__/basket-content.test.tsx` — empty state, item list, total, clear button
15. `components/__tests__/pitch-grid.test.tsx` — renders 200 cells, count/total updates on selection
16. `components/__tests__/navbar.test.tsx` — active link highlight, basket badge count, brand link
17. `components/__tests__/auth-status.test.tsx` — unauthenticated shows "Sign in", authenticated shows email + dropdown, `onAuthStateChange` subscription/cleanup

### Phase 6: Page/Route Tests
18. `app/auth/__tests__/sign-in.test.tsx` — form renders, `signInWithPassword` called, error display, Google OAuth, redirect handling, loading state
19. `app/auth/__tests__/sign-up.test.tsx` — form renders, `signUp` called, confirmation message shown, Google OAuth
20. `app/auth/__tests__/complete-profile.test.tsx` — pre-fill from Google metadata, profile insert, redirect on success
21. `app/auth/__tests__/callback-route.test.ts` — valid code → `exchangeCodeForSession` → redirect to `next`, no code → redirect to error page
22. `app/auth/__tests__/sign-out-route.test.ts` — calls `signOut()`, redirects to `/`

### Phase 7: Cypress E2E Setup & Tests
23. Create `cypress.config.ts`, `cypress/tsconfig.json`, `cypress/support/e2e.ts` (with `getBySel` command)
24. `cypress/e2e/pitch-flow.cy.ts` — visit /pitch, click cells, verify selection states and counter updates
25. `cypress/e2e/basket-flow.cy.ts` — select sections → navigate to basket → verify items/total → clear basket → empty state
26. `cypress/e2e/auth-redirect.cy.ts` — visit /profile unauthenticated → redirected to /auth/sign-in with redirectTo param

### Phase 8: Lint/Type Check
27. Ensure `npm run lint` and `npm run typecheck` pass with test files included

---

## Key Mocking Patterns

- **Supabase browser client** (components): `vi.mock("@/lib/supabase/client", () => ({ createClient: () => mockSupabase }))`
- **Supabase server client** (route handlers): `vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn().mockResolvedValue(mockSupabase) }))`
- **Supabase SSR** (middleware): `vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn().mockReturnValue(mockSupabase) }))`
- **BasketProvider wrapper**: wrap renders in `<BasketProvider>` for all pitch/basket component tests
- **next/link**: mock as plain `<a>` element

---

## Verification

After each phase: `npx vitest run` — all tests pass.
After Phase 7: start dev server + `npx cypress run` — all E2E tests pass.
Final: `npm run lint && npm run typecheck && npm test` — all green.

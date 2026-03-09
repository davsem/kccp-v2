# Plan: Persist Basket to Cookie

## Context

The basket is stored in React Context as an in-memory `Set<string>` with no persistence. When a new user selects squares on `/pitch`, clicks "View Basket", then clicks "Proceed to Checkout", they're redirected through the auth flow (sign-in → possibly complete-profile → back to /checkout). Each redirect causes a full page load, which destroys the in-memory basket state. The user arrives back with an empty basket.

**Goal**: Persist the basket to a cookie with a 24-hour expiry so it survives page loads, auth redirects, and browser restarts.

## Changes

### 1. Modify `lib/basket-context.tsx`

This is the **only file** that needs code changes.

**a) Cookie helper functions:**
- `getBasketCookie(): string[]` — parse the `kccp-basket` cookie, return array of section IDs (or empty array if missing/malformed)
- `setBasketCookie(ids: string[])` — set `kccp-basket` cookie with JSON-encoded array, `path=/`, `max-age=86400` (24h), `SameSite=Lax`
- `clearBasketCookie()` — delete the cookie by setting `max-age=0`
- Use `document.cookie` API directly (no external deps needed)

**b) Hydration on mount:**
- Initialize state with empty set (SSR-safe)
- `useEffect` on mount reads the cookie and sets state from it
- Standard hydration pattern — no mismatch warnings

**c) Sync on change:**
- `useEffect` watching `selectedIds` writes the cookie whenever it changes
- `clear()` also calls `clearBasketCookie()`

**d) Cookie size consideration:**
- Max 200 section IDs (e.g., `["A1","A2",...,"J20"]`) ≈ ~1.2KB JSON — well within 4KB cookie limit

### 2. Implementation Detail

```
State flow:
  Initial render → empty Set (matches server)
  useEffect (mount) → read cookie → setState with persisted ids
  useEffect (selectedIds change) → write cookie
  clear() → setState empty + delete cookie
```

Key constants:
- `COOKIE_NAME = "kccp-basket"`
- `MAX_AGE_SECONDS = 86400` (24 hours)

### 3. Update Tests

- **File**: `lib/__tests__/basket-context.test.tsx` (if exists, otherwise tests that exercise basket)
- Mock `document.cookie` in test setup
- Test: items persist after re-mount
- Test: `clear()` removes cookie
- Test: malformed cookie gracefully returns empty basket

## Files to Modify

| File | Change |
|------|--------|
| `lib/basket-context.tsx` | Add cookie read/write with 24h expiry |
| Relevant test file(s) | Add persistence tests |

## Verification

1. `npm run typecheck` — no type errors
2. `npm test` — all existing + new tests pass
3. `npm run lint` — no lint errors
4. Manual flow test: select squares → view basket → checkout → sign in → verify basket items are preserved

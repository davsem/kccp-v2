# Feature: Pitch Page Supabase Error Handling

## Goal
When the Supabase fetch for `purchased_sections` fails, show a clear error message instead of silently rendering an interactive pitch grid where all sections appear available (including already-sold ones).

## Background & Context
- `app/pitch/page.tsx` currently discards the `error` value from the Supabase query, falling back to `data ?? []` — meaning a network failure or RLS error renders every section as available and clickable.
- This is dangerous: users could add sold sections to their basket, and would only discover the conflict at the Stripe webhook stage (auto-refund via PK constraint).
- The fix is isolated to the server component; grid components are unaffected.

## Research Summary
- `app/pitch/page.tsx`: Destructures only `{ data }` from the Supabase query — `error` is silently ignored.
- `components/pitch-grid.tsx`: Accepts `purchasedSections?: PurchasedSection[]` defaulting to `[]`; no internal error state.
- `components/pitch-section-cell.tsx`: Trusts `isSold` prop completely — no secondary check.
- No existing error boundaries: no `app/pitch/error.tsx` or any `error.tsx` in the app tree.
- Existing pitch tests: `components/__tests__/pitch-grid.test.tsx`, `components/__tests__/pitch-section-cell.test.tsx`, `lib/__tests__/pitch-data.test.ts` — all test the happy path only.

## Approach
Check `error` from the Supabase query in the server component. If truthy, render an inline error UI (heading, explanation, "Try again" link) instead of `<PitchGrid />`. No new component file needed — the error UI is small enough to inline.

Alternatives considered:
- **Next.js `error.tsx` boundary**: only catches thrown errors, not Supabase's returned `error` object — rejected.
- **Disabled/greyed-out grid**: user preference was error message only — rejected.

## Implementation Tasks
- [ ] `app/pitch/page.tsx` — destructure `error` alongside `data`; render error UI if `error` is truthy; otherwise render `<PitchGrid />` as today
- [ ] `app/pitch/__tests__/page.test.tsx` — new test file with success and error path tests

## Files to Create / Modify
- `app/pitch/page.tsx` — add error check + error UI (~15 lines)
- `app/pitch/__tests__/page.test.tsx` — new test file

## Constraints & Hard Rules
- Do not change `components/pitch-grid.tsx` or `components/pitch-section-cell.tsx`
- Follow existing Supabase server mock pattern: `vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn().mockResolvedValue(mockSupabase) }))`
- Error UI must not render any interactive grid cells (no basket interaction possible in error state)

## Testing Plan

### New: `app/pitch/__tests__/page.test.tsx`
Call `PitchPage()` directly (server component) and render the returned JSX. Mock `@/lib/supabase/server`.

1. **Success path — renders grid**
   - Mock: `{ data: [{ section_id: "R1C1", owner_name: null, show_owner_name: false }], error: null }`
   - Assert: page heading "The Pitch" is visible
   - Assert: "sections selected" text is present (confirms `<PitchGrid />` rendered)

2. **Error path — renders error UI, no grid**
   - Mock: `{ data: null, error: { message: "connection failed" } }`
   - Assert: "Unable to load pitch data" heading is visible
   - Assert: "Try again" link pointing to `/pitch` is present
   - Assert: "sections selected" text is **not** present

3. **Error path — no selectable cells**
   - Same error mock
   - Assert: no `<button>` elements rendered (guards against accidental basket interaction)

### Existing tests — no changes needed
- `components/__tests__/pitch-grid.test.tsx`
- `components/__tests__/pitch-section-cell.test.tsx`
- `lib/__tests__/pitch-data.test.ts`

### Verification steps
1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. Manual: temporarily use a wrong table name in `page.tsx`, confirm error UI renders
5. Manual: restore query, confirm grid renders with sold sections marked

## Open Questions
None — requirements confirmed.

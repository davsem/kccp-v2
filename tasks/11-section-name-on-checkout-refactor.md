# Feature: Section Owner Names — Checkout Step 1 Refactor

## Goal
Simplify and improve the "Name Your Sections" checkout step by removing the bulk toggle, displaying owner names directly on section cards, and updating the anonymous display logic.

## Background & Context
- The current checkout Step 1 has a "Use XX for all sections" bulk toggle which is no longer needed
- Owner names are only visible when editing — they should be shown on the card at all times
- The "Name differently" button needs clearer wording
- The "Show name publicly on pitch" checkbox UX is inverted — users should opt into anonymity, not out of it
- Key files: `components/checkout/section-owner-names.tsx`, `components/__tests__/section-owner-names.test.tsx`
- The `SectionOwnerConfig` type (`lib/types.ts`) and its contract with downstream components must not change

## Research Summary
- `section-owner-names.tsx`: manages `useNameForAll` bool state + per-section `{ ownerName, showName, override }` config map
- Bulk toggle drives `handleBulkToggle()` which resets all configs to `defaultName` when switched back on
- "Name differently" button only appears when `useNameForAll` is true and no override exists
- Owner name Input only renders when `isOverriding` is true (`!useNameForAll || config.override`)
- "Show name publicly on pitch" defaults to checked (`showName: true`), maps to `show_owner_name` in output
- `handleContinue()` outputs `SectionOwnerConfig[]` — unchanged type must be preserved
- 7 tests in `section-owner-names.test.tsx` covering bulk toggle, override, and checkbox behaviour

## Approach
Remove the `useNameForAll` state and bulk toggle UI entirely. Simplify configs to track only `ownerName` and `showName` per section. Always display the current `ownerName` on the card. Use `override` bool to toggle the edit input open/closed. Invert the checkbox display only (internal `showName` state is unchanged; `checked` maps to `!showName`).

## Implementation Tasks
- [ ] Remove `useNameForAll` state and `handleBulkToggle` function
- [ ] Remove bulk toggle UI block (Switch + Label)
- [ ] Remove `Switch` import
- [ ] Simplify per-section config initial state (keep `ownerName`, `showName`; keep `override` for open/close of edit input)
- [ ] Update `handleContinue` — always use `configs[id].ownerName`, no bulk logic
- [ ] Show `ownerName` as text on each card (below section ID / price)
- [ ] Rename "Name differently" button → "Change sponsor name"; position it after the owner name text
- [ ] Change button visibility: show when NOT currently overriding (i.e. `!config.override`), always shown regardless of former bulk state
- [ ] Change checkbox label: "Show name publicly on pitch" → "Keep anonymous"
- [ ] Invert checkbox `checked` value: `checked={!config.showName}`, `onCheckedChange`: checked → `showName = false`, unchecked → `showName = true`
- [ ] Default `showName` remains `true` (public by default; "Keep anonymous" unchecked by default)
- [ ] Update tests — see Testing Plan

## Files to Create / Modify
- `components/checkout/section-owner-names.tsx` — all UI/logic changes
- `components/__tests__/section-owner-names.test.tsx` — update existing + add new tests

## Constraints & Hard Rules
- Do NOT change `SectionOwnerConfig` type (`lib/types.ts`) — downstream components depend on it
- Do NOT touch `checkout-content.tsx`, `billing-payment.tsx`, `order-review.tsx`, or the payment intent API
- `show_owner_name` output from `handleContinue` must still map correctly (true = public, false = anonymous)

## Testing Plan

### Remove / update existing tests
- Remove: "shows default name in the bulk-name label" (bulk toggle removed)
- Remove: "resetting bulk toggle restores default name for all sections" (bulk toggle removed)
- Update: "calls onContinue with default name" — remove bulk toggle interaction, just click Continue
- Update: "shows per-section input when 'Name differently' is clicked" → query by "Change sponsor name"
- Update: "calls onContinue with overridden name" → use "Change sponsor name" button
- Update: "toggling show_owner_name checkbox" → query "Keep anonymous" label; verify checked = `show_owner_name: false`

### Add new tests
- Owner name (defaultName) is rendered on each card on initial load
- "Keep anonymous" checkbox is unchecked by default; `onContinue` produces `show_owner_name: true`
- Checking "Keep anonymous" produces `show_owner_name: false` in `onContinue` output
- Clicking "Change sponsor name" shows the Input; editing it updates the owner name on the card

### Manual verification
1. `npm run typecheck` — no errors
2. `npm test` — all tests pass
3. `npm run lint` — no lint errors
4. Visit `/checkout` with items in basket and confirm:
   - No bulk toggle visible
   - Owner name displayed on each card
   - "Change sponsor name" opens input; saving updates displayed name
   - "Keep anonymous" unchecked by default; checking it persists `show_owner_name: false` through checkout

## Open Questions
None — all clarified with the user.

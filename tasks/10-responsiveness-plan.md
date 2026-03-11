# Feature: Mobile Responsiveness

## Goal
Make every route usable on phones (375px+) and tablets (768px). The site currently overflows on small screens — most critically the navbar and the pitch grid.

## Background & Context
- The navbar renders all links, basket badge, and auth status in a single horizontal row with no breakpoints — it squishes/overflows on small screens.
- The pitch grid (`components/pitch-grid.tsx`) has a hardcoded `min-w-[768px]` that forces horizontal scroll on any device smaller than 768px.
- Various pages use large fixed text sizes (`text-5xl`, `text-3xl`) and excessive vertical padding (`py-24`, `py-16`) with no mobile variants.
- Tailwind v4 is configured via PostCSS with standard breakpoints: `sm` (640px), `md` (768px), `lg` (1024px).
- ShadCN UI components live in `components/ui/`. The `Sheet` component (needed for mobile nav drawer) is **not yet installed**.
- `md` (768px) is used as the primary mobile/desktop boundary, consistent with the existing pitch grid min-width.

## Research Summary
Issues found by severity:

| Severity | Component | Issue |
|---|---|---|
| Critical | `components/navbar.tsx` | No hamburger menu; all items always visible; no responsive breakpoints |
| Critical | `components/pitch-grid.tsx` | Hardcoded `min-w-[768px]` forces horizontal scroll |
| Critical | `components/footer.tsx` | `justify-between` with no flex-col stacking on mobile |
| High | `app/page.tsx` | `text-5xl` heading, `py-24` — too large on mobile |
| High | `components/checkout/billing-payment.tsx:89` | `grid-cols-2` hardcoded for city/postcode |
| Medium | `components/basket-content.tsx` | Action buttons don't stack on mobile |
| Medium | `app/auth/sign-in/page.tsx` + sign-up + complete-profile | `py-16` excessive on mobile |
| Low | Page headings (`text-3xl`) on pitch, basket, checkout pages | Don't scale down on mobile |

Positive patterns already in use: `max-w-*` containers with `mx-auto`, consistent `px-4` padding, `flex-1` for equal button widths.

## Approach
- **Navigation**: Hamburger icon (`md:hidden`) triggers a ShadCN `Sheet` drawer containing all nav items and auth actions. Desktop nav is hidden below `md` with `hidden md:flex`. The `MobileNav` client component receives auth state as props from the existing server component, avoiding a second `getUser()` call.
- **Pitch grid**: Remove `min-w-[768px]`, reduce to `min-w-[600px]` (cells remain ~30px wide, tappable). Add `touch-action: pan-x pan-y pinch-zoom` for native browser pinch-zoom. Hide hover tooltips below `sm` — cell colour change (green→amber) provides touch feedback instead.
- **Everything else**: Standard Tailwind responsive prefixes (`sm:`, `md:`) added where missing.

## Implementation Tasks

### Phase 1 — Mobile Navigation
- [ ] Install ShadCN Sheet: `npx shadcn@latest add sheet -y`
- [ ] Create `components/mobile-nav.tsx` — `"use client"` component with hamburger button (`md:hidden`) + ShadCN Sheet drawer (side="right") containing nav links, basket badge, and auth actions. Each link calls `setOpen(false)` to close the drawer on navigation.
- [ ] Modify `components/navbar.tsx` — wrap desktop `<nav>` and `<AuthStatusServer>` with `hidden md:flex` / `hidden md:block`; add `<MobileNav>` passing `user?.email` and `pathname`; reduce gap to `gap-4 md:gap-6`; add `text-sm sm:text-base` to logo.

### Phase 2 — Pitch Grid
- [ ] `components/pitch-grid.tsx:89` — `min-w-[768px]` → `min-w-[600px]`
- [ ] `components/pitch-grid.tsx:87` — add `touch-action: pan-x pan-y pinch-zoom` and `-webkit-overflow-scrolling: touch` styles; add `border rounded-lg` and `maxHeight: "70vh"` to scroll container
- [ ] `components/pitch-grid.tsx:123` — add `hidden sm:block` to tooltip div to hide on touch devices
- [ ] `components/pitch-grid.tsx:139` — `flex items-center justify-between` → `flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between` on status bar
- [ ] `app/pitch/page.tsx` — add mobile hint text (`md:hidden`): "Pinch to zoom and scroll to explore the full pitch."; `text-3xl` → `text-2xl sm:text-3xl`

### Phase 3 — Layout & Spacing
- [ ] `app/page.tsx` — `py-24` → `py-12 sm:py-16 md:py-24`; `text-5xl` → `text-3xl sm:text-4xl md:text-5xl`; `text-xl` → `text-lg sm:text-xl`
- [ ] `components/footer.tsx:7` — `flex ... justify-between` → `flex flex-col items-center gap-2 sm:flex-row sm:justify-between sm:gap-4`
- [ ] `components/checkout/billing-payment.tsx:89` — `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`
- [ ] `components/basket-content.tsx` — outer total/buttons div: `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`; buttons: add `flex-1 sm:flex-initial`
- [ ] `app/auth/sign-in/page.tsx` — `py-16` → `py-8 sm:py-16`
- [ ] `app/auth/sign-up/page.tsx` — `py-16` → `py-8 sm:py-16` (both confirmed and form states)
- [ ] `components/complete-profile-form.tsx` — `py-16` → `py-8 sm:py-16`
- [ ] `app/basket/page.tsx` — `text-3xl` → `text-2xl sm:text-3xl`
- [ ] `app/checkout/page.tsx` — `text-3xl` → `text-2xl sm:text-3xl`

## Files to Create / Modify
- `components/ui/sheet.tsx` — **new**, installed via ShadCN CLI
- `components/mobile-nav.tsx` — **new**, hamburger + Sheet drawer
- `components/navbar.tsx` — hide desktop nav below md, add MobileNav, responsive logo/gap
- `components/pitch-grid.tsx` — remove min-w-[768px], touch-action, hide tooltip, responsive status bar
- `app/pitch/page.tsx` — mobile hint text, responsive heading
- `app/page.tsx` — responsive text sizes and padding
- `components/footer.tsx` — flex-col stacking on mobile
- `components/checkout/billing-payment.tsx` — responsive grid for city/postcode
- `components/basket-content.tsx` — stack total/buttons on mobile
- `app/auth/sign-in/page.tsx` — reduce vertical padding
- `app/auth/sign-up/page.tsx` — reduce vertical padding
- `components/complete-profile-form.tsx` — reduce vertical padding
- `app/basket/page.tsx` — responsive heading
- `app/checkout/page.tsx` — responsive heading

## Constraints & Hard Rules
- Keep the desktop layout identical — all changes are additive responsive variants
- Do not add a second `getUser()` call in MobileNav — pass auth state as props from the Navbar server component
- `"use client"` only on MobileNav (needs useState for sheet open/close)
- Use `cn()` from `lib/utils.ts` for all conditional class merging
- Do not change the ShadCN component internals in `components/ui/`

## Testing Plan
1. `npm run typecheck` — no TS errors
2. `npm run lint` — no lint errors
3. `npm test` — existing 80 tests pass
4. Manual browser testing (DevTools) at:
   - 375px (iPhone SE)
   - 390px (iPhone 14)
   - 768px (tablet portrait — breakpoint boundary)
   - 1024px+ (desktop)

   Check per route:
   - `/` — heading scales down, padding reduces on mobile
   - `/pitch` — grid scrolls/zooms, hint text visible on mobile, tooltips hidden on small screens
   - `/basket` — total and buttons stack vertically on mobile
   - `/checkout` — city/postcode stack on mobile
   - `/auth/sign-in`, `/auth/sign-up`, `/auth/complete-profile` — reduced top/bottom padding
   - Navbar: hamburger + drawer at < 768px; full desktop nav at ≥ 768px
   - Footer: stacks vertically at < 640px

## Open Questions
- None — user confirmed pinch-zoom for pitch grid and Sheet drawer for mobile nav.

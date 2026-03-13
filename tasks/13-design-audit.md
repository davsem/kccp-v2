# Design Audit — Khalsa Community Pitch Project

---

## Anti-Patterns Verdict

**Partial fail.** The site avoids the worst AI slop (no gradient text, no glassmorphism, no hero metrics grid, no card-grid dashboard). However it shows a different AI tell: **total aesthetic surrender** — the entire color palette is achromatic (every CSS variable has `chroma: 0`), the homepage is unstyled centered text with a single button, and there is no brand personality whatsoever. It looks like a Tailwind starter with the defaults untouched.

Specific tells:
- **AI-default color palette**: `oklch(x 0 0)` for every token — pure grays throughout, zero hue
- **Generic hero copy pattern**: heading + sub-heading + single CTA button (textbook AI scaffold)
- **No visual identity**: no brand color, no imagery, no texture — it could be any fundraiser for anything

This is a fundraiser for a community sports club — it needs warmth, energy, and a sense of purpose. Currently it has none.

---

## Executive Summary

| Category | Score | Issues |
|---|---|---|
| Accessibility | 4/10 | 8 issues |
| Performance | 7/10 | 3 issues |
| Theming | 5/10 | 4 issues |
| Responsive Design | 6/10 | 4 issues |
| Visual Design | 3/10 | 5 issues |

**Total: 29 issues** (3 Critical, 8 High, 11 Medium, 7 Low)

**Top 3 most critical:**
1. Pitch grid cells have no accessible state for sold/selected — screen readers are blind to grid state
2. Color-only differentiation across the entire pitch grid violates WCAG 1.4.1
3. Mobile users get no section state information (tooltip is desktop-only, no fallback)

---

## Detailed Findings

### Critical Issues

---

**C1 — Sold pitch sections have no accessible label**
- **Location**: `components/pitch-section-cell.tsx:17-24`
- **Category**: Accessibility
- **WCAG**: 1.1.1 Non-text content (Level A)
- **Description**: The sold state renders a `<button>` with `aria-disabled="true"` but **no text content at all** — no `sr-only` span, no `aria-label`. The available/selected state has `<span className="sr-only">{section.label}</span>` but this only gives the label (e.g. "A1"), not the state ("sold", "selected", "available"). A screen reader user cannot tell which sections are sold.
- **Impact**: Screen reader users cannot use the pitch grid at all — the core product interaction is inaccessible.
- **Recommendation**: Add `aria-label` to every cell including state: e.g. `aria-label={`Section ${section.label} — ${isSold ? 'sold' : selected ? 'selected' : 'available'} — £${section.price}`}`
- **Suggested command**: `/harden`

---

**C2 — Color is the only differentiator for pitch grid states (WCAG 1.4.1)**
- **Location**: `components/pitch-section-cell.tsx:33-39`
- **Category**: Accessibility
- **WCAG**: 1.4.1 Use of Color (Level A)
- **Description**: Green = available, amber = selected, slate = sold. No pattern, texture, icon, or shape difference. Users with deuteranopia (green-blind, ~6% of males) cannot distinguish green from amber.
- **Impact**: A significant fraction of users cannot tell which sections they've selected vs which are available.
- **Recommendation**: Add a subtle `✓` or `×` mark, or a hatching pattern via `bg-[repeating-linear-gradient]` for sold sections. At minimum, selected cells should have a visible check icon.
- **Suggested command**: `/harden` then `/colorize`

---

**C3 — Mobile users have zero section-state feedback**
- **Location**: `components/pitch-grid.tsx:129` — `hidden sm:block`
- **Category**: Accessibility + Responsive
- **WCAG**: 1.3.3 Sensory Characteristics (Level A)
- **Description**: The tooltip showing section label, price, and state is hidden on mobile (`hidden sm:block`). On mobile, tapping a cell gives no feedback other than color change. The label count ("3 sections selected") is the only feedback, but tells nothing about which specific section you just tapped or its price.
- **Impact**: Mobile checkout is a guess-and-hope interaction for users who can't see colors well or need confirmation of what they tapped.
- **Recommendation**: Show a bottom sheet or inline status bar on mobile that updates on tap: "Section B5 — £50 — Selected". A simple `<p>` below the grid updated on touch is sufficient.
- **Suggested command**: `/adapt`

---

### High-Severity Issues

---

**H1 — No skip-to-main-content link**
- **Location**: `app/layout.tsx` (absent)
- **Category**: Accessibility
- **WCAG**: 2.4.1 Bypass Blocks (Level A)
- **Description**: No skip link exists. Every keyboard/screen reader user must tab through the full navbar (logo + 4 nav links + basket badge + auth status) before reaching page content.
- **Impact**: Keyboard users, especially those with motor impairments, face unnecessary friction on every page load.
- **Recommendation**: Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>` as the first element in `<body>`, and `id="main-content"` on the `<main>` element.
- **Suggested command**: `/harden`

---

**H2 — `<nav>` missing `aria-label`**
- **Location**: `components/navbar.tsx:25`
- **Category**: Accessibility
- **WCAG**: 4.1.2 Name, Role, Value (Level A)
- **Description**: `<nav className="hidden md:flex ...">` has no `aria-label`. When there are multiple navigation landmarks (the desktop nav and the mobile nav/header), each must have a distinct label.
- **Impact**: Screen reader users navigating by landmarks cannot distinguish between navs.
- **Recommendation**: Add `aria-label="Main navigation"` to the desktop `<nav>` and `aria-label="Mobile navigation"` to the mobile menu.
- **Suggested command**: `/harden`

---

**H3 — Checkout has no step progress indicator**
- **Location**: `components/checkout-content.tsx`
- **Category**: UX / Accessibility
- **WCAG**: 2.4.8 Location (Level AAA, but High UX impact)
- **Description**: The 3-step checkout (Owner Names → Billing → Review) has no visible progress indicator. Users cannot tell how far through checkout they are or how many steps remain.
- **Impact**: Users may abandon checkout mid-way, not knowing how much more is required. Particularly problematic on mobile where each step fills the viewport.
- **Recommendation**: Add a step indicator at the top: "Step 2 of 3 — Billing Details" with visual progress dots or a progress bar.
- **Suggested command**: `/onboard`

---

**H4 — Required form fields have no visual indicator**
- **Location**: `components/checkout/billing-payment.tsx`
- **Category**: Accessibility / UX
- **WCAG**: 3.3.2 Labels or Instructions (Level A)
- **Description**: Required fields (first name, last name, address, city, postcode, country) are visually identical to optional ones (address line 2). No asterisk, "(required)" label, or other indicator.
- **Impact**: Users don't know which fields they must fill, leading to submission errors and frustration.
- **Recommendation**: Add `*` with `aria-label="required"` to required field labels, or add a legend "* Required field" above the form.
- **Suggested command**: `/harden`

---

**H5 — Country field is a free-text input**
- **Location**: `components/checkout/billing-payment.tsx`
- **Category**: UX / Data Quality
- **Description**: Country is an `<Input>` with `defaultValue="United Kingdom"`. Users can type anything. Stripe and tax calculations expect ISO country codes.
- **Impact**: Data quality issues, potential payment failures for international donors, poor mobile UX (no autocomplete).
- **Recommendation**: Replace with a `<Select>` of countries or at minimum a `<datalist>` for autocomplete.
- **Suggested command**: `/harden`

---

**H6 — `onPointerEnter` + `onPointerOver` both fire the same handler**
- **Location**: `components/pitch-grid.tsx:112-113`
- **Category**: Performance
- **Description**: Both `onPointerEnter` and `onPointerOver` fire `handlePointerEnter`. `onPointerOver` fires on every mouse move across child elements, causing the handler (which calls `getBoundingClientRect()` — a layout read) to fire hundreds of times per second.
- **Impact**: Janky performance on the pitch grid when hovering, especially on lower-end devices. Unnecessary layout thrashing.
- **Recommendation**: Remove `onPointerOver` — `onPointerEnter` with the `.closest("[data-section-id]")` delegation already handles entering any cell correctly.
- **Suggested command**: `/optimize`

---

**H7 — Pitch cells have no keyboard interaction**
- **Location**: `components/pitch-section-cell.tsx` + `components/pitch-grid.tsx`
- **Category**: Accessibility
- **WCAG**: 2.1.1 Keyboard (Level A)
- **Description**: Grid cells are `<button>` elements (so they receive focus), but navigating 200 buttons with Tab is completely impractical. There's no arrow-key navigation to move between cells.
- **Impact**: Keyboard users cannot meaningfully use the pitch grid — tabbing through 200 buttons is unusable.
- **Recommendation**: Implement a roving tabindex pattern on the grid: one cell in the tabstop at a time, arrow keys move focus between cells.
- **Suggested command**: `/harden`

---

**H8 — Homepage is visually empty**
- **Location**: `app/page.tsx`
- **Category**: Visual Design
- **Description**: The homepage is three lines of centered text and a button on a white/dark background. No imagery, illustration, color, or any visual element that communicates what this project is about. For a community fundraiser, this is a missed opportunity for emotional connection.
- **Impact**: Low conversion — donors who land on the page have no visual reason to engage. The pitch SVG exists (used in `pitch-grid.tsx`) but is invisible here.
- **Recommendation**: Add a visual hero — at minimum, a pitch preview image, a progress indicator showing % funded, or club branding.
- **Suggested command**: `/bolder` or `/frontend-design`

---

### Medium-Severity Issues

---

**M1 — Entire color palette is achromatic**
- **Location**: `app/globals.css:86-119`
- **Category**: Theming / Visual Design
- **Description**: Every CSS token has `chroma: 0` — `oklch(x 0 0)` — making the entire design pure gray. The primary button is dark gray. There is no brand color for a sports club that presumably has club colors.
- **Impact**: The design has zero personality. For a fundraiser, emotional resonance matters — gray communicates nothing.
- **Recommendation**: Introduce at least one brand hue (e.g. Khalsa blue/navy or club color) for `--primary`. Even `oklch(0.3 0.15 250)` (deep blue) transforms the feel.
- **Suggested command**: `/colorize`

---

**M2 — Hard-coded Tailwind color classes in pitch cells**
- **Location**: `components/pitch-section-cell.tsx:22, 37-39`
- **Category**: Theming
- **Description**: `slate-400/50`, `slate-300/50`, `green-600/40`, `green-500/40`, `amber-500/60`, `amber-400/60` are raw Tailwind colors bypassing the design token system. They won't adapt if the theme changes, and dark mode behavior is undefined for these classes.
- **Impact**: Pitch grid looks inconsistent in dark mode; colors cannot be centrally updated.
- **Recommendation**: Either add semantic tokens (`--pitch-available`, `--pitch-selected`, `--pitch-sold`) to globals.css, or keep the Tailwind classes but add explicit `dark:` variants.
- **Suggested command**: `/normalize`

---

**M3 — Tooltip can clip at viewport edges**
- **Location**: `components/pitch-grid.tsx:128-143`
- **Category**: UX
- **Description**: The tooltip uses `position: fixed` with `left: tooltip.x` (center of cell). For cells at the left or right edges of the grid, the tooltip will overflow off-screen. There's no clamping logic.
- **Impact**: Tooltip text is partially or fully hidden for edge columns — sections A1, A20, etc.
- **Recommendation**: Clamp `left` to `Math.max(tooltipWidth/2, Math.min(tooltip.x, window.innerWidth - tooltipWidth/2))`.
- **Suggested command**: `/harden`

---

**M4 — `total` calculation not memoized**
- **Location**: `components/pitch-grid.tsx:32-35`
- **Category**: Performance
- **Description**: `Array.from(selectedIds).reduce(...)` runs on every render without `useMemo`. The pitch grid re-renders on every pointer event (tooltip state updates), so this runs hundreds of times per second on hover.
- **Impact**: Minor CPU waste. More noticeable with large baskets.
- **Recommendation**: Wrap in `useMemo(() => ..., [selectedIds])`.
- **Suggested command**: `/optimize`

---

**M5 — GiftAid checkbox label is legally important but visually buried**
- **Location**: `components/checkout/billing-payment.tsx`
- **Category**: UX / Legal
- **Description**: The GiftAid declaration is presented in a gray box with small text. The legal declaration text ("I am a UK taxpayer...") is the most consequential text on this form but receives the least visual emphasis.
- **Impact**: Users may check GiftAid without understanding the declaration — a legal/tax compliance risk.
- **Recommendation**: Give the GiftAid section a distinct border or card treatment. Make the checkbox label text legible at normal body size, not muted.
- **Suggested command**: `/clarify`

---

**M6 — "Keep anonymous" checkbox logic is inverted**
- **Location**: `components/checkout/section-owner-names.tsx`
- **Category**: UX / Clarity
- **Description**: `checked={!(config?.showName ?? true)}` — the checkbox is "Keep anonymous" but the underlying state is `showName`. Double negation makes the logic hard to follow and error-prone. If `config` is undefined, `showName` defaults to `true` (show name), so the checkbox defaults to unchecked (not anonymous) — correct but fragile.
- **Impact**: A bug in this logic would display donor names when they intended to be anonymous — a significant privacy violation.
- **Recommendation**: Store `isAnonymous` in state, or rename the checkbox to "Show my name on the pitch" to match the underlying `showName` boolean without negation.
- **Suggested command**: `/clarify`

---

**M7 — Basket "stale sections" message is unclear**
- **Location**: `components/basket-content.tsx`
- **Category**: UX / Clarity
- **Description**: The alert says stale sections are unavailable but the sections themselves only show as `opacity-50` without any label like "Unavailable" or "Just sold". "Remove them" is inline in the alert — it's not clear it removes only stale items.
- **Impact**: Users may be confused about which items are affected and afraid to click "Remove them".
- **Recommendation**: Add "Sold" badge overlaid on stale items. Change button text to "Remove unavailable sections".
- **Suggested command**: `/clarify`

---

**M8 — No loading skeleton / placeholder on pitch page**
- **Location**: `app/pitch/page.tsx`
- **Category**: UX / Performance perception
- **Description**: The pitch page does server-side data fetching. While Next.js handles streaming, there's no `<Suspense>` boundary with a skeleton, so users see a blank area or layout shift while sections load.
- **Impact**: Perceived performance is worse than actual performance.
- **Recommendation**: Wrap `PitchGrid` in `<Suspense fallback={<PitchSkeleton />}>`.
- **Suggested command**: `/optimize`

---

**M9 — `<Button asChild disabled={count === 0}>` with `<Link>` inside**
- **Location**: `components/pitch-grid.tsx:149-151`
- **Category**: Accessibility
- **WCAG**: 4.1.2
- **Description**: `<Button asChild disabled>` renders as `<a href="/basket" aria-disabled="true">`. Anchor elements don't support `disabled` — keyboard users can still navigate to `/basket` even when 0 sections are selected.
- **Impact**: Users can reach the basket page with an empty basket, causing a confusing empty state.
- **Recommendation**: Conditionally render `<Button onClick>` (no `asChild`) when disabled, or render a `<span>` styled as a disabled button.
- **Suggested command**: `/harden`

---

**M10 — Order review uses emoji for status**
- **Location**: `components/checkout/order-review.tsx`
- **Category**: Accessibility
- **WCAG**: 1.1.1
- **Description**: GiftAid status shown with "✓" emoji character (or similar). Screen readers announce emoji inconsistently across platforms ("heavy check mark", "check mark", or nothing).
- **Impact**: Screen reader users may miss or misunderstand GiftAid confirmation.
- **Recommendation**: Replace with a `<CheckIcon>` from lucide-react with `aria-hidden="true"` + sr-only text "GiftAid enabled".
- **Suggested command**: `/harden`

---

**M11 — `<header>` in Navbar has no `role` complement**
- **Location**: `components/navbar.tsx:20`
- **Category**: Accessibility
- **WCAG**: 1.3.6
- **Description**: `<header className="border-b bg-background">` without `role="banner"` relies on implicit ARIA from HTML5. This is fine in most browsers but some older AT/browser combos don't map `<header>` inside `<body>` to `banner` landmark. Minor but worth noting.
- **Impact**: Low — edge case with older screen readers.
- **Recommendation**: Explicit `role="banner"` as belt-and-suspenders.
- **Suggested command**: `/harden`

---

### Low-Severity Issues

---

**L1 — No `lg:` / `xl:` breakpoints**
- **Location**: All pages and components
- **Category**: Responsive
- **Description**: The largest breakpoint used is `md:` (768px). On large screens (1440px+), content sits centered with massive whitespace but no layout optimization.
- **Impact**: Suboptimal large-screen experience. Not broken, just unpolished.
- **Suggested command**: `/adapt`

---

**L2 — Checkout confirmation page — no confetti / success animation**
- **Location**: `app/checkout/confirmation/page.tsx`
- **Category**: Delight / UX
- **Description**: After a donation, users see a plain confirmation. No celebration, no social share prompt, no visual reward for the action.
- **Impact**: Missed opportunity to delight donors and encourage sharing.
- **Suggested command**: `/delight`

---

**L3 — `transition-all` on Button component**
- **Location**: `components/ui/button.tsx`
- **Category**: Performance
- **Description**: `transition-all` transitions every CSS property, including layout properties. It's heavier than needed and can cause unexpected transitions.
- **Recommendation**: Replace with `transition-colors` (or `transition-[color,background-color,border-color,opacity]`).
- **Suggested command**: `/optimize`

---

**L4 — Auth pages have no social proof / branding**
- **Location**: `app/auth/sign-in/page.tsx`, `app/auth/sign-up/page.tsx`
- **Category**: Design / Conversion
- **Description**: Sign-in/sign-up pages are plain centered forms. No club logo, no project tagline, no indication of what users are signing up for. If someone lands here from a link they may not know what site they're on.
- **Suggested command**: `/onboard`

---

**L5 — GiftAid section has no explanatory link**
- **Location**: `components/checkout/billing-payment.tsx`
- **Category**: UX / Clarity
- **Description**: The GiftAid declaration is shown but there's no link to HMRC's GiftAid page for users who want to verify the scheme. Users who are unfamiliar may skip it out of uncertainty.
- **Suggested command**: `/clarify`

---

**L6 — Pitch section `available` field appears redundant**
- **Location**: `lib/pitch-data.ts` + `components/pitch-section-cell.tsx:30`
- **Category**: Code clarity
- **Description**: `section.available` is checked as a condition but if `purchasedMap.has(section.id)` → `isSold=true`, the `available` flag would be a derived value. Not a visual issue but a potential source of inconsistency if the two sources diverge.

---

**L7 — No `<meta name="description">` on homepage**
- **Location**: `app/page.tsx` (no metadata export)
- **Category**: SEO / Discoverability
- **Description**: The homepage has no metadata export, so the `<title>` and `<meta description>` fall back to the root layout defaults. Important for search and social sharing.
- **Suggested command**: `/harden`

---

## Patterns & Systemic Issues

1. **Achromatic color palette throughout**: Every semantic token has chroma=0. This is a systemic issue — introducing one brand hue requires updating `--primary`, `--accent`, possibly `--ring` in globals.css. Affects every page.

2. **Hard-coded Tailwind colors bypass the token system in 2+ places**: `pitch-section-cell.tsx` and `order-review.tsx` both use raw Tailwind color classes. Any theme change will leave these stale.

3. **Missing ARIA attributes are consistent pattern**: Navbar nav, pitch grid, form fields, and confirmation emoji all lack proper ARIA. Suggests accessibility wasn't in the initial checklist.

4. **Mobile-first layout but desktop-last polish**: Good `sm:` breakpoints everywhere, no `lg:` anywhere. The site works on mobile but isn't optimized for desktop beyond centering.

---

## Positive Findings

- **OKLCH color space**: Using perceptually uniform OKLCH for all CSS tokens is genuinely modern and forward-thinking. Dark mode support is thorough and correct.
- **`useMemo` on `purchasedMap`**: Smart optimization — the sold section map is memoized and won't be recreated on hover events.
- **Server-side data fetching on pitch page**: Purchased sections are fetched server-side, meaning the page is accurate on first load without a client-side fetch flash.
- **`aria-disabled` on sold cells**: The sold state uses `aria-disabled="true"` rather than `disabled` — correct pattern for buttons that should be focusable but not interactive.
- **`WebkitOverflowScrolling` + `touchAction`**: Proper iOS touch handling on the pitch grid scroll container.
- **`sr-only` labels on pitch cells**: The intent is right — just needs state information added.
- **Stripe race condition handling**: The PK constraint + automatic refund approach is robust.
- **`createMockSupabaseClient` factory**: Clean, reusable test infrastructure.

---

## Recommendations by Priority

### Immediate (Critical blockers)
1. **Add accessible state labels to all pitch grid cells** — `/harden`
2. **Add non-color differentiation to pitch states** — at minimum a check icon for selected cells — `/harden`
3. **Add mobile tap feedback** (e.g. a status bar below the grid that updates on touch) — `/adapt`

### Short-term (High severity — this sprint)
4. **Add skip-to-main link and nav `aria-label`** — `/harden`
5. **Add checkout step progress indicator** — `/onboard`
6. **Mark required fields visually** and fix country field to `<Select>` — `/harden`
7. **Remove `onPointerOver` from pitch grid** (performance) — `/optimize`
8. **Fix `<Button asChild disabled>` / Link pattern** — `/harden`
9. **Introduce brand color** into `--primary` — `/colorize`

### Medium-term (Quality — next sprint)
10. **Add dark mode variants to pitch cell colors** or replace with tokens — `/normalize`
11. **Memoize `total` calculation in pitch grid** — `/optimize`
12. **Add `<Suspense>` + skeleton to pitch page** — `/optimize`
13. **Clarify GiftAid section** (visual weight + HMRC link) — `/clarify`
14. **Fix "Keep anonymous" inverted checkbox** → rename to "Show my name" — `/clarify`
15. **Add roving tabindex to pitch grid** for keyboard navigation — `/harden`
16. **Enhance homepage** with visual hero — `/bolder`

### Long-term (Nice-to-haves)
17. **Add `lg:` breakpoints** for large screen layouts — `/adapt`
18. **Add confirmation page celebration animation** — `/delight`
19. **Add auth page branding** — `/onboard`
20. **Replace emoji status indicators with `<Icon aria-hidden> + sr-only`** — `/harden`

---

## Suggested Commands for Fixes

| Command | Issues Addressed |
|---|---|
| `/harden` | C1, C3, H1, H2, H4, H5, H7, M3, M9, M10, M11, L7 — 12 issues |
| `/colorize` | M1, C2 (partial) — brand color + pitch state palette |
| `/normalize` | M2 — align pitch cell colors to design tokens |
| `/optimize` | H6, M4, M8, L3 — performance fixes |
| `/adapt` | C3, L1 — mobile tap feedback + large screen breakpoints |
| `/onboard` | H3, L4 — checkout step indicator + auth branding |
| `/clarify` | M5, M6, M7, L5 — GiftAid, checkbox wording, basket alerts |
| `/bolder` | H8 — homepage visual hero |
| `/delight` | L2 — confirmation page celebration |

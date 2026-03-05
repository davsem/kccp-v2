# Feature: Site Scaffolding — Pages, Routing & Basket State

## Context
kccp-v2 is a fresh Next.js 16 project with only a ShadCN demo homepage. We need to scaffold the core pages, navigation, and shared state so the app is usable as the **Khalsa Community Pitch Project** — a fundraiser where supporters buy 1m² sections of an artificial hockey pitch for Khalsa Hockey Club.

## Goal
Create the foundational pages (Homepage, Pitch, Basket), a top navbar, a minimal footer, and a React Context-based basket so users can browse the pitch grid, select sections, and review their selections.

## Background & Context
- **Current state**: Single `app/page.tsx` (ShadCN demo), root layout, 4 ShadCN components (Button, Card, Badge, Input), `cn()` utility.
- **No existing**: routing, navigation, layout components, or app state.
- **Constraints**: No auth. No purchase/checkout flow. App Router conventions (server components by default).

## Approach
Standard Next.js App Router scaffolding: file-based routes for each page, a shared layout wrapping navbar + footer + context provider, and a lightweight React Context for basket state (stores selected section IDs only). The pitch grid uses CSS Grid with mock data (20×10 = 200 sections).

## Implementation Tasks

### 1. Types & Data
- [ ] Create `lib/types.ts` — `PitchSection` interface (id, row, col, price, label, available)
- [ ] Create `lib/pitch-data.ts` — generate 20×10 grid of sections; centre sections priced at £100, others at £50; export `pitchSections`, `getSectionById()`, grid dimensions

### 2. Basket Context
- [ ] Create `lib/basket-context.tsx` — `"use client"` context with `BasketProvider` and `useBasket` hook
  - State: `Set<string>` of selected section IDs
  - Methods: `add`, `remove`, `toggle`, `clear`, `isSelected`
  - Computed: `count` (number of items)

### 3. Layout Components
- [ ] Create `components/navbar.tsx` — `"use client"` (needs `useBasket` for count, `usePathname` for active link). Site name + links: Home, The Pitch, Basket (with Badge count).
- [ ] Create `components/footer.tsx` — server component. Copyright "Khalsa Hockey Club" + placeholder links.
- [ ] Install ShadCN `separator` component (`npx shadcn@latest add separator -y`) for footer divider.

### 4. Root Layout Modification
- [ ] Modify `app/layout.tsx`:
  - Update metadata title/description
  - Import and wrap children with `BasketProvider`
  - Add `Navbar` above and `Footer` below `{children}`
  - Use `flex min-h-screen flex-col` structure with `main.flex-1`

### 5. Homepage
- [ ] Modify `app/page.tsx` — replace ShadCN demo with:
  - Hero section (project name, tagline)
  - Brief description of the pitch-buying concept
  - CTA Button linking to `/pitch`

### 6. Pitch Page
- [ ] Create `app/pitch/page.tsx` — server component wrapper, imports PitchGrid
- [ ] Create `components/pitch-grid.tsx` — `"use client"`. CSS Grid (20 cols), maps `pitchSections` to cells, summary line (count + total), "View Basket" button linking to `/basket`
- [ ] Create `components/pitch-section-cell.tsx` — `"use client"`. Clickable square. Green default, amber when selected, muted when unavailable. Calls `toggle()` on click.

### 7. Basket Page
- [ ] Create `app/basket/page.tsx` — server component wrapper, imports BasketContent
- [ ] Create `components/basket-content.tsx` — `"use client"`. Lists selected sections as Cards (label + price), shows total, "Clear Basket" button, empty-state message with link back to `/pitch`

## Files to Create / Modify

| File | Action | Notes |
|---|---|---|
| `lib/types.ts` | Create | Shared types |
| `lib/pitch-data.ts` | Create | Mock grid data (200 sections) |
| `lib/basket-context.tsx` | Create | React Context + provider + hook |
| `components/navbar.tsx` | Create | Top nav, client component |
| `components/footer.tsx` | Create | Minimal footer, server component |
| `components/pitch-grid.tsx` | Create | Interactive pitch grid, client component |
| `components/pitch-section-cell.tsx` | Create | Single grid cell, client component |
| `components/basket-content.tsx` | Create | Basket item list, client component |
| `app/layout.tsx` | Modify | Wire in provider, navbar, footer, metadata |
| `app/page.tsx` | Modify | Replace demo with homepage content |
| `app/pitch/page.tsx` | Create | Pitch page route |
| `app/basket/page.tsx` | Create | Basket page route |

## Constraints & Hard Rules
- No auth — all pages are public
- No checkout/payment flow — basket is display-only for now
- Use existing ShadCN components; only add `separator`
- `"use client"` only where interactivity or hooks require it
- Use `import type` for type-only imports (ESLint enforces `consistent-type-imports`)
- Use `cn()` from `lib/utils.ts` for conditional class merging
- Mobile: pitch grid gets horizontal scroll (`overflow-x-auto`) on small screens

## Verification Plan
1. `npm run lint` — no ESLint errors
2. `npm run build` — clean production build
3. `npm run dev` — manual checks:
   - `/` shows project info + CTA
   - Navbar appears on all pages, active link highlighted, basket count shown
   - `/pitch` shows 20×10 grid; clicking cells toggles selection with visual feedback
   - Selection count and total update live on pitch page
   - "View Basket" navigates to `/basket` with selections preserved
   - `/basket` lists selected sections with prices and total
   - "Clear Basket" empties the basket
   - Navigating back to `/pitch` retains selections (context persists)
   - Footer appears on all pages
   - Empty basket state shows message + link to `/pitch`

## Open Questions
None — requirements are clear for this scaffolding phase.

# Plan: Expand Pitch Grid to 25×40 (1000 sections) with SVG Overlay

## Context
The fundraiser is expanding from 200 sections (20×10) to 1000 sections (25×40 = 25 rows × 40 cols, landscape orientation). The grid should overlay the hockey pitch SVG (`assets/Field-Hockey-Pitch.svg`) so pitch markings are visible through semi-transparent cells. Pricing is simplified to a flat £50 per section.

## Summary of Changes

### 1. Update `lib/pitch-data.ts`
- Change `GRID_COLS` from 20 → **40**
- Change `GRID_ROWS` from 10 → **25**
- Remove `isCentre()` function — all sections are £50
- Set all section prices to `£50`
- The nested loop and ID/label scheme (`{row}-{col}`, `R{row+1}C{col+1}`) stay the same
- `getSectionById()` stays the same (consider switching from `.find()` to a `Map` for 1000 items — optional perf improvement)

### 2. Update `components/pitch-section-cell.tsx`
- **Remove label text** from cell rendering (cells will be too small) — keep label in tooltip only
- **Add tooltips to ALL cells** (not just sold):
  - Available: `"{label} — £50 — Available"`
  - Selected: `"{label} — £50 — Selected"`
  - Sold: `"{label} — {sponsor name / Anonymous Sponsor}"`
- **Make cells semi-transparent** (~40-50% opacity on background colour) so pitch SVG shows through:
  - Available: `bg-green-500/40` with `hover:bg-green-500/60`
  - Selected: `bg-amber-400/60` with `hover:bg-amber-400/80`
  - Sold: `bg-slate-300/50`
- Keep the `aspect-square` sizing
- Remove the `title` attribute (tooltip replaces it)
- Refactor: wrap ALL cells in `<Tooltip>`, not just sold ones (unify the SoldCell and AvailableCell paths)

### 3. Update `components/pitch-grid.tsx`
- **Add the pitch SVG as background** on the grid container using inline style:
  ```
  backgroundImage: url('/pitch.svg')
  backgroundSize: 100% 100%
  ```
- Update `gridTemplateColumns` to use new `GRID_COLS` (40)
- Remove the total price calculation from the footer (it references `getSectionById` which remains, but total calc uses flat £50 × count now — simplify to `count * 50`)
- Adjust `minWidth` on the grid to ensure cells aren't too tiny (likely `60rem` or more)

### 4. Update tests

**`components/__tests__/pitch-section-cell.test.tsx`**:
- Remove tests checking for label text inside cells
- Update tests to verify tooltip on all cell states (available, selected, sold)
- Update colour assertions for semi-transparent classes (`bg-green-500/40` etc.)
- Keep toggle behaviour tests

**`components/__tests__/pitch-grid.test.tsx`**:
- Update expected cell count from 200 → 1000
- Update total calculation test (flat £50)
- Verify background image style is present on grid container

### 5. Create cropped SVG in public directory
- Copy `assets/Field-Hockey-Pitch.svg` → `public/pitch.svg`
- **Crop the viewBox** to the pitch rectangle only: change `viewBox="0 0 750 750"` → `viewBox="103.88 212.33 542.25 325.35"`
- This ensures the grid overlays the pitch **markings** (centre line, D's, goals), not the surrounding whitespace
- The original SVG is 750×750 but the pitch rectangle sits at coords `(103.88, 212.33)` with size `542.25 × 325.35`
- Remove the white background `<rect>` from the `FILL-BACKGROUND` group (so the SVG is transparent outside the lines)
- Combined with `background-size: 100% 100%` on the grid, the pitch markings align edge-to-edge with the grid cells

## Files to Modify
| File | Action |
|------|--------|
| `lib/pitch-data.ts` | Edit: GRID_COLS=40, GRID_ROWS=25, flat £50, remove isCentre |
| `components/pitch-section-cell.tsx` | Edit: remove label text, semi-transparent colours, tooltip on all cells |
| `components/pitch-grid.tsx` | Edit: SVG background, simplified total, adjusted minWidth |
| `components/__tests__/pitch-section-cell.test.tsx` | Edit: update assertions |
| `components/__tests__/pitch-grid.test.tsx` | Edit: update cell count and total |
| `public/pitch.svg` | Create: copy from assets/ with cropped viewBox (`103.88 212.33 542.25 325.35`) and transparent background |

## Existing utilities to reuse
- `cn()` from `lib/utils.ts` — conditional class merging
- `useBasket()` from `lib/basket-context.tsx` — toggle/selectedIds/count
- `Tooltip`, `TooltipTrigger`, `TooltipContent` from `components/ui/tooltip.tsx`
- `getSectionById()` from `lib/pitch-data.ts`

## Verification
1. `npm run typecheck` — no TS errors
2. `npm test` — all tests pass
3. `npm run dev` → visit `/pitch` — verify:
   - 40×25 grid visible over pitch SVG
   - Pitch markings visible through semi-transparent cells
   - Click cells → amber, click again → green
   - Hover any cell → tooltip with section info
   - Sold cells show slate with sponsor info
   - Footer shows correct count and total (count × £50)
4. `npm run lint` — no lint errors

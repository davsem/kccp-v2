# Khalsa Community Pitch Project (KCCP)

A fundraiser web app where supporters can sponsor 1m² sections of an artificial hockey pitch for **Khalsa Hockey Club**.

## Overview

The pitch is divided into a 20×10 grid of 200 sections. Supporters browse the interactive pitch, select sections to sponsor, and review their basket before completing a pledge. Centre sections are priced at **£100** and surrounding sections at **£50**.

## Routes

| Route | Description |
|---|---|
| `/` | Homepage — hero section with CTA |
| `/pitch` | Interactive pitch grid — browse and select sections |
| `/basket` | Review selected sections, total cost, and clear basket |

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 via PostCSS
- **UI Components**: ShadCN UI
- **Fonts**: Geist Sans & Geist Mono

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Commands

```bash
npm run dev    # Development server (Turbopack)
npm run build  # Production build
npm run start  # Production server
npm run lint   # ESLint
```

## Project Structure

```
app/                   # Next.js App Router pages
  page.tsx             # Homepage
  pitch/page.tsx       # Pitch grid page
  basket/page.tsx      # Basket page
components/
  ui/                  # ShadCN UI primitives
  navbar.tsx           # Top nav with basket count badge
  footer.tsx           # Site footer
  pitch-grid.tsx       # 20×10 CSS grid with running total
  pitch-section-cell.tsx  # Individual grid cell
  basket-content.tsx   # Basket item list and total
lib/
  types.ts             # PitchSection interface
  pitch-data.ts        # 200-section grid data
  basket-context.tsx   # BasketProvider + useBasket hook
  utils.ts             # cn() utility (clsx + tailwind-merge)
```

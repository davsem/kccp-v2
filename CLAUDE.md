# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js with Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a **Next.js 16.1.6** project using the **App Router** (`app/` directory), bootstrapped with `create-next-app`.

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss`)
- **UI Components**: ShadCN UI (v3.8.5) — components live in `components/ui/`
- **Fonts**: Geist Sans and Geist Mono (Google Fonts, loaded via `next/font`)
- **Path alias**: `@/*` resolves to the project root

## Key Conventions

- ESLint uses the new flat config format (`eslint.config.mjs`) extending `eslint-config-next` core-web-vitals and TypeScript rules.
- Tailwind v4 is configured via `globals.css` (`@import "tailwindcss"`) and CSS custom properties (`@theme inline`) — no `tailwind.config.js` file.
- ShadCN theming uses CSS variables defined in `app/globals.css` — colors use `bg-background`, `text-foreground`, `text-muted-foreground`, etc.
- ShadCN config is in `components.json` (style: default, base color: neutral, CSS variables enabled).
- The `cn` utility (`lib/utils.ts`) combines `clsx` and `tailwind-merge` — always use it for conditional class merging.
- Add new ShadCN components with `npx shadcn@latest add <component> -y`.
- No testing framework is configured yet.
- Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.
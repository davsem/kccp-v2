import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Navbar } from "@/components/navbar"
import type { ReactNode } from "react"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }),
}))

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Map([["x-pathname", "/"]])),
}))

vi.mock("@/components/nav-links", () => ({
  NavLinks: () => <div data-testid="nav-links" />,
}))

vi.mock("@/components/basket-badge", () => ({
  BasketBadge: () => <div data-testid="basket-badge" />,
}))

vi.mock("@/components/auth-status-server", () => ({
  AuthStatusServer: () => <div data-testid="auth-status-server" />,
}))

vi.mock("@/components/auth-state-listener", () => ({
  AuthStateListener: () => null,
}))

vi.mock("@/components/mobile-nav", () => ({
  MobileNav: () => <div data-testid="mobile-nav" />,
}))

describe("Navbar", () => {
  it("renders brand link", async () => {
    const jsx = await Navbar()
    render(jsx)
    expect(screen.getByText("Khalsa Community Pitch Project")).toBeInTheDocument()
  })

  it("renders NavLinks", async () => {
    const jsx = await Navbar()
    render(jsx)
    expect(screen.getByTestId("nav-links")).toBeInTheDocument()
  })

  it("renders BasketBadge", async () => {
    const jsx = await Navbar()
    render(jsx)
    expect(screen.getByTestId("basket-badge")).toBeInTheDocument()
  })

  it("renders AuthStatusServer", async () => {
    const jsx = await Navbar()
    render(jsx)
    expect(screen.getByTestId("auth-status-server")).toBeInTheDocument()
  })
})

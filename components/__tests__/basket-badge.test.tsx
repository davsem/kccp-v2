import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { BasketBadge } from "@/components/basket-badge"
import type { ReactNode } from "react"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}))

const mockUseBasket = vi.fn().mockReturnValue({ count: 0 })
vi.mock("@/lib/basket-context", () => ({
  useBasket: () => mockUseBasket(),
}))

describe("BasketBadge", () => {
  it("renders Basket link", () => {
    render(<BasketBadge />)
    expect(screen.getByRole("link", { name: /Basket/ })).toBeInTheDocument()
  })

  it("does not show badge when count is 0", () => {
    mockUseBasket.mockReturnValue({ count: 0 })
    render(<BasketBadge />)
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument()
  })

  it("shows badge with count when count > 0", () => {
    mockUseBasket.mockReturnValue({ count: 3 })
    render(<BasketBadge />)
    expect(screen.getByText("3")).toBeInTheDocument()
  })
})

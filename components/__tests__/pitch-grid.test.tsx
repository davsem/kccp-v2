import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PitchGrid } from "@/components/pitch-grid"
import { BasketProvider } from "@/lib/basket-context"
import type { ReactNode } from "react"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const wrapper = ({ children }: { children: ReactNode }) => (
  <BasketProvider>{children}</BasketProvider>
)

describe("PitchGrid", () => {
  it("renders 200 cells", () => {
    render(<PitchGrid />, { wrapper })
    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(200)
  })

  it("shows 0 sections selected initially", () => {
    render(<PitchGrid />, { wrapper })
    expect(screen.getByText(/0 sections selected/)).toBeInTheDocument()
  })

  it("updates count and total when a cell is clicked", async () => {
    const user = userEvent.setup()
    render(<PitchGrid />, { wrapper })

    // Click first cell (R1C1 = £50)
    await user.click(screen.getByTitle("R1C1 — £50"))

    expect(screen.getByText(/1 section selected/)).toBeInTheDocument()
    expect(screen.getByText("£50")).toBeInTheDocument()
  })

  it("View Basket button is disabled when basket is empty", () => {
    render(<PitchGrid />, { wrapper })
    expect(screen.getByRole("link", { name: /View Basket/i }).closest("button, a")).toBeInTheDocument()
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"
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
  beforeEach(() => {
    document.cookie = "kccp-basket=; max-age=0; path=/"
  })

  it("renders 1000 cells", () => {
    const { container } = render(<PitchGrid />, { wrapper })
    const cells = container.querySelectorAll("[data-section-id]")
    expect(cells).toHaveLength(1000)
  })

  it("shows 0 sections selected initially", () => {
    render(<PitchGrid />, { wrapper })
    expect(screen.getByText(/0 sections selected/)).toBeInTheDocument()
  })

  it("updates count and total when a cell is clicked", async () => {
    const user = userEvent.setup()
    render(<PitchGrid />, { wrapper })

    // Click first cell (R1C1 = £50)
    await user.click(screen.getAllByRole("button")[0])

    expect(screen.getByText(/1 section selected/)).toBeInTheDocument()
    expect(screen.getByText("£50")).toBeInTheDocument()
  })

  it("calculates total as count × £50", async () => {
    const user = userEvent.setup()
    render(<PitchGrid />, { wrapper })

    const buttons = screen.getAllByRole("button")
    await user.click(buttons[0])
    await user.click(buttons[1])

    expect(screen.getByText(/2 sections selected/)).toBeInTheDocument()
    expect(screen.getByText("£100")).toBeInTheDocument()
  })

  it("renders outer wrapper with pitch SVG background", () => {
    const { container } = render(<PitchGrid />, { wrapper })
    const bgEl = container.querySelector("[style*='pitch.svg']")
    expect(bgEl).toBeInTheDocument()
  })

  it("View Basket button is disabled when basket is empty", () => {
    render(<PitchGrid />, { wrapper })
    const btn = screen.getByRole("button", { name: /View Basket/i })
    expect(btn).toBeDisabled()
  })
})

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PitchSectionCell } from "@/components/pitch-section-cell"
import { BasketProvider } from "@/lib/basket-context"
import type { PitchSection } from "@/lib/types"
import type { ReactNode } from "react"

const wrapper = ({ children }: { children: ReactNode }) => (
  <BasketProvider>{children}</BasketProvider>
)

const availableSection: PitchSection = {
  id: "0-0",
  row: 0,
  col: 0,
  price: 50,
  label: "R1C1",
  available: true,
}

const unavailableSection: PitchSection = {
  ...availableSection,
  id: "0-1",
  available: false,
}

describe("PitchSectionCell", () => {
  it("does not render label text inside cell (too small)", () => {
    render(<PitchSectionCell section={availableSection} isSold={false} />, { wrapper })
    expect(screen.queryByText("R1C1")).not.toBeInTheDocument()
  })

  it("shows green semi-transparent state when unselected and available", () => {
    render(<PitchSectionCell section={availableSection} isSold={false} />, { wrapper })
    const btn = screen.getByRole("button")
    expect(btn).toHaveClass("bg-green-500/40")
  })

  it("toggles to amber semi-transparent when clicked", async () => {
    const user = userEvent.setup()
    render(<PitchSectionCell section={availableSection} isSold={false} />, { wrapper })
    const btn = screen.getByRole("button")
    await user.click(btn)
    expect(btn).toHaveClass("bg-amber-400/60")
  })

  it("toggles back to green on second click", async () => {
    const user = userEvent.setup()
    render(<PitchSectionCell section={availableSection} isSold={false} />, { wrapper })
    const btn = screen.getByRole("button")
    await user.click(btn)
    await user.click(btn)
    expect(btn).toHaveClass("bg-green-500/40")
  })

  it("is disabled when section is unavailable", () => {
    render(<PitchSectionCell section={unavailableSection} isSold={false} />, { wrapper })
    const btn = screen.getByRole("button")
    expect(btn).toBeDisabled()
  })

  it("has data-section-id attribute for tooltip delegation", () => {
    render(<PitchSectionCell section={availableSection} isSold={false} />, { wrapper })
    const btn = screen.getByRole("button")
    expect(btn).toHaveAttribute("data-section-id", "0-0")
  })

  describe("sold cells", () => {
    it("shows slate semi-transparent styling for sold sections", () => {
      render(
        <PitchSectionCell section={availableSection} isSold={true} />,
        { wrapper }
      )
      const btn = screen.getByRole("button")
      expect(btn).toHaveClass("bg-slate-300/50")
      expect(btn).toHaveAttribute("aria-disabled", "true")
    })

    it("has data-section-id attribute for tooltip delegation", () => {
      render(
        <PitchSectionCell section={availableSection} isSold={true} />,
        { wrapper }
      )
      const btn = screen.getByRole("button")
      expect(btn).toHaveAttribute("data-section-id", "0-0")
    })

    it("is not HTML-disabled (uses aria-disabled for pointer events)", () => {
      render(
        <PitchSectionCell section={availableSection} isSold={true} />,
        { wrapper }
      )
      const btn = screen.getByRole("button")
      expect(btn).not.toBeDisabled()
      expect(btn).toHaveAttribute("aria-disabled", "true")
    })

    it("does not render label text inside sold cell", () => {
      render(
        <PitchSectionCell section={availableSection} isSold={true} />,
        { wrapper }
      )
      expect(screen.queryByText("R1C1")).not.toBeInTheDocument()
    })
  })
})

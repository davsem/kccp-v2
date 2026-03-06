import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PitchSectionCell } from "@/components/pitch-section-cell"
import { BasketProvider } from "@/lib/basket-context"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { PitchSection, PurchasedSection } from "@/lib/types"
import type { ReactNode } from "react"

const wrapper = ({ children }: { children: ReactNode }) => (
  <BasketProvider>
    <TooltipProvider>{children}</TooltipProvider>
  </BasketProvider>
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

const namedPurchased: PurchasedSection = {
  section_id: "0-0",
  order_id: "order-1",
  user_id: "user-1",
  owner_name: "Jane Smith",
  show_owner_name: true,
  purchased_at: "2026-01-01T00:00:00Z",
}

const anonymousPurchased: PurchasedSection = {
  ...namedPurchased,
  show_owner_name: false,
}

const nullNamePurchased: PurchasedSection = {
  ...namedPurchased,
  owner_name: null,
}

describe("PitchSectionCell", () => {
  it("renders section label", () => {
    render(<PitchSectionCell section={availableSection} />, { wrapper })
    expect(screen.getByText("R1C1")).toBeInTheDocument()
  })

  it("shows green state when unselected and available", () => {
    render(<PitchSectionCell section={availableSection} />, { wrapper })
    const btn = screen.getByRole("button")
    expect(btn).toHaveClass("bg-green-500")
  })

  it("toggles to amber when clicked", async () => {
    const user = userEvent.setup()
    render(<PitchSectionCell section={availableSection} />, { wrapper })
    const btn = screen.getByRole("button")
    await user.click(btn)
    expect(btn).toHaveClass("bg-amber-400")
  })

  it("toggles back to green on second click", async () => {
    const user = userEvent.setup()
    render(<PitchSectionCell section={availableSection} />, { wrapper })
    const btn = screen.getByRole("button")
    await user.click(btn)
    await user.click(btn)
    expect(btn).toHaveClass("bg-green-500")
  })

  it("is disabled when section is unavailable", () => {
    render(<PitchSectionCell section={unavailableSection} />, { wrapper })
    const btn = screen.getByRole("button")
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass("bg-muted")
  })

  it("shows price in button title", () => {
    render(<PitchSectionCell section={availableSection} />, { wrapper })
    expect(screen.getByTitle("R1C1 — £50")).toBeInTheDocument()
  })

  describe("sold cells", () => {
    it("shows slate styling for sold sections", () => {
      render(
        <PitchSectionCell section={availableSection} purchased={namedPurchased} />,
        { wrapper }
      )
      const btn = screen.getByRole("button")
      expect(btn).toHaveClass("bg-slate-300")
      expect(btn).toHaveAttribute("aria-disabled", "true")
    })

    it("wraps sold cell in a tooltip trigger", () => {
      render(
        <PitchSectionCell section={availableSection} purchased={namedPurchased} />,
        { wrapper }
      )
      const btn = screen.getByRole("button")
      expect(btn).toHaveAttribute("data-slot", "tooltip-trigger")
    })

    it("does not wrap unsold cells in a tooltip trigger", () => {
      render(
        <PitchSectionCell section={availableSection} />,
        { wrapper }
      )
      const btn = screen.getByRole("button")
      expect(btn).not.toHaveAttribute("data-slot", "tooltip-trigger")
    })

    it("is not HTML-disabled (uses aria-disabled for pointer events)", () => {
      render(
        <PitchSectionCell section={availableSection} purchased={namedPurchased} />,
        { wrapper }
      )
      const btn = screen.getByRole("button")
      expect(btn).not.toBeDisabled()
      expect(btn).toHaveAttribute("aria-disabled", "true")
    })
  })
})

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BasketContent } from "@/components/basket-content"
import { BasketProvider, useBasket } from "@/lib/basket-context"

// Helper to render BasketContent with pre-populated basket
function renderWithItems(ids: string[]) {
  function Inner() {
    const { add } = useBasket()
    // Populate basket on mount
    return (
      <>
        <button
          data-testid="seed"
          onClick={() => ids.forEach((id) => add(id))}
        />
        <BasketContent />
      </>
    )
  }
  return render(
    <BasketProvider>
      <Inner />
    </BasketProvider>
  )
}

describe("BasketContent", () => {
  it("shows empty state when basket is empty", () => {
    render(
      <BasketProvider>
        <BasketContent />
      </BasketProvider>
    )
    expect(screen.getByText("Your basket is empty.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Browse The Pitch/i })).toBeInTheDocument()
  })

  it("shows items and total when basket has selections", async () => {
    const user = userEvent.setup()
    renderWithItems(["0-0", "1-0"])
    await user.click(screen.getByTestId("seed"))

    // R1C1 (£50) and R2C1 (£50)
    expect(screen.getByText("R1C1")).toBeInTheDocument()
    expect(screen.getByText("R2C1")).toBeInTheDocument()
    expect(screen.getByText(/Total: £100/)).toBeInTheDocument()
  })

  it("clears basket when Clear Basket is clicked", async () => {
    const user = userEvent.setup()
    renderWithItems(["0-0"])
    await user.click(screen.getByTestId("seed"))
    await user.click(screen.getByRole("button", { name: /Clear Basket/i }))

    expect(screen.getByText("Your basket is empty.")).toBeInTheDocument()
  })
})

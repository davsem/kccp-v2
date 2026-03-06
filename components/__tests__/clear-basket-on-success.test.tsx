import { describe, it, expect, vi } from "vitest"
import { render } from "@testing-library/react"
import { ClearBasketOnSuccess } from "@/components/checkout/clear-basket-on-success"

const mockClear = vi.fn()

vi.mock("@/lib/basket-context", () => ({
  useBasket: () => ({ clear: mockClear }),
}))

describe("ClearBasketOnSuccess", () => {
  it("calls clear() on mount", () => {
    render(<ClearBasketOnSuccess />)
    expect(mockClear).toHaveBeenCalledTimes(1)
  })

  it("renders nothing", () => {
    const { container } = render(<ClearBasketOnSuccess />)
    expect(container).toBeEmptyDOMElement()
  })
})

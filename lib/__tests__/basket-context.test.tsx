import { describe, it, expect } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { BasketProvider, useBasket } from "@/lib/basket-context"
import type { ReactNode } from "react"

const wrapper = ({ children }: { children: ReactNode }) => (
  <BasketProvider>{children}</BasketProvider>
)

describe("useBasket", () => {
  it("throws when used outside BasketProvider", () => {
    expect(() => renderHook(() => useBasket())).toThrow(
      "useBasket must be used within BasketProvider"
    )
  })

  it("starts with empty basket", () => {
    const { result } = renderHook(() => useBasket(), { wrapper })
    expect(result.current.count).toBe(0)
    expect(result.current.selectedIds.size).toBe(0)
  })

  it("add() adds an id", () => {
    const { result } = renderHook(() => useBasket(), { wrapper })
    act(() => result.current.add("0-0"))
    expect(result.current.count).toBe(1)
    expect(result.current.isSelected("0-0")).toBe(true)
  })

  it("add() is idempotent", () => {
    const { result } = renderHook(() => useBasket(), { wrapper })
    act(() => {
      result.current.add("0-0")
      result.current.add("0-0")
    })
    expect(result.current.count).toBe(1)
  })

  it("remove() removes an id", () => {
    const { result } = renderHook(() => useBasket(), { wrapper })
    act(() => result.current.add("0-0"))
    act(() => result.current.remove("0-0"))
    expect(result.current.count).toBe(0)
    expect(result.current.isSelected("0-0")).toBe(false)
  })

  it("toggle() adds when not selected", () => {
    const { result } = renderHook(() => useBasket(), { wrapper })
    act(() => result.current.toggle("1-1"))
    expect(result.current.isSelected("1-1")).toBe(true)
  })

  it("toggle() removes when already selected", () => {
    const { result } = renderHook(() => useBasket(), { wrapper })
    act(() => result.current.add("1-1"))
    act(() => result.current.toggle("1-1"))
    expect(result.current.isSelected("1-1")).toBe(false)
  })

  it("clear() empties the basket", () => {
    const { result } = renderHook(() => useBasket(), { wrapper })
    act(() => {
      result.current.add("0-0")
      result.current.add("1-1")
    })
    act(() => result.current.clear())
    expect(result.current.count).toBe(0)
  })

  it("isSelected() returns false for unknown id", () => {
    const { result } = renderHook(() => useBasket(), { wrapper })
    expect(result.current.isSelected("99-99")).toBe(false)
  })

  it("count reflects number of selected ids", () => {
    const { result } = renderHook(() => useBasket(), { wrapper })
    act(() => {
      result.current.add("0-0")
      result.current.add("0-1")
      result.current.add("0-2")
    })
    expect(result.current.count).toBe(3)
  })
})

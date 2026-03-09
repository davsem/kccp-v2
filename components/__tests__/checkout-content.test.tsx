import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CheckoutContent } from "@/components/checkout-content"
import type { Profile } from "@/lib/types"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSelectedIds = new Set<string>()
vi.mock("@/lib/basket-context", () => ({
  useBasket: () => ({ selectedIds: mockSelectedIds }),
}))

// Mock child steps to keep tests focused on orchestration
vi.mock("@/components/checkout/section-owner-names", () => ({
  SectionOwnerNames: ({ onContinue }: { onContinue: (configs: unknown[]) => void }) => (
    <button onClick={() => onContinue([{ section_id: "0-0", owner_name: "Alice", show_owner_name: true }])}>
      Continue to Billing
    </button>
  ),
}))

vi.mock("@/components/checkout/billing-payment", () => ({
  BillingPayment: ({
    onReview,
    onBack,
  }: {
    onReview: (billing: unknown, giftAid: boolean) => Promise<void>
    onBack: () => void
  }) => (
    <div>
      <button onClick={onBack}>Back</button>
      <button
        onClick={() =>
          onReview(
            { name: "Alice", address_line1: "1 Main", city: "London", postal_code: "W1", country: "GB" },
            false
          )
        }
      >
        Review Order
      </button>
    </div>
  ),
}))

vi.mock("@/components/checkout/order-review", () => ({
  OrderReview: ({ onBack }: { onBack: () => void }) => (
    <div>
      <span>Review & Pay</span>
      <button onClick={onBack}>Back</button>
    </div>
  ),
}))

const TEST_PROFILE: Profile = {
  id: "user-123",
  first_name: "Alice",
  last_name: "Smith",
  email: "alice@example.com",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
}

function renderCheckout() {
  return render(<CheckoutContent profile={TEST_PROFILE} />)
}

describe("CheckoutContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectedIds.clear()
  })

  it("shows empty basket state when no sections are selected", () => {
    renderCheckout()
    expect(screen.getByText(/Your basket is empty/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Browse The Pitch/i })).toBeInTheDocument()
  })

  it("'Browse The Pitch' button navigates to /pitch", async () => {
    const user = userEvent.setup()
    renderCheckout()
    await user.click(screen.getByRole("button", { name: /Browse The Pitch/i }))
    expect(mockPush).toHaveBeenCalledWith("/pitch")
  })

  it("shows step 1 (SectionOwnerNames) when basket has items", () => {
    mockSelectedIds.add("0-0")
    renderCheckout()
    expect(screen.getByRole("button", { name: /Continue to Billing/i })).toBeInTheDocument()
  })

  it("advances to step 2 (BillingPayment) after completing step 1", async () => {
    const user = userEvent.setup()
    mockSelectedIds.add("0-0")
    renderCheckout()

    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))
    expect(screen.getByRole("button", { name: /Review Order/i })).toBeInTheDocument()
  })

  it("goes back to step 1 from step 2", async () => {
    const user = userEvent.setup()
    mockSelectedIds.add("0-0")
    renderCheckout()

    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))
    await user.click(screen.getByRole("button", { name: /Back/i }))

    expect(screen.getByRole("button", { name: /Continue to Billing/i })).toBeInTheDocument()
  })

  it("advances to step 3 (OrderReview) after billing review succeeds", async () => {
    const user = userEvent.setup()
    mockSelectedIds.add("0-0")

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clientSecret: "pi_secret", orderId: "order-123" }),
    })

    renderCheckout()
    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))
    await user.click(screen.getByRole("button", { name: /Review Order/i }))

    await waitFor(() => {
      expect(screen.getByText("Review & Pay")).toBeInTheDocument()
    })
  })

  it("goes back to step 2 from step 3", async () => {
    const user = userEvent.setup()
    mockSelectedIds.add("0-0")

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clientSecret: "pi_secret", orderId: "order-123" }),
    })

    renderCheckout()
    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))
    await user.click(screen.getByRole("button", { name: /Review Order/i }))

    await waitFor(() => screen.getByText("Review & Pay"))
    await user.click(screen.getByRole("button", { name: /Back/i }))

    expect(screen.getByRole("button", { name: /Review Order/i })).toBeInTheDocument()
  })

  it("calls the payment intent API with correct payload", async () => {
    const user = userEvent.setup()
    mockSelectedIds.add("0-0")

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ clientSecret: "pi_secret", orderId: "order-123" }),
    })

    renderCheckout()
    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))
    await user.click(screen.getByRole("button", { name: /Review Order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/checkout/create-payment-intent",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("0-0"),
        })
      )
    })
  })
})

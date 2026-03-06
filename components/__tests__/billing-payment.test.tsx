import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BillingPayment } from "@/components/checkout/billing-payment"
import type { BillingAddress } from "@/lib/types"

const DEFAULT_NAME = "Alice Smith"
const MOCK_OWNER_CONFIGS = [{ section_id: "0-0", owner_name: DEFAULT_NAME, show_owner_name: true }]

function renderComponent(onReview = vi.fn().mockResolvedValue(undefined), onBack = vi.fn()) {
  return render(
    <BillingPayment
      defaultName={DEFAULT_NAME}
      sectionIds={["0-0"]}
      ownerConfigs={MOCK_OWNER_CONFIGS}
      onReview={onReview}
      onBack={onBack}
    />
  )
}

async function fillForm(user: ReturnType<typeof userEvent.setup>) {
  await user.clear(screen.getByLabelText(/Full name/i))
  await user.type(screen.getByLabelText(/Full name/i), "Alice Smith")
  await user.type(screen.getByLabelText(/Address line 1/i), "1 Main St")
  await user.type(screen.getByLabelText(/City/i), "London")
  await user.type(screen.getByLabelText(/Postcode/i), "W1A 1AA")
}

describe("BillingPayment", () => {
  it("renders all billing form fields", () => {
    renderComponent()
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Address line 1/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Address line 2/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Postcode/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument()
  })

  it("pre-fills name from defaultName prop", () => {
    renderComponent()
    expect(screen.getByLabelText(/Full name/i)).toHaveValue(DEFAULT_NAME)
  })

  it("defaults country to GB", () => {
    renderComponent()
    expect(screen.getByLabelText(/Country/i)).toHaveValue("GB")
  })

  it("shows GiftAid section", () => {
    renderComponent()
    expect(screen.getByRole("heading", { name: /GiftAid Declaration/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/I confirm the above GiftAid/i)).toBeInTheDocument()
  })

  it("calls onReview with billing data and giftAid=false by default", async () => {
    const user = userEvent.setup()
    const onReview = vi.fn().mockResolvedValue(undefined)
    renderComponent(onReview)
    await fillForm(user)

    await user.click(screen.getByRole("button", { name: /Review Order/i }))

    await waitFor(() => {
      expect(onReview).toHaveBeenCalledWith(
        expect.objectContaining<Partial<BillingAddress>>({
          name: "Alice Smith",
          address_line1: "1 Main St",
          city: "London",
          postal_code: "W1A 1AA",
          country: "GB",
        }),
        false // giftAid
      )
    })
  })

  it("calls onReview with giftAid=true when checkbox is ticked", async () => {
    const user = userEvent.setup()
    const onReview = vi.fn().mockResolvedValue(undefined)
    renderComponent(onReview)
    await fillForm(user)

    await user.click(screen.getByLabelText(/I confirm the above GiftAid/i))
    await user.click(screen.getByRole("button", { name: /Review Order/i }))

    await waitFor(() => {
      expect(onReview).toHaveBeenCalledWith(expect.any(Object), true)
    })
  })

  it("shows error message when onReview throws", async () => {
    const user = userEvent.setup()
    const onReview = vi.fn().mockRejectedValue(new Error("One or more sections are already sold"))
    renderComponent(onReview)
    await fillForm(user)

    await user.click(screen.getByRole("button", { name: /Review Order/i }))

    await waitFor(() => {
      expect(screen.getByText(/One or more sections are already sold/i)).toBeInTheDocument()
    })
  })

  it("disables submit button while loading", async () => {
    const user = userEvent.setup()
    let resolve: () => void
    const onReview = vi.fn().mockImplementation(() => new Promise<void>((r) => { resolve = r }))
    renderComponent(onReview)
    await fillForm(user)

    await user.click(screen.getByRole("button", { name: /Review Order/i }))

    expect(screen.getByRole("button", { name: /Processing/i })).toBeDisabled()
    resolve!()
  })

  it("calls onBack when Back button is clicked", async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    renderComponent(vi.fn(), onBack)

    await user.click(screen.getByRole("button", { name: /Back/i }))
    expect(onBack).toHaveBeenCalled()
  })
})

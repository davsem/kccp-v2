import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SectionOwnerNames } from "@/components/checkout/section-owner-names"

const DEFAULT_NAME = "Alice Smith"
const SECTION_IDS = ["0-0", "0-1"] // R1C1 and R1C2, both £50

function renderComponent(onContinue = vi.fn()) {
  return render(
    <SectionOwnerNames
      sectionIds={SECTION_IDS}
      defaultName={DEFAULT_NAME}
      onContinue={onContinue}
    />
  )
}

describe("SectionOwnerNames", () => {
  it("renders section labels and prices", () => {
    renderComponent()
    expect(screen.getByText("R1C1")).toBeInTheDocument()
    expect(screen.getByText("R1C2")).toBeInTheDocument()
  })

  it("shows default name in the bulk-name label", () => {
    renderComponent()
    expect(screen.getByText(DEFAULT_NAME, { exact: false })).toBeInTheDocument()
  })

  it("calls onContinue with default name for all sections when bulk toggle is on", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    renderComponent(onContinue)

    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))

    expect(onContinue).toHaveBeenCalledWith([
      { section_id: "0-0", owner_name: DEFAULT_NAME, show_owner_name: true },
      { section_id: "0-1", owner_name: DEFAULT_NAME, show_owner_name: true },
    ])
  })

  it("shows per-section input when 'Name differently' is clicked", async () => {
    const user = userEvent.setup()
    renderComponent()

    const nameDifferentlyBtns = screen.getAllByRole("button", { name: /Name differently/i })
    await user.click(nameDifferentlyBtns[0])

    expect(screen.getByPlaceholderText("Owner name")).toBeInTheDocument()
  })

  it("calls onContinue with overridden name for specific section", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    renderComponent(onContinue)

    // Override the name for the first section
    const nameDifferentlyBtns = screen.getAllByRole("button", { name: /Name differently/i })
    await user.click(nameDifferentlyBtns[0])

    const input = screen.getByPlaceholderText("Owner name")
    await user.clear(input)
    await user.type(input, "Bob Jones")

    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))

    const configs = onContinue.mock.calls[0][0]
    const firstConfig = configs.find((c: { section_id: string }) => c.section_id === "0-0")
    expect(firstConfig?.owner_name).toBe("Bob Jones")
    // Second section still uses default
    const secondConfig = configs.find((c: { section_id: string }) => c.section_id === "0-1")
    expect(secondConfig?.owner_name).toBe(DEFAULT_NAME)
  })

  it("toggling show_owner_name checkbox changes value in onContinue", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    renderComponent(onContinue)

    // Uncheck the "Show name publicly" for the first section
    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[0])

    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))

    const configs = onContinue.mock.calls[0][0]
    const firstConfig = configs.find((c: { section_id: string }) => c.section_id === "0-0")
    expect(firstConfig?.show_owner_name).toBe(false)
  })

  it("resetting bulk toggle restores default name for all sections", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    renderComponent(onContinue)

    // Turn off bulk toggle, then turn it back on
    const toggle = screen.getByRole("switch")
    await user.click(toggle) // off
    await user.click(toggle) // back on

    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))

    const configs = onContinue.mock.calls[0][0]
    configs.forEach((c: { owner_name: string }) => {
      expect(c.owner_name).toBe(DEFAULT_NAME)
    })
  })
})

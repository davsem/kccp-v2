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

  it("shows owner name on each section card by default", () => {
    renderComponent()
    const nameElements = screen.getAllByText(DEFAULT_NAME)
    expect(nameElements.length).toBe(SECTION_IDS.length)
  })

  it("calls onContinue with default name for all sections", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    renderComponent(onContinue)

    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))

    expect(onContinue).toHaveBeenCalledWith([
      { section_id: "0-0", owner_name: DEFAULT_NAME, show_owner_name: true },
      { section_id: "0-1", owner_name: DEFAULT_NAME, show_owner_name: true },
    ])
  })

  it("shows per-section input when 'Change sponsor name' is clicked", async () => {
    const user = userEvent.setup()
    renderComponent()

    const changeBtns = screen.getAllByRole("button", { name: /Change sponsor name/i })
    await user.click(changeBtns[0])

    expect(screen.getByPlaceholderText("Owner name")).toBeInTheDocument()
  })

  it("calls onContinue with overridden name for specific section", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    renderComponent(onContinue)

    const changeBtns = screen.getAllByRole("button", { name: /Change sponsor name/i })
    await user.click(changeBtns[0])

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

  it("renders 'Keep anonymous' checkboxes, unchecked by default", () => {
    renderComponent()
    const checkboxes = screen.getAllByRole("checkbox")
    expect(checkboxes).toHaveLength(SECTION_IDS.length)
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked())
  })

  it("'Keep anonymous' unchecked by default results in show_owner_name = true", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    renderComponent(onContinue)

    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))

    const configs = onContinue.mock.calls[0][0]
    configs.forEach((c: { show_owner_name: boolean }) => {
      expect(c.show_owner_name).toBe(true)
    })
  })

  it("checking 'Keep anonymous' results in show_owner_name = false", async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    renderComponent(onContinue)

    const checkboxes = screen.getAllByRole("checkbox")
    await user.click(checkboxes[0])

    await user.click(screen.getByRole("button", { name: /Continue to Billing/i }))

    const configs = onContinue.mock.calls[0][0]
    const firstConfig = configs.find((c: { section_id: string }) => c.section_id === "0-0")
    expect(firstConfig?.show_owner_name).toBe(false)
    // Second section unaffected
    const secondConfig = configs.find((c: { section_id: string }) => c.section_id === "0-1")
    expect(secondConfig?.show_owner_name).toBe(true)
  })
})

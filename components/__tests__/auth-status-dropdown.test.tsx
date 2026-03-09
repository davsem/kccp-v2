import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthStatusDropdown } from "@/components/auth-status-dropdown"
import type { ReactNode } from "react"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe("AuthStatusDropdown", () => {
  it("renders user email as trigger", () => {
    render(<AuthStatusDropdown email="user@example.com" />)
    expect(screen.getByText("user@example.com")).toBeInTheDocument()
  })

  it("renders Profile link after opening dropdown", async () => {
    const user = userEvent.setup()
    render(<AuthStatusDropdown email="user@example.com" />)
    await user.click(screen.getByText("user@example.com"))
    expect(screen.getByRole("menuitem", { name: "Profile" })).toBeInTheDocument()
  })

  it("renders Sign out button after opening dropdown", async () => {
    const user = userEvent.setup()
    render(<AuthStatusDropdown email="user@example.com" />)
    await user.click(screen.getByText("user@example.com"))
    expect(screen.getByRole("button", { name: /Sign out/i })).toBeInTheDocument()
  })
})

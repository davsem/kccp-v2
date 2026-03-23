import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { AuthStatusServer } from "@/components/auth-status-server"
import { TEST_USER } from "@/tests/mocks/supabase"
import type { User } from "@supabase/supabase-js"
import type { ReactNode } from "react"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock("@/components/ui/navigation-menu", () => ({
  navigationMenuTriggerStyle: () => "nav-trigger-style",
}))

vi.mock("@/components/auth-status-dropdown", () => ({
  AuthStatusDropdown: ({ email }: { email: string }) => (
    <div data-testid="auth-status-dropdown">{email}</div>
  ),
}))

describe("AuthStatusServer", () => {
  it("renders sign-in link when unauthenticated", () => {
    render(<AuthStatusServer user={null} pathname="/pitch" />)
    const link = screen.getByRole("link", { name: /Sign in/i })
    expect(link).toBeInTheDocument()
  })

  it("sign-in link includes redirectTo with current pathname", () => {
    render(<AuthStatusServer user={null} pathname="/pitch" />)
    const link = screen.getByRole("link", { name: /Sign in/i })
    expect(link).toHaveAttribute(
      "href",
      "/auth/sign-in?redirectTo=%2Fpitch"
    )
  })

  it("renders AuthStatusDropdown when authenticated", () => {
    render(<AuthStatusServer user={TEST_USER as User} pathname="/" />)
    expect(screen.getByTestId("auth-status-dropdown")).toBeInTheDocument()
    expect(screen.getByText("test@example.com")).toBeInTheDocument()
  })
})

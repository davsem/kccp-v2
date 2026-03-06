import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { createMockSupabaseClient, TEST_USER } from "@/tests/mocks/supabase"
import { AuthStatus } from "@/components/auth-status"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/"),
}))

const mockCreateClient = vi.fn()
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockCreateClient(),
}))

describe("AuthStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows Sign in link when unauthenticated", async () => {
    const mock = createMockSupabaseClient({ user: null })
    mockCreateClient.mockReturnValue(mock)

    render(<AuthStatus />)

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Sign in/i })).toBeInTheDocument()
    })
  })

  it("sign in link includes redirectTo param", async () => {
    const mock = createMockSupabaseClient({ user: null })
    mockCreateClient.mockReturnValue(mock)

    render(<AuthStatus />)

    await waitFor(() => {
      const link = screen.getByRole("link", { name: /Sign in/i })
      expect(link).toHaveAttribute("href", expect.stringContaining("/auth/sign-in"))
    })
  })

  it("shows user email when authenticated", async () => {
    const mock = createMockSupabaseClient({ user: TEST_USER })
    mockCreateClient.mockReturnValue(mock)

    render(<AuthStatus />)

    await waitFor(() => {
      expect(screen.getByText("test@example.com")).toBeInTheDocument()
    })
  })

  it("subscribes to onAuthStateChange and unsubscribes on unmount", async () => {
    const mock = createMockSupabaseClient({ user: null })
    mockCreateClient.mockReturnValue(mock)

    const { unmount } = render(<AuthStatus />)

    await waitFor(() => {
      expect(mock._mocks.onAuthStateChangeMock).toHaveBeenCalledOnce()
    })

    unmount()
    expect(mock._mocks.unsubscribeMock).toHaveBeenCalledOnce()
  })
})

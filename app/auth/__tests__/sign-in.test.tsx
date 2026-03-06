import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMockSupabaseClient } from "@/tests/mocks/supabase"
import { Suspense } from "react"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => mockSearchParams,
}))

const mockCreateClient = vi.fn()
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockCreateClient(),
}))

// Dynamic import to pick up mocks
const { default: SignInPage } = await import("@/app/auth/sign-in/page")

function renderSignIn() {
  return render(
    <Suspense>
      <SignInPage />
    </Suspense>
  )
}

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders email and password fields", () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mock)
    renderSignIn()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("renders Sign in submit button", () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mock)
    renderSignIn()
    expect(screen.getByRole("button", { name: /Sign in/i })).toBeInTheDocument()
  })

  it("renders Continue with Google button", () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mock)
    renderSignIn()
    expect(screen.getByRole("button", { name: /Continue with Google/i })).toBeInTheDocument()
  })

  it("calls signInWithPassword on form submit", async () => {
    const user = userEvent.setup()
    const mock = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mock)
    renderSignIn()

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /^Sign in$/i }))

    await waitFor(() => {
      expect(mock.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
    })
  })

  it("redirects to redirectTo param on success", async () => {
    const user = userEvent.setup()
    mockSearchParams.set("redirectTo", "/basket")
    const mock = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mock)
    renderSignIn()

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /^Sign in$/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/basket")
    })
    mockSearchParams.delete("redirectTo")
  })

  it("shows error message on sign-in failure", async () => {
    const user = userEvent.setup()
    const mock = createMockSupabaseClient({ signInError: "Invalid login credentials" })
    mockCreateClient.mockReturnValue(mock)
    renderSignIn()

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpassword")
    await user.click(screen.getByRole("button", { name: /^Sign in$/i }))

    await waitFor(() => {
      expect(screen.getByText("Incorrect email or password.")).toBeInTheDocument()
    })
  })

  it("shows loading state while signing in", async () => {
    const user = userEvent.setup()
    // Make signInWithPassword never resolve to keep loading state
    const mock = createMockSupabaseClient()
    mock.auth.signInWithPassword = vi.fn().mockReturnValue(new Promise(() => {}))
    mockCreateClient.mockReturnValue(mock)
    renderSignIn()

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /^Sign in$/i }))

    expect(screen.getByRole("button", { name: /Signing in/i })).toBeInTheDocument()
  })

  it("calls signInWithOAuth for Google", async () => {
    const user = userEvent.setup()
    // mock window.location.origin
    Object.defineProperty(window, "location", {
      value: { origin: "http://localhost:3000" },
      writable: true,
    })
    const mock = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mock)
    renderSignIn()

    await user.click(screen.getByRole("button", { name: /Continue with Google/i }))

    await waitFor(() => {
      expect(mock.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" })
      )
    })
  })
})

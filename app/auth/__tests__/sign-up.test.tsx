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

const mockSearchParams = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}))

const mockCreateClient = vi.fn()
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockCreateClient(),
}))

Object.defineProperty(window, "location", {
  value: { origin: "http://localhost:3000" },
  writable: true,
})

const { default: SignUpPage } = await import("@/app/auth/sign-up/page")

function renderSignUp() {
  return render(
    <Suspense>
      <SignUpPage />
    </Suspense>
  )
}

describe("SignUpPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders email and password fields", () => {
    mockCreateClient.mockReturnValue(createMockSupabaseClient())
    renderSignUp()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it("renders Create account button", () => {
    mockCreateClient.mockReturnValue(createMockSupabaseClient())
    renderSignUp()
    expect(screen.getByRole("button", { name: /Create account/i })).toBeInTheDocument()
  })

  it("calls signUp on form submit", async () => {
    const user = userEvent.setup()
    const mock = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mock)
    renderSignUp()

    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /Create account/i }))

    await waitFor(() => {
      expect(mock.auth.signUp).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new@example.com", password: "password123" })
      )
    })
  })

  it("shows confirmation message after successful sign-up", async () => {
    const user = userEvent.setup()
    mockCreateClient.mockReturnValue(createMockSupabaseClient())
    renderSignUp()

    await user.type(screen.getByLabelText(/email/i), "new@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /Create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/Check your email/i)).toBeInTheDocument()
    })
  })

  it("shows error on sign-up failure", async () => {
    const user = userEvent.setup()
    mockCreateClient.mockReturnValue(createMockSupabaseClient({ signUpError: "Email already registered" }))
    renderSignUp()

    await user.type(screen.getByLabelText(/email/i), "taken@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /Create account/i }))

    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument()
    })
  })

  it("calls signInWithOAuth for Google", async () => {
    const user = userEvent.setup()
    const mock = createMockSupabaseClient()
    mockCreateClient.mockReturnValue(mock)
    renderSignUp()

    await user.click(screen.getByRole("button", { name: /Continue with Google/i }))

    await waitFor(() => {
      expect(mock.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({ provider: "google" })
      )
    })
  })
})

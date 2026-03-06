import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMockSupabaseClient, TEST_USER } from "@/tests/mocks/supabase"
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

const { default: CompleteProfilePage } = await import("@/app/auth/complete-profile/page")

function renderPage() {
  return render(
    <Suspense>
      <CompleteProfilePage />
    </Suspense>
  )
}

describe("CompleteProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders first name, last name, email fields", async () => {
    mockCreateClient.mockReturnValue(createMockSupabaseClient({ user: TEST_USER }))
    renderPage()
    await waitFor(() => {
      expect(screen.getByLabelText(/First name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    })
  })

  it("pre-fills email from authenticated user", async () => {
    mockCreateClient.mockReturnValue(createMockSupabaseClient({ user: TEST_USER }))
    renderPage()
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toHaveValue("test@example.com")
    })
  })

  it("pre-fills name from Google full_name metadata", async () => {
    const user = { ...TEST_USER, user_metadata: { full_name: "Jane Doe" } }
    mockCreateClient.mockReturnValue(createMockSupabaseClient({ user }))
    renderPage()
    await waitFor(() => {
      expect(screen.getByLabelText(/First name/i)).toHaveValue("Jane")
      expect(screen.getByLabelText(/Last name/i)).toHaveValue("Doe")
    })
  })

  it("inserts profile and redirects on success", async () => {
    const userEvent_ = userEvent.setup()
    mockSearchParams.set("redirectTo", "/basket")
    const mock = createMockSupabaseClient({ user: TEST_USER }, { insertError: null })
    mockCreateClient.mockReturnValue(mock)
    renderPage()

    await waitFor(() => screen.getByLabelText(/First name/i))

    await userEvent_.clear(screen.getByLabelText(/First name/i))
    await userEvent_.type(screen.getByLabelText(/First name/i), "Test")
    await userEvent_.clear(screen.getByLabelText(/Last name/i))
    await userEvent_.type(screen.getByLabelText(/Last name/i), "User")
    await userEvent_.click(screen.getByRole("button", { name: /Save and continue/i }))

    await waitFor(() => {
      expect(mock.from).toHaveBeenCalledWith("profiles")
      expect(mockPush).toHaveBeenCalledWith("/basket")
    })
    mockSearchParams.delete("redirectTo")
  })

  it("shows error when profile insert fails", async () => {
    const userEvent_ = userEvent.setup()
    const mock = createMockSupabaseClient({ user: TEST_USER }, { insertError: "duplicate key" })
    mockCreateClient.mockReturnValue(mock)
    renderPage()

    await waitFor(() => screen.getByLabelText(/First name/i))

    await userEvent_.type(screen.getByLabelText(/First name/i), "Test")
    await userEvent_.type(screen.getByLabelText(/Last name/i), "User")
    await userEvent_.click(screen.getByRole("button", { name: /Save and continue/i }))

    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument()
    })
  })
})

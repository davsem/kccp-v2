import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMockSupabaseClient, TEST_USER } from "@/tests/mocks/supabase"
import { CompleteProfileForm } from "@/components/complete-profile-form"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockPush = vi.fn()
const mockRefresh = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

const mockCreateClient = vi.fn()
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockCreateClient(),
}))

const defaultProps = {
  email: "test@example.com",
  givenName: "",
  familyName: "",
  redirectTo: "/",
}

describe("CompleteProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders first name, last name, email fields", () => {
    mockCreateClient.mockReturnValue(createMockSupabaseClient({ user: TEST_USER }))
    render(<CompleteProfileForm {...defaultProps} />)
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
  })

  it("pre-fills email from prop", () => {
    mockCreateClient.mockReturnValue(createMockSupabaseClient({ user: TEST_USER }))
    render(<CompleteProfileForm {...defaultProps} email="test@example.com" />)
    expect(screen.getByLabelText(/Email/i)).toHaveValue("test@example.com")
  })

  it("pre-fills name from givenName and familyName props", () => {
    mockCreateClient.mockReturnValue(createMockSupabaseClient({ user: TEST_USER }))
    render(<CompleteProfileForm {...defaultProps} givenName="Jane" familyName="Doe" />)
    expect(screen.getByLabelText(/First name/i)).toHaveValue("Jane")
    expect(screen.getByLabelText(/Last name/i)).toHaveValue("Doe")
  })

  it("inserts profile and redirects on success", async () => {
    const userEvent_ = userEvent.setup()
    const mock = createMockSupabaseClient({ user: TEST_USER }, { insertError: null })
    mockCreateClient.mockReturnValue(mock)
    render(<CompleteProfileForm {...defaultProps} givenName="Test" familyName="User" redirectTo="/basket" />)

    await userEvent_.click(screen.getByRole("button", { name: /Save and continue/i }))

    await waitFor(() => {
      expect(mock.from).toHaveBeenCalledWith("profiles")
      expect(mockPush).toHaveBeenCalledWith("/basket")
    })
  })

  it("shows error when profile insert fails", async () => {
    const userEvent_ = userEvent.setup()
    const mock = createMockSupabaseClient({ user: TEST_USER }, { insertError: "duplicate key" })
    mockCreateClient.mockReturnValue(mock)
    render(<CompleteProfileForm {...defaultProps} givenName="Test" familyName="User" />)

    await userEvent_.click(screen.getByRole("button", { name: /Save and continue/i }))

    await waitFor(() => {
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument()
    })
  })
})

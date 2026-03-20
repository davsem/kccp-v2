import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { BasketProvider } from "@/lib/basket-context"
import type { ReactNode } from "react"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

function makeMockSupabase(result: { data: unknown; error: unknown }) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(result),
    }),
  }
}

const mockCreateClient = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}))

// Dynamic import to pick up mocks
const { default: PitchPage, PitchGridLoader } = await import("@/app/pitch/page")

const wrapper = ({ children }: { children: ReactNode }) => (
  <BasketProvider>{children}</BasketProvider>
)

describe("PitchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.cookie = "kccp-basket=; max-age=0; path=/"
  })

  it("renders the page heading", () => {
    render(PitchPage(), { wrapper })
    expect(screen.getByRole("heading", { name: /the pitch/i })).toBeInTheDocument()
  })

  it("renders the pitch grid when fetch succeeds", async () => {
    mockCreateClient.mockResolvedValue(
      makeMockSupabase({
        data: [{ section_id: "R1C1", owner_name: null, show_owner_name: false }],
        error: null,
      })
    )

    render(await PitchGridLoader(), { wrapper })

    expect(screen.getByText(/sections selected/i)).toBeInTheDocument()
  })

  it("renders error UI when fetch fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeMockSupabase({ data: null, error: { message: "connection failed" } })
    )

    render(await PitchGridLoader(), { wrapper })

    expect(screen.getByText(/unable to load pitch data/i)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /try again/i })).toHaveAttribute("href", "/pitch")
    expect(screen.queryByText(/sections selected/i)).not.toBeInTheDocument()
  })

  it("renders no interactive grid cells when fetch fails", async () => {
    mockCreateClient.mockResolvedValue(
      makeMockSupabase({ data: null, error: { message: "connection failed" } })
    )

    const { container } = render(await PitchGridLoader(), { wrapper })

    expect(container.querySelectorAll("button")).toHaveLength(0)
  })
})

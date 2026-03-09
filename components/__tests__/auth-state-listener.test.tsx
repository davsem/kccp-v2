import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { mockRouter, mockRefresh } from "@/tests/mocks/next-navigation"
import { AuthStateListener } from "@/components/auth-state-listener"

// next/navigation mock is applied via the import of next-navigation mock module
vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}))

const mockUnsubscribe = vi.fn()
let authStateChangeCallback: ((event: string) => void) | null = null

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      onAuthStateChange: vi.fn((cb: (event: string) => void) => {
        authStateChangeCallback = cb
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } }
      }),
    },
  }),
}))

describe("AuthStateListener", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authStateChangeCallback = null
  })

  it("renders null", () => {
    const { container } = render(<AuthStateListener />)
    expect(container.firstChild).toBeNull()
  })

  it("calls router.refresh on SIGNED_IN", () => {
    render(<AuthStateListener />)
    authStateChangeCallback?.("SIGNED_IN")
    expect(mockRefresh).toHaveBeenCalledOnce()
  })

  it("calls router.refresh on SIGNED_OUT", () => {
    render(<AuthStateListener />)
    authStateChangeCallback?.("SIGNED_OUT")
    expect(mockRefresh).toHaveBeenCalledOnce()
  })

  it("calls router.refresh on TOKEN_REFRESHED", () => {
    render(<AuthStateListener />)
    authStateChangeCallback?.("TOKEN_REFRESHED")
    expect(mockRefresh).toHaveBeenCalledOnce()
  })

  it("does not call router.refresh for other events", () => {
    render(<AuthStateListener />)
    authStateChangeCallback?.("USER_UPDATED")
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it("unsubscribes on unmount", () => {
    const { unmount } = render(<AuthStateListener />)
    unmount()
    expect(mockUnsubscribe).toHaveBeenCalledOnce()
  })
})

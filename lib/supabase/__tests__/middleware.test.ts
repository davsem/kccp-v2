import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { createMockSupabaseClient, TEST_USER } from "@/tests/mocks/supabase"

// Mock @supabase/ssr before importing middleware
const mockCreateServerClient = vi.fn()
vi.mock("@supabase/ssr", () => ({
  createServerClient: mockCreateServerClient,
}))

// Import after mock
const { updateSession } = await import("@/lib/supabase/middleware")

function makeRequest(pathname: string, origin = "http://localhost:3000") {
  return new NextRequest(`${origin}${pathname}`)
}

describe("updateSession middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("Phase A: always calls getUser()", async () => {
    const mock = createMockSupabaseClient({ user: null })
    mockCreateServerClient.mockReturnValue(mock)

    await updateSession(makeRequest("/"))

    expect(mock.auth.getUser).toHaveBeenCalledOnce()
  })

  it("Phase B: unauthenticated + protected route → redirect to sign-in", async () => {
    const mock = createMockSupabaseClient({ user: null })
    mockCreateServerClient.mockReturnValue(mock)

    const response = await updateSession(makeRequest("/profile"))

    expect(response.status).toBe(307)
    const location = response.headers.get("location")
    expect(location).toContain("/auth/sign-in")
    expect(location).toContain("redirectTo=%2Fprofile")
  })

  it("Phase B: unauthenticated + /profile → redirect to sign-in", async () => {
    const mock = createMockSupabaseClient({ user: null })
    mockCreateServerClient.mockReturnValue(mock)

    const response = await updateSession(makeRequest("/profile"))

    expect(response.status).toBe(307)
    const location = response.headers.get("location")
    expect(location).toContain("/auth/sign-in")
  })

  it("Phase B: unauthenticated + public route → passes through", async () => {
    const mock = createMockSupabaseClient({ user: null })
    mockCreateServerClient.mockReturnValue(mock)

    const response = await updateSession(makeRequest("/"))

    expect(response.status).toBe(200)
  })

  it("Phase C: authenticated + protected + no profile → redirect to complete-profile", async () => {
    const mock = createMockSupabaseClient({ user: TEST_USER }, { profile: null })
    mockCreateServerClient.mockReturnValue(mock)

    const response = await updateSession(makeRequest("/profile"))

    expect(response.status).toBe(307)
    const location = response.headers.get("location")
    expect(location).toContain("/auth/complete-profile")
    expect(location).toContain("redirectTo=%2Fprofile")
  })

  it("happy path: authenticated + profile → passes through", async () => {
    const mock = createMockSupabaseClient({ user: TEST_USER }, { profile: { id: "user-123" } })
    mockCreateServerClient.mockReturnValue(mock)

    const response = await updateSession(makeRequest("/profile"))

    expect(response.status).toBe(200)
  })

  it("authenticated + public route → no profile check", async () => {
    const mock = createMockSupabaseClient({ user: TEST_USER })
    mockCreateServerClient.mockReturnValue(mock)

    await updateSession(makeRequest("/pitch"))

    expect(mock.from).not.toHaveBeenCalled()
  })
})

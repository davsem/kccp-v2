import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient } from "@/tests/mocks/supabase"

const mockCreateClient = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}))

const { GET } = await import("@/app/auth/callback/route")

describe("GET /auth/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("exchanges code for session and redirects to next param", async () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockResolvedValue(mock)

    const request = new Request("http://localhost:3000/auth/callback?code=abc123&next=%2Fbasket")
    const response = await GET(request)

    expect(mock.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc123")
    expect(response.status).toBe(307)
    expect(response.headers.get("location")).toBe("http://localhost:3000/basket")
  })

  it("redirects to / when no next param", async () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockResolvedValue(mock)

    const request = new Request("http://localhost:3000/auth/callback?code=abc123")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe("http://localhost:3000/")
  })

  it("redirects to auth-code-error when no code", async () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockResolvedValue(mock)

    const request = new Request("http://localhost:3000/auth/callback")
    const response = await GET(request)

    expect(mock.auth.exchangeCodeForSession).not.toHaveBeenCalled()
    expect(response.headers.get("location")).toBe("http://localhost:3000/auth/auth-code-error")
  })

  it("redirects to auth-code-error when exchange fails", async () => {
    const mock = createMockSupabaseClient({ exchangeError: "invalid_grant" })
    mockCreateClient.mockResolvedValue(mock)

    const request = new Request("http://localhost:3000/auth/callback?code=badcode")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe("http://localhost:3000/auth/auth-code-error")
  })

  it("blocks open redirect attack via next param", async () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockResolvedValue(mock)

    const request = new Request("http://localhost:3000/auth/callback?code=abc123&next=https://evil.com")
    const response = await GET(request)

    expect(response.headers.get("location")).toBe("http://localhost:3000/")
  })
})

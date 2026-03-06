import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"
import { createMockSupabaseClient } from "@/tests/mocks/supabase"

const mockCreateClient = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}))

const { POST } = await import("@/app/auth/sign-out/route")

describe("POST /auth/sign-out", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls signOut and redirects to /", async () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockResolvedValue(mock)

    const request = new NextRequest("http://localhost:3000/auth/sign-out", { method: "POST" })
    const response = await POST(request)

    expect(mock.auth.signOut).toHaveBeenCalledOnce()
    expect(response.status).toBe(302)
    expect(response.headers.get("location")).toBe("http://localhost:3000/")
  })
})

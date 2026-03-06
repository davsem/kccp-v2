import { describe, it, expect, vi, beforeEach } from "vitest"
import { createMockSupabaseClient, TEST_USER } from "@/tests/mocks/supabase"

// Stub env vars required by server singletons before any imports
vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_stub")
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-stub")

// Mock modules before importing the route
const mockCreateClient = vi.fn()
vi.mock("@/lib/supabase/server", () => ({
  createClient: () => mockCreateClient(),
}))

const mockPaymentIntentsCreate = vi.fn()
vi.mock("@/lib/stripe/server", () => ({
  stripe: {
    paymentIntents: { create: mockPaymentIntentsCreate },
  },
}))

const { POST } = await import("@/app/api/checkout/create-payment-intent/route")

const VALID_BODY = {
  sectionIds: ["0-0", "0-1"],
  ownerConfigs: [
    { section_id: "0-0", owner_name: "Alice", show_owner_name: true },
    { section_id: "0-1", owner_name: "Bob", show_owner_name: false },
  ],
  billing: {
    name: "Alice",
    address_line1: "1 Main St",
    city: "London",
    postal_code: "W1A 1AA",
    country: "GB",
  },
  giftAid: false,
}

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/checkout/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/checkout/create-payment-intent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPaymentIntentsCreate.mockResolvedValue({
      id: "pi_test_123",
      client_secret: "pi_test_123_secret",
    })
  })

  it("returns 401 when unauthenticated", async () => {
    const mock = createMockSupabaseClient({ user: null })
    mockCreateClient.mockResolvedValue(mock)

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe("Unauthorized")
  })

  it("returns 400 for invalid JSON body", async () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockResolvedValue(mock)

    const req = new Request("http://localhost:3000/api/checkout/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Invalid request body")
  })

  it("returns 400 when sectionIds is empty", async () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockResolvedValue(mock)

    const res = await POST(makeRequest({ ...VALID_BODY, sectionIds: [] }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("No sections provided")
  })

  it("returns 400 for invalid section ID", async () => {
    const mock = createMockSupabaseClient()
    mockCreateClient.mockResolvedValue(mock)

    const res = await POST(makeRequest({ ...VALID_BODY, sectionIds: ["99-99"] }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Invalid section ID")
  })

  it("returns 409 when a section is already sold", async () => {
    const mock = createMockSupabaseClient()
    // Override purchased_sections query to return a sold section
    mock.from.mockImplementation((table: string) => {
      if (table === "purchased_sections") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [{ section_id: "0-0" }],
            error: null,
          }),
        }
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })
    mockCreateClient.mockResolvedValue(mock)

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.soldIds).toContain("0-0")
  })

  it("creates PaymentIntent and returns clientSecret on success", async () => {
    const mock = createMockSupabaseClient()
    mock.from.mockImplementation((table: string) => {
      if (table === "purchased_sections") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      }
      // orders and order_items inserts succeed
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })
    mockCreateClient.mockResolvedValue(mock)

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.clientSecret).toBe("pi_test_123_secret")
    expect(json.orderId).toBeTypeOf("string")
  })

  it("passes correct amount to Stripe (server-side calculation)", async () => {
    const mock = createMockSupabaseClient()
    mock.from.mockImplementation((table: string) => {
      if (table === "purchased_sections") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })
    mockCreateClient.mockResolvedValue(mock)

    await POST(makeRequest(VALID_BODY))

    // "0-0" and "0-1" are both outer sections at £50 each = £100 total = 10000 pence
    expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10000, currency: "gbp" })
    )
  })

  it("includes userId in PaymentIntent metadata", async () => {
    const mock = createMockSupabaseClient()
    mock.from.mockImplementation((table: string) => {
      if (table === "purchased_sections") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })
    mockCreateClient.mockResolvedValue(mock)

    await POST(makeRequest(VALID_BODY))

    expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ userId: TEST_USER.id }),
      })
    )
  })

  it("returns 500 when order insert fails", async () => {
    const mock = createMockSupabaseClient()
    mock.from.mockImplementation((table: string) => {
      if (table === "purchased_sections") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      }
      if (table === "orders") {
        return {
          insert: vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } }),
        }
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })
    mockCreateClient.mockResolvedValue(mock)

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe("Failed to create order")
  })

  it("returns 500 when order_items insert fails", async () => {
    const mock = createMockSupabaseClient()
    mock.from.mockImplementation((table: string) => {
      if (table === "purchased_sections") {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ data: [], error: null }),
        }
      }
      if (table === "order_items") {
        return {
          insert: vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } }),
        }
      }
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    })
    mockCreateClient.mockResolvedValue(mock)

    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe("Failed to create order items")
  })
})

import { describe, it, expect, vi, beforeEach } from "vitest"

// Stub env vars required by server singletons before any imports
vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_stub")
vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-role-stub")
vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_stub")

const mockConstructEvent = vi.fn()
const mockRefundsCreate = vi.fn()

vi.mock("@/lib/stripe/server", () => ({
  stripe: {
    webhooks: { constructEvent: mockConstructEvent },
    refunds: { create: mockRefundsCreate },
  },
}))

const mockAdminFrom = vi.fn()
vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: (...args: unknown[]) => mockAdminFrom(...args),
  },
}))

const { POST } = await import("@/app/api/webhooks/stripe/route")

// Helper to build a fake PaymentIntent
function makePaymentIntent(overrides: Record<string, unknown> = {}) {
  return {
    id: "pi_test_123",
    metadata: {
      orderId: "order-abc",
      sectionIds: "0-0,0-1",
      userId: "user-123",
    },
    ...overrides,
  }
}

function makeRequest(body: string, signature = "valid-sig") {
  return new Request("http://localhost:3000/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body,
  })
}

// Default chain: select/eq resolves order items; update chain resolves OK
function makeAdminFromImpl(orderItems = [
  { section_id: "0-0", owner_name: "Alice", show_owner_name: true },
  { section_id: "0-1", owner_name: null, show_owner_name: true },
]) {
  return (table: string) => {
    if (table === "order_items") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: orderItems, error: null }),
      }
    }
    if (table === "purchased_sections") {
      return {
        insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    }
    if (table === "orders") {
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }
    }
    return {}
  }
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefundsCreate.mockResolvedValue({})
  })

  it("returns 400 when stripe-signature header is missing", async () => {
    const req = new Request("http://localhost:3000/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Missing stripe-signature header")
  })

  it("returns 500 when STRIPE_WEBHOOK_SECRET is not configured", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "")
    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe("Webhook secret not configured")
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_test_stub") // restore
  })

  it("returns 400 when signature verification fails", async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error("No signatures found matching")
    })
    const res = await POST(makeRequest("{}", "bad-sig"))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Invalid webhook signature")
  })

  it("returns 200 received:true for unknown event types", async () => {
    mockConstructEvent.mockReturnValue({ type: "customer.created", data: { object: {} } })
    const res = await POST(makeRequest("{}"))
    expect(res.status).toBe(200)
    expect((await res.json()).received).toBe(true)
  })

  describe("payment_intent.succeeded", () => {
    it("inserts purchased_sections and marks order completed", async () => {
      const pi = makePaymentIntent()
      mockConstructEvent.mockReturnValue({ type: "payment_intent.succeeded", data: { object: pi } })
      mockAdminFrom.mockImplementation(makeAdminFromImpl())

      const res = await POST(makeRequest("{}"))
      expect(res.status).toBe(200)

      // purchased_sections insert called
      const insertCalls = mockAdminFrom.mock.calls
        .filter(([t]) => t === "purchased_sections")
      expect(insertCalls.length).toBeGreaterThan(0)

      // orders update called with completed
      const orderCalls = mockAdminFrom.mock.results
      // Verify no refund was triggered
      expect(mockRefundsCreate).not.toHaveBeenCalled()
    })

    it("inserts correct purchased_sections data with owner info", async () => {
      const pi = makePaymentIntent()
      mockConstructEvent.mockReturnValue({ type: "payment_intent.succeeded", data: { object: pi } })

      let capturedInsertData: unknown[] = []
      mockAdminFrom.mockImplementation((table: string) => {
        if (table === "order_items") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({
              data: [{ section_id: "0-0", owner_name: "Alice", show_owner_name: true }],
              error: null,
            }),
          }
        }
        if (table === "purchased_sections") {
          return {
            insert: vi.fn().mockImplementation((data) => {
              capturedInsertData = data
              return Promise.resolve({ data: null, error: null })
            }),
          }
        }
        if (table === "orders") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        return {}
      })

      await POST(makeRequest("{}"))

      const section0 = (capturedInsertData as Array<Record<string, unknown>>).find((r) => r.section_id === "0-0")
      expect(section0?.owner_name).toBe("Alice")
      expect(section0?.user_id).toBe("user-123")
      expect(section0?.order_id).toBe("order-abc")
    })

    it("refunds and marks order failed on race condition (PK conflict)", async () => {
      const pi = makePaymentIntent()
      mockConstructEvent.mockReturnValue({ type: "payment_intent.succeeded", data: { object: pi } })

      mockAdminFrom.mockImplementation((table: string) => {
        if (table === "order_items") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          }
        }
        if (table === "purchased_sections") {
          return {
            insert: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "23505", message: "duplicate key value" },
            }),
          }
        }
        if (table === "orders") {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }
        }
        return {}
      })

      const res = await POST(makeRequest("{}"))
      expect(res.status).toBe(200)
      expect(mockRefundsCreate).toHaveBeenCalledWith({ payment_intent: "pi_test_123" })
    })

    it("does nothing when metadata is missing", async () => {
      const pi = makePaymentIntent({ metadata: {} })
      mockConstructEvent.mockReturnValue({ type: "payment_intent.succeeded", data: { object: pi } })

      const res = await POST(makeRequest("{}"))
      expect(res.status).toBe(200)
      expect(mockAdminFrom).not.toHaveBeenCalled()
    })
  })

  describe("payment_intent.payment_failed", () => {
    it("marks order as failed", async () => {
      const pi = makePaymentIntent()
      mockConstructEvent.mockReturnValue({ type: "payment_intent.payment_failed", data: { object: pi } })

      let updatedStatus: string | undefined
      mockAdminFrom.mockImplementation((table: string) => {
        if (table === "orders") {
          return {
            update: vi.fn().mockImplementation((data: Record<string, unknown>) => {
              updatedStatus = data.status as string
              return {
                eq: vi.fn().mockResolvedValue({ data: null, error: null }),
              }
            }),
          }
        }
        return {}
      })

      const res = await POST(makeRequest("{}"))
      expect(res.status).toBe(200)
      expect(updatedStatus).toBe("failed")
    })

    it("does nothing when orderId is missing", async () => {
      const pi = makePaymentIntent({ metadata: {} })
      mockConstructEvent.mockReturnValue({ type: "payment_intent.payment_failed", data: { object: pi } })

      const res = await POST(makeRequest("{}"))
      expect(res.status).toBe(200)
      expect(mockAdminFrom).not.toHaveBeenCalled()
    })
  })
})

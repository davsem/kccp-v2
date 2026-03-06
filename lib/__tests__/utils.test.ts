import { describe, it, expect } from "vitest"
import { cn, safeRedirectPath, validateName, sanitizeAuthError } from "@/lib/utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("deduplicates Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })

  it("filters falsy values", () => {
    expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar")
  })

  it("handles conditional objects", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500")
  })

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("")
  })
})

describe("safeRedirectPath", () => {
  it("returns valid path unchanged", () => {
    expect(safeRedirectPath("/basket")).toBe("/basket")
  })

  it("returns nested path unchanged", () => {
    expect(safeRedirectPath("/auth/complete-profile")).toBe("/auth/complete-profile")
  })

  it("rejects absolute URL", () => {
    expect(safeRedirectPath("https://evil.com")).toBe("/")
  })

  it("rejects protocol-relative URL", () => {
    expect(safeRedirectPath("//evil.com")).toBe("/")
  })

  it("rejects javascript: scheme", () => {
    expect(safeRedirectPath("javascript:alert(1)")).toBe("/")
  })

  it("rejects data: scheme", () => {
    expect(safeRedirectPath("data:text/html,<script>")).toBe("/")
  })

  it("rejects encoded absolute URL (%2F%2F)", () => {
    expect(safeRedirectPath("/%2F%2Fevil.com")).toBe("/")
  })

  it("rejects encoded https scheme", () => {
    expect(safeRedirectPath("https%3A%2F%2Fevil.com")).toBe("/")
  })

  it("returns / for empty string", () => {
    expect(safeRedirectPath("")).toBe("/")
  })

  it("returns / for whitespace", () => {
    expect(safeRedirectPath("   ")).toBe("/")
  })
})

describe("validateName", () => {
  it("returns trimmed value for valid name", () => {
    expect(validateName("  Alice  ")).toBe("Alice")
  })

  it("accepts single character", () => {
    expect(validateName("A")).toBe("A")
  })

  it("accepts 100 characters", () => {
    expect(validateName("a".repeat(100))).toBe("a".repeat(100))
  })

  it("returns null for empty string", () => {
    expect(validateName("")).toBeNull()
  })

  it("returns null for whitespace only", () => {
    expect(validateName("   ")).toBeNull()
  })

  it("returns null for 101 characters", () => {
    expect(validateName("a".repeat(101))).toBeNull()
  })

  it("accepts hyphenated name", () => {
    expect(validateName("O'Brien-Smith")).toBe("O'Brien-Smith")
  })

  it("accepts accented characters", () => {
    expect(validateName("José")).toBe("José")
  })
})

describe("sanitizeAuthError", () => {
  it("maps Invalid login credentials", () => {
    expect(sanitizeAuthError("Invalid login credentials")).toBe("Incorrect email or password.")
  })

  it("maps Email not confirmed", () => {
    expect(sanitizeAuthError("Email not confirmed")).toBe("Please check your email and confirm your account.")
  })

  it("maps User already registered", () => {
    expect(sanitizeAuthError("User already registered")).toBe("An account with this email already exists.")
  })

  it("maps Email rate limit exceeded", () => {
    expect(sanitizeAuthError("Email rate limit exceeded")).toBe("Too many attempts. Please try again later.")
  })

  it("maps partial rate-limit message with dynamic suffix", () => {
    expect(sanitizeAuthError("For security purposes, you can only request this after 60 seconds")).toBe(
      "Too many attempts. Please wait a moment and try again."
    )
  })

  it("falls back for unknown errors", () => {
    expect(sanitizeAuthError("Some unexpected Supabase error")).toBe("Something went wrong. Please try again.")
  })
})

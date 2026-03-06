import { vi } from "vitest"
import type { User } from "@supabase/supabase-js"

export const TEST_USER: Partial<User> = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: {},
}

export const TEST_PROFILE = {
  id: "user-123",
  first_name: "Test",
  last_name: "User",
  email: "test@example.com",
}

interface AuthConfig {
  user?: Partial<User> | null
  signInError?: string | null
  signUpError?: string | null
  oauthError?: string | null
  exchangeError?: string | null
  signOutError?: string | null
}

interface DbConfig {
  profile?: object | null
  insertError?: string | null
}

export function createMockSupabaseClient(
  authConfig: AuthConfig = {},
  dbConfig: DbConfig = {}
) {
  const {
    user = TEST_USER,
    signInError = null,
    signUpError = null,
    oauthError = null,
    exchangeError = null,
    signOutError = null,
  } = authConfig

  const { profile = TEST_PROFILE, insertError = null } = dbConfig

  const unsubscribeMock = vi.fn()
  const onAuthStateChangeMock = vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: unsubscribeMock } },
  })

  const fromMock = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: profile, error: null }),
    insert: vi.fn().mockResolvedValue({
      data: null,
      error: insertError ? { message: insertError } : null,
    }),
  })

  const mockAuth = {
    getUser: vi.fn().mockResolvedValue({
      data: { user: user as User | null },
      error: null,
    }),
    signInWithPassword: vi.fn().mockResolvedValue({
      data: {},
      error: signInError ? { message: signInError } : null,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: {},
      error: oauthError ? { message: oauthError } : null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: {},
      error: signUpError ? { message: signUpError } : null,
    }),
    signOut: vi.fn().mockResolvedValue({
      error: signOutError ? { message: signOutError } : null,
    }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({
      data: {},
      error: exchangeError ? { message: exchangeError } : null,
    }),
    onAuthStateChange: onAuthStateChangeMock,
  }

  return {
    auth: mockAuth,
    from: fromMock,
    _mocks: { unsubscribeMock, onAuthStateChangeMock },
  }
}

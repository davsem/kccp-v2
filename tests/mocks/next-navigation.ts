import { vi } from "vitest"

export const mockPush = vi.fn()
export const mockRefresh = vi.fn()
export const mockReplace = vi.fn()

export const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  refresh: mockRefresh,
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
}

export const mockPathname = vi.fn().mockReturnValue("/")
export const mockSearchParams = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: mockPathname,
  useSearchParams: () => mockSearchParams,
}))

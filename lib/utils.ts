import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeRedirectPath(path: string): string {
  try {
    const decoded = decodeURIComponent(path)
    if (
      typeof decoded !== "string" ||
      !decoded.startsWith("/") ||
      decoded.startsWith("//") ||
      /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)
    ) {
      return "/"
    }
    return decoded.trim()
  } catch {
    return "/"
  }
}

export function validateName(value: string): string | null {
  const trimmed = value.trim()
  if (trimmed.length < 1 || trimmed.length > 100) return null
  return trimmed
}

const AUTH_ERROR_MAP: Array<[string, string]> = [
  ["Invalid login credentials", "Incorrect email or password."],
  ["Email not confirmed", "Please check your email and confirm your account."],
  ["User already registered", "An account with this email already exists."],
  ["Email rate limit exceeded", "Too many attempts. Please try again later."],
  ["For security purposes, you can only request this after", "Too many attempts. Please wait a moment and try again."],
]

export function sanitizeAuthError(message: string): string {
  for (const [pattern, friendly] of AUTH_ERROR_MAP) {
    if (message.includes(pattern)) return friendly
  }
  return "Something went wrong. Please try again."
}

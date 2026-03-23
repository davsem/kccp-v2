import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { AuthStatusDropdown } from "@/components/auth-status-dropdown"
import type { ReactNode } from "react"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

vi.mock("@/components/ui/navigation-menu", () => ({
  NavigationMenu: ({ children }: { children: ReactNode }) => <nav>{children}</nav>,
  NavigationMenuList: ({ children }: { children: ReactNode }) => <ul>{children}</ul>,
  NavigationMenuItem: ({ children }: { children: ReactNode }) => <li>{children}</li>,
  NavigationMenuTrigger: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <button {...props}>{children}</button>
  ),
  NavigationMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  NavigationMenuLink: ({ children, asChild }: { children: ReactNode; asChild?: boolean; [key: string]: unknown }) => {
    if (asChild) return <>{children}</>
    return <a>{children}</a>
  },
  navigationMenuTriggerStyle: () => "nav-trigger-style",
}))

describe("AuthStatusDropdown", () => {
  it("renders user email as trigger", () => {
    render(<AuthStatusDropdown email="user@example.com" />)
    expect(screen.getByText("user@example.com")).toBeInTheDocument()
  })

  it("renders Profile link", () => {
    render(<AuthStatusDropdown email="user@example.com" />)
    expect(screen.getByRole("link", { name: "Profile" })).toBeInTheDocument()
  })

  it("renders Sign out button", () => {
    render(<AuthStatusDropdown email="user@example.com" />)
    expect(screen.getByRole("button", { name: /Sign out/i })).toBeInTheDocument()
  })
})

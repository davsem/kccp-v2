import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { NavLinks } from "@/components/nav-links"
import type { ReactNode } from "react"

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

const mockUsePathname = vi.fn().mockReturnValue("/")
vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}))

vi.mock("@/components/ui/navigation-menu", () => ({
  NavigationMenu: ({ children }: { children: ReactNode }) => <nav>{children}</nav>,
  NavigationMenuList: ({ children }: { children: ReactNode }) => <ul>{children}</ul>,
  NavigationMenuItem: ({ children }: { children: ReactNode }) => <li>{children}</li>,
  NavigationMenuLink: ({ children, className, asChild }: { children: ReactNode; className?: string; asChild?: boolean }) => {
    if (asChild && children) {
      const child = children as React.ReactElement<{ className?: string }>
      return { ...child, props: { ...child.props, className } }
    }
    return <a className={className}>{children}</a>
  },
  navigationMenuTriggerStyle: () => "nav-trigger-style",
}))

describe("NavLinks", () => {
  it("renders Home and The Pitch links", () => {
    render(<NavLinks />)
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "The Pitch" })).toBeInTheDocument()
  })

  it("applies active class to Home when pathname is /", () => {
    mockUsePathname.mockReturnValue("/")
    render(<NavLinks />)
    expect(screen.getByRole("link", { name: "Home" })).toHaveClass("bg-accent")
    expect(screen.getByRole("link", { name: "The Pitch" })).not.toHaveClass("bg-accent")
  })

  it("applies active class to The Pitch when pathname is /pitch", () => {
    mockUsePathname.mockReturnValue("/pitch")
    render(<NavLinks />)
    expect(screen.getByRole("link", { name: "The Pitch" })).toHaveClass("bg-accent")
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveClass("bg-accent")
  })
})

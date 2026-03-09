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

describe("NavLinks", () => {
  it("renders Home and The Pitch links", () => {
    render(<NavLinks />)
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "The Pitch" })).toBeInTheDocument()
  })

  it("applies active class to Home when pathname is /", () => {
    mockUsePathname.mockReturnValue("/")
    render(<NavLinks />)
    expect(screen.getByRole("link", { name: "Home" })).toHaveClass("font-medium")
    expect(screen.getByRole("link", { name: "The Pitch" })).not.toHaveClass("font-medium")
  })

  it("applies active class to The Pitch when pathname is /pitch", () => {
    mockUsePathname.mockReturnValue("/pitch")
    render(<NavLinks />)
    expect(screen.getByRole("link", { name: "The Pitch" })).toHaveClass("font-medium")
    expect(screen.getByRole("link", { name: "Home" })).not.toHaveClass("font-medium")
  })
})

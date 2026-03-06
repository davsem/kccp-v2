import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Footer } from "@/components/footer"

describe("Footer", () => {
  it("renders copyright with current year", () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(String(year)))).toBeInTheDocument()
  })

  it("renders Khalsa Hockey Club", () => {
    render(<Footer />)
    expect(screen.getByText(/Khalsa Hockey Club/)).toBeInTheDocument()
  })

  it("renders About, Contact, Privacy links", () => {
    render(<Footer />)
    expect(screen.getByText("About")).toBeInTheDocument()
    expect(screen.getByText("Contact")).toBeInTheDocument()
    expect(screen.getByText("Privacy")).toBeInTheDocument()
  })
})

import { describe, it, expect } from "vitest"
import {
  pitchSections,
  getSectionById,
  GRID_COLS,
  GRID_ROWS,
} from "@/lib/pitch-data"

describe("pitchSections", () => {
  it("has 1000 sections", () => {
    expect(pitchSections).toHaveLength(1000)
  })

  it("grid constants are 40×25", () => {
    expect(GRID_COLS).toBe(40)
    expect(GRID_ROWS).toBe(25)
  })

  it("all sections are priced at £50", () => {
    pitchSections.forEach((s) => expect(s.price).toBe(50))
  })

  it("all sections are available by default", () => {
    pitchSections.forEach((s) => expect(s.available).toBe(true))
  })

  it("labels follow R{row+1}C{col+1} pattern", () => {
    const first = pitchSections[0]
    expect(first.label).toBe("R1C1")
    const last = pitchSections[pitchSections.length - 1]
    expect(last.label).toBe("R25C40")
  })
})

describe("getSectionById", () => {
  it("returns section for valid id", () => {
    const section = getSectionById("0-0")
    expect(section).toBeDefined()
    expect(section?.label).toBe("R1C1")
  })

  it("returns undefined for unknown id", () => {
    expect(getSectionById("99-99")).toBeUndefined()
  })
})

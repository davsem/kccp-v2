import { describe, it, expect } from "vitest"
import {
  pitchSections,
  getSectionById,
  GRID_COLS,
  GRID_ROWS,
} from "@/lib/pitch-data"

describe("pitchSections", () => {
  it("has 200 sections", () => {
    expect(pitchSections).toHaveLength(200)
  })

  it("grid constants are 20×10", () => {
    expect(GRID_COLS).toBe(20)
    expect(GRID_ROWS).toBe(10)
  })

  it("centre sections (rows 3-6, cols 7-13) are priced at £100", () => {
    const centre = pitchSections.filter(
      (s) => s.row >= 3 && s.row <= 6 && s.col >= 7 && s.col <= 13
    )
    expect(centre.length).toBeGreaterThan(0)
    centre.forEach((s) => expect(s.price).toBe(100))
  })

  it("edge sections are priced at £50", () => {
    const edge = pitchSections.filter(
      (s) => !(s.row >= 3 && s.row <= 6 && s.col >= 7 && s.col <= 13)
    )
    edge.forEach((s) => expect(s.price).toBe(50))
  })

  it("all sections are available by default", () => {
    pitchSections.forEach((s) => expect(s.available).toBe(true))
  })

  it("labels follow R{row+1}C{col+1} pattern", () => {
    const first = pitchSections[0]
    expect(first.label).toBe("R1C1")
    const last = pitchSections[pitchSections.length - 1]
    expect(last.label).toBe("R10C20")
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

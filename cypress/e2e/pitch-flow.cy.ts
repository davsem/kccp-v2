describe("Pitch flow", () => {
  beforeEach(() => {
    cy.visit("/pitch")
  })

  it("loads the pitch page with 200 cells", () => {
    cy.get("button").should("have.length.gte", 200)
  })

  it("clicking a cell selects it (amber) and updates count", () => {
    // Click R1C1
    cy.contains("button", "R1C1").click()
    cy.contains("button", "R1C1").should("have.class", "bg-amber-400")
    cy.contains("1 section selected").should("exist")
  })

  it("clicking a selected cell deselects it", () => {
    cy.contains("button", "R1C1").click()
    cy.contains("button", "R1C1").click()
    cy.contains("button", "R1C1").should("have.class", "bg-green-500")
    cy.contains("0 sections selected").should("exist")
  })

  it("total updates on selection", () => {
    cy.contains("button", "R1C1").click() // £50
    cy.contains("£50").should("exist")
  })
})

describe("Pitch flow", () => {
  beforeEach(() => {
    cy.visit("/pitch")
  })

  it("loads the pitch page with 200 cells", () => {
    cy.get("button").should("have.length.gte", 200)
  })

  it("clicking a cell selects it (amber) and updates count", () => {
    cy.get('[data-section-id="0-0"]').click()
    cy.get('[data-section-id="0-0"]').should("have.class", "bg-amber-400/60")
    cy.contains("1 section selected").should("exist")
  })

  it("clicking a selected cell deselects it", () => {
    cy.get('[data-section-id="0-0"]').click()
    cy.get('[data-section-id="0-0"]').click()
    cy.get('[data-section-id="0-0"]').should("have.class", "bg-green-500/40")
    cy.contains("0 sections selected").should("exist")
  })

  it("total updates on selection", () => {
    cy.get('[data-section-id="0-0"]').click() // £50
    cy.contains("£50").should("exist")
  })
})

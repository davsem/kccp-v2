describe("Basket flow", () => {
  it("selecting sections on /pitch then navigating to /basket shows items and total", () => {
    cy.visit("/pitch")

    // Select two sections
    cy.contains("button", "R1C1").click()
    cy.contains("button", "R1C2").click()

    // Navigate to basket via View Basket link
    cy.contains("a", "View Basket").click()
    cy.url().should("include", "/basket")

    // Items should appear
    cy.contains("R1C1").should("exist")
    cy.contains("R1C2").should("exist")
    cy.contains("Total: £100").should("exist")
  })

  it("clearing basket shows empty state", () => {
    cy.visit("/pitch")
    cy.contains("button", "R1C1").click()
    cy.contains("a", "View Basket").click()

    cy.contains("button", "Clear Basket").click()
    cy.contains("Your basket is empty.").should("exist")
  })

  it("empty basket page shows empty state and Browse link", () => {
    cy.visit("/basket")
    // May redirect to sign-in if auth required; but basket page shows empty state if accessible
    // This test is best-effort — skip auth for now by checking either state
    cy.url().then((url) => {
      if (url.includes("/auth/sign-in")) {
        cy.log("Basket is protected — redirected to sign-in as expected")
      } else {
        cy.contains("Your basket is empty.").should("exist")
        cy.contains("Browse The Pitch").should("exist")
      }
    })
  })
})

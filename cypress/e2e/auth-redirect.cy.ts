describe("Auth redirect", () => {
  it("visiting /profile unauthenticated redirects to /auth/sign-in with redirectTo param", () => {
    cy.visit("/profile")
    cy.url().should("include", "/auth/sign-in")
    cy.url().should("include", "redirectTo=%2Fprofile")
  })

  it("sign-in page renders email and password fields", () => {
    cy.visit("/auth/sign-in")
    cy.get("input[type='email']").should("exist")
    cy.get("input[type='password']").should("exist")
    cy.contains("button", "Sign in").should("exist")
  })

  it("sign-in page has Google OAuth button", () => {
    cy.visit("/auth/sign-in")
    cy.contains("Continue with Google").should("exist")
  })
})

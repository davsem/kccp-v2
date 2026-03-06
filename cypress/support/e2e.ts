export {}

// Custom commands
Cypress.Commands.add(
  "getBySel",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (selector: string, ...args: any[]) => cy.get(`[data-testid="${selector}"]`, ...args)
)

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      getBySel(selector: string): Chainable
    }
  }
}

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
// ***********************************************

/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to log in a user
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to mock authentication
       * @example cy.mockAuth()
       */
      mockAuth(): Chainable<void>
      
      /**
       * Custom command to wait for page load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>
      
      /**
       * Custom command to check accessibility
       * @example cy.checkAccessibility()
       */
      checkAccessibility(): Chainable<void>
      
      /**
       * Custom command to fill contact form
       * @example cy.fillContactForm({ name: 'John', email: 'john@example.com', message: 'Hello' })
       */
      fillContactForm(data: { name: string; email: string; message: string; company?: string }): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth/signin')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('not.include', '/auth/signin')
  })
})

Cypress.Commands.add('mockAuth', () => {
  cy.window().then((win) => {
    win.localStorage.setItem('next-auth.session-token', 'mock-session-token')
  })
  
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg'
      },
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
    }
  })
})

Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body', { timeout: 30000 }).should('be.visible')
  cy.get('[data-testid="loading"]').should('not.exist')
})

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe()
  cy.checkA11y(null, {
    includedImpacts: ['critical', 'serious'],
    rules: {
      'color-contrast': { enabled: false }, // Disable color contrast for now
    }
  })
})

Cypress.Commands.add('fillContactForm', (data) => {
  cy.get('input[name="name"]').clear().type(data.name)
  cy.get('input[name="email"]').clear().type(data.email)
  if (data.company) {
    cy.get('input[name="company"]').clear().type(data.company)
  }
  cy.get('textarea[name="message"]').clear().type(data.message)
})
// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

import './commands'
import 'cypress-axe'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in command log
const app = window.top;

if (!app?.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app?.document.createElement('style');
  if (style) {
    style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
    style.setAttribute('data-hide-command-log-request', '');
    app?.document.head.appendChild(style);
  }
}

// Global before hook to set up test environment
beforeEach(() => {
  // Inject accessibility testing
  cy.injectAxe()
  
  // Set viewport to standard desktop size
  cy.viewport(1280, 720)
  
  // Intercept and mock external API calls
  cy.intercept('GET', '/api/health', { fixture: 'health.json' })
  cy.intercept('POST', '/api/ai/chat', { fixture: 'ai-chat-response.json' })
  cy.intercept('POST', '/api/analytics', { success: true })
})

// Global after hook for cleanup
afterEach(() => {
  // Check for accessibility violations after each test
  cy.checkA11y(null, {
    includedImpacts: ['critical', 'serious']
  })
})
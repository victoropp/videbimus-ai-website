describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  it('should navigate to all main pages successfully', () => {
    const pages = [
      { name: 'About', path: '/about', title: 'About' },
      { name: 'Services', path: '/services', title: 'Services' },
      { name: 'AI Playground', path: '/ai', title: 'AI Playground' },
      { name: 'Collaboration', path: '/collaboration', title: 'Collaboration' },
      { name: 'Case Studies', path: '/case-studies', title: 'Case Studies' },
      { name: 'Blog', path: '/blog', title: 'Blog' },
      { name: 'Contact', path: '/contact', title: 'Contact' },
    ]

    pages.forEach(page => {
      // Navigate to page
      cy.get(`a[href="${page.path}"]`).first().click()
      
      // Verify URL
      cy.url().should('include', page.path)
      
      // Verify page loaded
      cy.contains(page.title, { timeout: 10000 }).should('be.visible')
      
      // Go back to home
      cy.get('a[href="/"]').first().click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })

  it('should handle logo click to return home', () => {
    // Navigate away from home
    cy.get('a[href="/about"]').first().click()
    cy.url().should('include', '/about')
    
    // Click logo to return home
    cy.get('a[href="/"]').first().click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should show active navigation state', () => {
    // Navigate to a page
    cy.get('a[href="/services"]').first().click()
    cy.url().should('include', '/services')
    
    // Check active state styling (depends on implementation)
    cy.get('a[href="/services"]').first().should('have.class', 'active')
      .or('have.attr', 'aria-current')
  })

  it('should work with keyboard navigation', () => {
    // Focus first navigation link
    cy.get('nav a').first().focus()
    
    // Navigate using Tab key
    cy.focused().tab()
    cy.focused().should('match', 'a')
    
    // Navigate using Enter key
    cy.focused().type('{enter}')
    cy.url().should('not.eq', Cypress.config().baseUrl + '/')
  })

  it('should handle mobile navigation menu', () => {
    // Set mobile viewport
    cy.viewport(375, 667)
    
    // Mobile menu button should be visible
    cy.get('[aria-label="Toggle navigation"]')
      .or('[data-testid="mobile-menu-button"]')
      .should('be.visible')
      .click()
    
    // Mobile menu should open
    cy.get('[role="dialog"]')
      .or('[data-testid="mobile-menu"]')
      .should('be.visible')
    
    // Should be able to navigate from mobile menu
    cy.get('[role="dialog"] a[href="/about"]')
      .or('[data-testid="mobile-menu"] a[href="/about"]')
      .click()
    
    cy.url().should('include', '/about')
  })

  it('should close mobile menu when clicking outside', () => {
    cy.viewport(375, 667)
    
    // Open mobile menu
    cy.get('[aria-label="Toggle navigation"]').click()
    
    // Click outside menu
    cy.get('body').click(0, 0)
    
    // Menu should close
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should handle breadcrumb navigation', () => {
    // Navigate to a nested page if exists
    cy.visit('/services')
    
    // Check if breadcrumbs exist
    cy.get('[aria-label="Breadcrumb"]')
      .or('[data-testid="breadcrumb"]')
      .then(breadcrumb => {
        if (breadcrumb.length > 0) {
          // Test breadcrumb navigation
          cy.wrap(breadcrumb).within(() => {
            cy.get('a[href="/"]').click()
            cy.url().should('eq', Cypress.config().baseUrl + '/')
          })
        }
      })
  })

  it('should maintain scroll position when navigating back', () => {
    // Scroll down on homepage
    cy.scrollTo(0, 500)
    
    // Navigate away
    cy.get('a[href="/about"]').first().click()
    cy.url().should('include', '/about')
    
    // Navigate back
    cy.go('back')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Check scroll position is maintained (browser behavior)
    cy.window().its('scrollY').should('be.greaterThan', 400)
  })

  it('should handle external links correctly', () => {
    // Check external links open in new tab/window
    cy.get('a[href^="http"]').then(links => {
      if (links.length > 0) {
        cy.wrap(links.first())
          .should('have.attr', 'target', '_blank')
          .and('have.attr', 'rel', 'noopener noreferrer')
      }
    })
  })

  it('should display 404 page for invalid routes', () => {
    cy.visit('/non-existent-page', { failOnStatusCode: false })
    
    // Should show 404 page or redirect
    cy.get('body').should('contain.text', '404')
      .or('contain.text', 'Page not found')
      .or('contain.text', 'Not Found')
  })
})

describe('Search Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should show search when search feature exists', () => {
    // Check if search functionality exists
    cy.get('[data-testid="search"]')
      .or('input[type="search"]')
      .or('button[aria-label*="search"]')
      .then(search => {
        if (search.length > 0) {
          // Test search functionality
          cy.wrap(search).click()
          
          // Type search query
          cy.get('input[type="search"]')
            .or('[data-testid="search-input"]')
            .type('AI services{enter}')
          
          // Check search results
          cy.get('[data-testid="search-results"]')
            .or('main')
            .should('contain.text', 'AI')
        }
      })
  })
})

describe('Theme and Accessibility', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should toggle theme when theme switcher exists', () => {
    // Check for theme toggle
    cy.get('[aria-label*="theme"]')
      .or('[data-testid="theme-toggle"]')
      .then(themeToggle => {
        if (themeToggle.length > 0) {
          // Get initial theme state
          cy.get('html').then($html => {
            const initialTheme = $html.attr('class') || ''
            
            // Click theme toggle
            cy.wrap(themeToggle).click()
            
            // Verify theme changed
            cy.get('html').should($newHtml => {
              const newTheme = $newHtml.attr('class') || ''
              expect(newTheme).to.not.equal(initialTheme)
            })
          })
        }
      })
  })

  it('should be accessible with screen readers', () => {
    // Check basic accessibility
    cy.checkAccessibility()
    
    // Check navigation has proper ARIA labels
    cy.get('nav').should('have.attr', 'role', 'navigation')
    
    // Check main content area
    cy.get('main').should('exist')
    
    // Check heading hierarchy
    cy.get('h1').should('have.length.at.most', 1)
    cy.get('h1, h2, h3, h4, h5, h6').each($heading => {
      cy.wrap($heading).should('not.be.empty')
    })
  })

  it('should handle focus management correctly', () => {
    // Skip to content link should exist
    cy.get('a[href="#main"]')
      .or('a[href="#content"]')
      .or('.sr-only a')
      .first()
      .should('exist')
  })
})

describe('Performance and Loading', () => {
  it('should load page within acceptable time', () => {
    const start = Date.now()
    
    cy.visit('/')
    cy.get('h1').should('be.visible')
    
    const loadTime = Date.now() - start
    expect(loadTime).to.be.lessThan(5000)
  })

  it('should load critical resources successfully', () => {
    cy.visit('/')
    
    // Check for critical CSS
    cy.document().then(doc => {
      const stylesheets = doc.querySelectorAll('link[rel="stylesheet"]')
      expect(stylesheets.length).to.be.greaterThan(0)
    })
    
    // Check images load without errors
    cy.get('img').each($img => {
      cy.wrap($img).should('have.prop', 'naturalWidth').and('be.greaterThan', 0)
    })
  })
})
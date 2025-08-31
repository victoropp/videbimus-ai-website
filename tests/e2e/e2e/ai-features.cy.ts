describe('AI Features', () => {
  beforeEach(() => {
    cy.visit('/ai')
    cy.waitForPageLoad()
  })

  describe('AI Playground Page', () => {
    it('should load AI playground with demo sections', () => {
      cy.contains('AI Playground').should('be.visible')
      
      // Check for demo sections
      cy.get('[data-testid="sentiment-demo"]')
        .or('h2, h3').contains('Sentiment')
        .should('be.visible')
      
      cy.get('[data-testid="summarization-demo"]')
        .or('h2, h3').contains('Summarization')
        .should('be.visible')
    })

    it('should handle sentiment analysis demo', () => {
      // Find sentiment analysis section
      cy.get('[data-testid="sentiment-demo"]')
        .or('section').contains('Sentiment Analysis')
        .within(() => {
          // Input some text
          cy.get('textarea')
            .or('input[type="text"]')
            .clear()
            .type('I love this product! It works amazingly well and exceeds all my expectations.')
          
          // Click analyze button
          cy.get('button').contains(/analyze|submit|test/i).click()
          
          // Check loading state
          cy.get('button').should('contain.text', /analyzing|loading/i)
          
          // Check results appear
          cy.get('[data-testid="sentiment-result"]')
            .or('.result, .output')
            .should('be.visible', { timeout: 10000 })
          
          // Should show positive sentiment
          cy.get('body').should('contain.text', /positive|😊|👍/i)
        })
    })

    it('should handle text summarization demo', () => {
      const longText = `
        Artificial intelligence (AI) is intelligence demonstrated by machines, 
        in contrast to the natural intelligence displayed by humans and animals. 
        Leading AI textbooks define the field as the study of "intelligent agents": 
        any device that perceives its environment and takes actions that maximize 
        its chance of successfully achieving its goals. Colloquially, the term 
        "artificial intelligence" is often used to describe machines that mimic 
        "cognitive" functions that humans associate with the human mind, such as 
        "learning" and "problem solving".
      `
      
      cy.get('[data-testid="summarization-demo"]')
        .or('section').contains('Summarization')
        .within(() => {
          // Input long text
          cy.get('textarea').clear().type(longText)
          
          // Click summarize button
          cy.get('button').contains(/summarize|submit|generate/i).click()
          
          // Check loading state
          cy.get('button').should('contain.text', /summarizing|loading/i)
          
          // Check summary appears
          cy.get('[data-testid="summary-result"]')
            .or('.result, .output')
            .should('be.visible', { timeout: 15000 })
          
          // Summary should be shorter than original
          cy.get('[data-testid="summary-result"] p')
            .or('.result p, .output p')
            .invoke('text')
            .should('have.length.lessThan', longText.length)
        })
    })

    it('should show error handling for invalid input', () => {
      // Test with empty input
      cy.get('[data-testid="sentiment-demo"]')
        .or('section').contains('Sentiment')
        .within(() => {
          cy.get('textarea').clear()
          cy.get('button').contains(/analyze|submit/i).click()
          
          // Should show validation error
          cy.get('.error, [data-testid="error"]')
            .or('p').contains(/required|empty|invalid/i)
            .should('be.visible')
        })
    })

    it('should handle API errors gracefully', () => {
      // Intercept API calls to return error
      cy.intercept('POST', '/api/ai/demos/sentiment', {
        statusCode: 500,
        body: { error: 'Service temporarily unavailable' }
      }).as('sentimentError')
      
      cy.get('[data-testid="sentiment-demo"]')
        .or('section').contains('Sentiment')
        .within(() => {
          cy.get('textarea').type('Test input')
          cy.get('button').contains(/analyze|submit/i).click()
          
          // Wait for API call
          cy.wait('@sentimentError')
          
          // Should show error message
          cy.get('.error, [data-testid="error"]')
            .should('be.visible')
            .and('contain.text', /error|failed|unavailable/i)
        })
    })
  })

  describe('Chat Interface', () => {
    beforeEach(() => {
      cy.visit('/ai')
    })

    it('should load chat interface', () => {
      cy.get('[data-testid="chat-interface"]')
        .or('section').contains('Chat')
        .should('be.visible')
      
      cy.get('input[type="text"]')
        .or('textarea')
        .should('be.visible')
      
      cy.get('button').contains(/send|submit/i)
        .should('be.visible')
    })

    it('should send and receive chat messages', () => {
      cy.get('[data-testid="chat-interface"]')
        .or('section').contains('Chat')
        .within(() => {
          // Type message
          cy.get('input[type="text"]')
            .or('textarea')
            .type('Hello, can you help me with AI services?')
          
          // Send message
          cy.get('button').contains(/send|submit/i).click()
          
          // Check user message appears
          cy.get('[data-testid="chat-messages"]')
            .or('.messages, .chat-history')
            .should('contain.text', 'Hello, can you help me')
          
          // Check AI response appears
          cy.get('[data-testid="ai-response"]')
            .or('.bot-message, .ai-message')
            .should('be.visible', { timeout: 10000 })
        })
    })

    it('should handle chat input validation', () => {
      cy.get('[data-testid="chat-interface"]')
        .within(() => {
          // Try to send empty message
          cy.get('button').contains(/send|submit/i).click()
          
          // Should not send empty message or show validation
          cy.get('input[type="text"]')
            .or('textarea')
            .should('have.class', /error|invalid/)
            .or('have.attr', 'aria-invalid', 'true')
        })
    })

    it('should show typing indicator during AI response', () => {
      cy.get('[data-testid="chat-interface"]')
        .within(() => {
          cy.get('input[type="text"]').type('Test message')
          cy.get('button').contains(/send|submit/i).click()
          
          // Should show typing indicator
          cy.get('[data-testid="typing-indicator"]')
            .or('.typing, .loading-dots')
            .should('be.visible')
        })
    })
  })

  describe('AI Models Showcase', () => {
    it('should display available AI models', () => {
      // Visit models page or section
      cy.visit('/ai')
      
      cy.get('[data-testid="models-section"]')
        .or('section').contains('Models')
        .within(() => {
          // Should show different AI models
          cy.contains(/GPT|Claude|Llama|OpenAI|Anthropic/i).should('be.visible')
          
          // Should show model capabilities
          cy.contains(/text generation|analysis|conversation/i).should('be.visible')
        })
    })

    it('should allow model switching', () => {
      cy.get('[data-testid="model-selector"]')
        .or('select').contains('Model')
        .then(modelSelector => {
          if (modelSelector.length > 0) {
            cy.wrap(modelSelector).select('claude')
            
            // Verify model switched
            cy.get('[data-testid="current-model"]')
              .should('contain.text', 'Claude')
          }
        })
    })
  })

  describe('Performance and UX', () => {
    it('should show loading states during AI processing', () => {
      cy.get('[data-testid="sentiment-demo"]')
        .within(() => {
          cy.get('textarea').type('Test input')
          cy.get('button').contains(/analyze/i).click()
          
          // Should show loading state
          cy.get('button').should('be.disabled')
          cy.get('.spinner, .loading')
            .or('svg[class*="animate-spin"]')
            .should('be.visible')
        })
    })

    it('should handle concurrent requests appropriately', () => {
      // Start first request
      cy.get('[data-testid="sentiment-demo"] textarea').type('First request')
      cy.get('[data-testid="sentiment-demo"] button').click()
      
      // Start second request quickly
      cy.get('[data-testid="summarization-demo"] textarea').type('Second request text')
      cy.get('[data-testid="summarization-demo"] button').click()
      
      // Both should handle appropriately (queue or process concurrently)
      cy.get('[data-testid="sentiment-result"]', { timeout: 15000 }).should('be.visible')
      cy.get('[data-testid="summary-result"]', { timeout: 15000 }).should('be.visible')
    })

    it('should provide clear feedback for long-running operations', () => {
      // Use a longer text that might take more time to process
      const veryLongText = 'a'.repeat(2000) + ' This is a very long text that should take some time to process.'
      
      cy.get('[data-testid="summarization-demo"]')
        .within(() => {
          cy.get('textarea').type(veryLongText)
          cy.get('button').click()
          
          // Should show progress or estimated time
          cy.get('.progress, .eta')
            .or('[data-testid="processing-info"]')
            .should('be.visible')
        })
    })
  })
})
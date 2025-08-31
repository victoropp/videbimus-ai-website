# Configuration Files

## Directory Structure

```
config/
├── tokens/           # API tokens and credentials documentation
├── vitest.config.ts  # Vitest testing configuration
├── vitest.api.config.ts  # API-specific test config
├── playwright.config.ts  # E2E test configuration
└── cypress.config.ts # Cypress test configuration
```

## Test Configurations

### Vitest Configuration
Main test runner for unit and integration tests.

### Playwright Configuration
E2E testing across multiple browsers.

### Cypress Configuration
Alternative E2E testing framework.

## Environment Variables

See `.env.example` and `.env.production.template` for required environment variables.

## Security Note

Never commit actual tokens or credentials to this directory. Use environment variables for sensitive data.
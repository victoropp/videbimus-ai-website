# Test Suite Documentation

## Test Structure

```
tests/
├── unit/           # Unit tests for individual components
├── integration/    # Integration tests for API and services
└── e2e/           # End-to-end tests with Cypress
```

## Running Tests

### All Tests
```bash
npm run test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

### With Coverage
```bash
npm run test:coverage
```

## Test Files

### Integration Tests
- `test-ai-providers.ts` - AI provider integration tests
- `test-all-hf-models.js` - Hugging Face model tests
- `test-chatbot.ts` - Chatbot functionality tests
- `test-chatbot-comprehensive.ts` - Comprehensive chatbot tests
- `test-chatbot-robust.ts` - Robustness testing

### E2E Tests
- Cypress test specifications
- Page object models
- Test fixtures and data

## Writing Tests

### Unit Test Example
```typescript
describe('Component', () => {
  it('should render correctly', () => {
    // Test implementation
  })
})
```

### Integration Test Example
```typescript
describe('API Endpoint', () => {
  it('should return expected data', async () => {
    // Test implementation
  })
})
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Push to main branch
- Pre-deployment checks

## Coverage Requirements

- Minimum 80% code coverage
- 100% coverage for critical paths
- All new features must include tests
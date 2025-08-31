# Testing Documentation

## Overview

This document provides comprehensive testing guidelines for the Vidibemus AI website. Our testing strategy ensures high-quality, reliable, and maintainable code through multiple layers of testing.

## Testing Stack

### Core Testing Tools
- **Vitest**: Modern unit testing framework with TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: Cross-browser end-to-end testing
- **Cypress**: Integration and component testing
- **MSW**: API mocking for realistic testing scenarios

### Quality Assurance Tools
- **ESLint**: Code linting and style enforcement
- **TypeScript**: Static type checking
- **Husky**: Git hooks for automated quality checks
- **Lighthouse CI**: Performance and accessibility auditing
- **Axe**: Accessibility testing

## Testing Layers

### 1. Unit Tests (Vitest + React Testing Library)
**Purpose**: Test individual components and functions in isolation

**Location**: `src/**/*.test.{ts,tsx}`

**Coverage**: 80%+ code coverage required

**Examples**:
- Component rendering and behavior
- User interactions (clicks, form submissions)
- Props validation and state management
- Utility functions and hooks

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

### 2. API Tests (Vitest)
**Purpose**: Test API endpoints and business logic

**Location**: `src/app/api/**/*.test.ts`

**Coverage**: All API endpoints tested

**Examples**:
- Request/response validation
- Authentication and authorization
- Error handling
- Database interactions

```bash
# Run API tests
npm run test:api
```

### 3. Integration Tests (Cypress)
**Purpose**: Test user journeys and feature interactions

**Location**: `cypress/e2e/**/*.cy.ts`

**Coverage**: Critical user flows

**Examples**:
- Navigation between pages
- Form submissions end-to-end
- AI feature workflows
- Collaboration features

```bash
# Run integration tests (headless)
npm run test:cypress

# Run with interactive UI
npm run test:cypress:open
```

### 4. End-to-End Tests (Playwright)
**Purpose**: Test complete user scenarios across browsers

**Location**: `playwright/tests/**/*.spec.ts`

**Coverage**: Cross-browser compatibility

**Examples**:
- Multi-browser testing
- Performance testing
- Accessibility compliance
- Mobile responsiveness

```bash
# Run E2E tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed
```

## Test Data Management

### Fixtures
Test data is centralized in `src/test/fixtures/index.ts`:
- Mock users, projects, contacts
- AI service responses
- Sample content for testing

### Database Testing
Use `src/test/database.ts` for database operations:
- Setup and teardown
- Test data seeding
- Transaction management

### API Mocking
MSW handlers in `src/test/mocks/` provide:
- Consistent API responses
- Error scenario testing
- Offline development support

## Quality Gates

### Code Coverage Requirements
- **Unit Tests**: Minimum 80% coverage
- **Critical Paths**: 95% coverage required
- **New Features**: 90% coverage for new code

### Performance Standards
- **Page Load**: < 3 seconds for first contentful paint
- **Largest Contentful Paint**: < 4 seconds
- **Cumulative Layout Shift**: < 0.1
- **Total Blocking Time**: < 500ms

### Accessibility Standards
- **WCAG 2.1 AA**: All pages must comply
- **Color Contrast**: 4.5:1 minimum ratio
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader**: Semantic markup required

## Writing Tests

### Unit Test Best Practices

```typescript
// Good: Test user behavior, not implementation details
it('submits form when valid data is entered', async () => {
  render(<ContactForm />)
  
  await user.type(screen.getByLabelText(/name/i), 'John Doe')
  await user.type(screen.getByLabelText(/email/i), 'john@example.com')
  await user.type(screen.getByLabelText(/message/i), 'Test message')
  
  await user.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(screen.getByText(/message sent/i)).toBeInTheDocument()
})

// Bad: Testing implementation details
it('calls setState when input changes', () => {
  const setStateSpy = jest.spyOn(React, 'useState')
  // Don't test React internals
})
```

### API Test Best Practices

```typescript
it('returns 400 for invalid input', async () => {
  const request = createMockRequest({ text: '' })
  const response = await POST(request)
  const data = await response.json()
  
  expect(response.status).toBe(400)
  expect(data.error).toBe('Invalid request data')
})
```

### E2E Test Best Practices

```typescript
test('user can complete contact form', async ({ page }) => {
  await page.goto('/contact')
  
  // Use data-testid for stable selectors
  await page.getByTestId('contact-form').fill('John Doe')
  
  // Test the outcome, not the process
  await page.getByRole('button', { name: /submit/i }).click()
  await expect(page.getByText(/thank you/i)).toBeVisible()
})
```

## CI/CD Integration

### GitHub Actions Workflow
Our test suite runs automatically on:
- Push to main/develop branches
- Pull requests
- Release builds

### Test Stages
1. **Lint & Type Check**: Code quality validation
2. **Unit Tests**: Component and function testing
3. **API Tests**: Backend functionality testing
4. **E2E Tests**: Cross-browser scenarios
5. **Integration Tests**: User journey validation
6. **Accessibility Tests**: WCAG compliance
7. **Security Scan**: Vulnerability detection
8. **Performance Tests**: Lighthouse auditing

### Quality Gates
- All tests must pass before merge
- Coverage thresholds must be met
- No high-severity security issues
- Performance budgets must be maintained

## Local Development

### Running Tests

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run all tests
npm run test:all

# Run specific test types
npm run test              # Unit tests
npm run test:api         # API tests
npm run test:e2e         # Playwright E2E
npm run test:cypress     # Cypress integration
```

### Debug Mode

```bash
# Debug unit tests
npm run test -- --inspect-brk

# Debug E2E tests
npm run test:e2e -- --debug

# Open Cypress Test Runner
npm run test:cypress:open
```

### Test Development Workflow

1. **Write failing test first** (TDD approach)
2. **Implement minimum code** to pass test
3. **Refactor** while keeping tests green
4. **Verify coverage** meets requirements
5. **Run full test suite** before commit

## Mock Services

### AI Service Mocking
- OpenAI API responses
- Anthropic Claude responses  
- Hugging Face model outputs
- Vector database operations

### External Service Mocking
- Authentication providers
- Email services
- File upload services
- Real-time collaboration

## Troubleshooting

### Common Issues

#### Tests Timing Out
```bash
# Increase timeout in vitest.config.ts
test: {
  testTimeout: 20000
}
```

#### Port Conflicts
```bash
# Change test server port
webServer: {
  command: 'npm start',
  port: 3001
}
```

#### Database Locks
```bash
# Clean up test database
npm run db:reset
```

### Performance Issues
- Use MSW for API mocking to avoid network calls
- Implement proper cleanup in test hooks
- Use test database for isolation
- Mock heavy external dependencies

## Best Practices Summary

### Do's ✅
- Test user behavior, not implementation
- Use semantic queries (getByRole, getByLabelText)
- Mock external dependencies appropriately
- Maintain test data fixtures
- Write descriptive test names
- Keep tests independent and isolated
- Use data-testid sparingly for complex selectors

### Don'ts ❌
- Don't test implementation details
- Don't use brittle CSS selectors
- Don't share state between tests
- Don't skip accessibility testing
- Don't ignore flaky tests
- Don't commit failing tests
- Don't test third-party libraries

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure adequate coverage
3. Update relevant documentation
4. Verify CI pipeline passes
5. Request code review

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Cypress Documentation](https://docs.cypress.io/)
- [MSW Documentation](https://mswjs.io/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## Contact

For testing questions or issues:
- Create GitHub issue with `testing` label
- Consult team testing guidelines
- Review existing test patterns in codebase
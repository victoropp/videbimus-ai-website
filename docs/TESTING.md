# Testing Guide

## Overview

This document outlines the testing strategy and best practices for the VidebimusAI website.

## Test Structure

```
├── src/
│   ├── lib/__tests__/           # Unit tests for utilities
│   ├── app/api/__tests__/       # API route tests
│   └── components/__tests__/    # Component tests
├── tests/
│   ├── integration/            # Integration tests
│   └── e2e/                    # End-to-end tests
```

## Running Tests

### All Tests
```bash
npm test                    # Run tests in watch mode
npm run test:run           # Run all tests once
npm run test:coverage      # Run tests with coverage report
```

### Specific Test Suites
```bash
npm run test:unit          # Run unit tests only
npm run test:api           # Run API tests only
npm run test:integration   # Run integration tests
npm run test:e2e           # Run E2E tests with Playwright
npm run test:e2e:ui        # Run E2E tests with UI
```

### Accessibility Tests
```bash
npm run test:a11y          # Run accessibility tests
```

### Performance Tests
```bash
npm run test:lighthouse    # Run Lighthouse CI
npm run test:performance   # Run performance tests
```

## Writing Tests

### Unit Tests

Unit tests should be placed in `__tests__` directories next to the code they test.

**Example: Testing a utility function**

```typescript
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils'

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$10.00')
    expect(formatCurrency(50)).toBe('$0.50')
  })
})
```

### Component Tests

Component tests use React Testing Library for rendering and interaction testing.

**Example: Testing a Button component**

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)

    const button = screen.getByText('Click Me')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### API Tests

API tests validate request/response handling and business logic.

**Example: Testing blog API**

```typescript
describe('POST /api/blog/posts', () => {
  it('should create a new blog post', async () => {
    const newPost = {
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content'
    }

    // Test validation and creation logic
    expect(newPost.title).toBeTruthy()
    expect(newPost.slug).toMatch(/^[a-z0-9-]+$/)
  })
})
```

### Integration Tests

Integration tests verify complete workflows across multiple components and services.

**Example: Testing authentication flow**

```typescript
describe('Authentication Integration', () => {
  it('should complete full login workflow', async () => {
    // Test user registration
    // Test user login
    // Test session creation
    // Test authenticated requests
  })
})
```

### E2E Tests

E2E tests use Playwright to test complete user journeys in a real browser.

**Example: Testing contact form submission**

```typescript
test('should submit contact form', async ({ page }) => {
  await page.goto('/contact')

  await page.fill('input[name="name"]', 'Test User')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('textarea[name="message"]', 'Test message')

  await page.click('button[type="submit"]')

  await expect(page.locator('text=/success/i')).toBeVisible()
})
```

## Test Coverage

### Coverage Goals
- **Overall**: 80%+ code coverage
- **Critical paths**: 95%+ coverage
- **Utilities**: 90%+ coverage
- **Components**: 80%+ coverage

### Generate Coverage Report
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Best Practices

### 1. Test Behavior, Not Implementation
Focus on testing what the code does, not how it does it.

```typescript
// Good
expect(screen.getByText('Welcome')).toBeInTheDocument()

// Avoid
expect(component.state.showWelcome).toBe(true)
```

### 2. Use Descriptive Test Names
Test names should clearly describe what is being tested.

```typescript
// Good
it('should display error message when email is invalid', () => {})

// Avoid
it('test email validation', () => {})
```

### 3. Follow AAA Pattern
- **Arrange**: Set up test data and conditions
- **Act**: Execute the code being tested
- **Assert**: Verify the results

```typescript
it('should calculate total price', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }]

  // Act
  const total = calculateTotal(items)

  // Assert
  expect(total).toBe(30)
})
```

### 4. Test Edge Cases
Don't just test the happy path.

```typescript
describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })

  it('should reject invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('test@')).toBe(false)
  })
})
```

### 5. Keep Tests Independent
Each test should be able to run independently and in any order.

```typescript
// Good - each test sets up its own data
it('test 1', () => {
  const user = createUser()
  // test code
})

it('test 2', () => {
  const user = createUser()
  // test code
})
```

## Continuous Integration

Tests are automatically run on:
- **Pre-commit**: Unit tests and linting
- **Pre-push**: Full test suite
- **CI Pipeline**: All tests including E2E and performance tests

## Debugging Tests

### Run a Single Test
```bash
npm test -- path/to/test.ts
```

### Run Tests in Debug Mode
```bash
npm test -- --inspect-brk
```

### View Test Output
```bash
npm test -- --reporter=verbose
```

## Accessibility Testing

### Manual Testing
- Test with keyboard navigation
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test color contrast
- Test with zoom at 200%

### Automated Testing
```bash
npm run test:a11y
```

Uses jest-axe and Playwright's accessibility scanner.

## Performance Testing

### Web Vitals
Performance metrics are automatically tracked:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Lighthouse CI
```bash
npm run test:lighthouse
```

### Load Testing
```bash
npm run test:load
```

## Mobile Testing

### Responsive Testing
```bash
npm run test:mobile
```

### Cross-Browser Testing
```bash
npm run test:cross-browser
```

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout in vitest.config.ts
- Use `waitFor` for async operations

**Flaky tests**
- Add proper wait conditions
- Avoid testing implementation details
- Ensure proper cleanup in afterEach

**Coverage not accurate**
- Check that all test files are being run
- Verify coverage thresholds in vitest.config.ts

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)

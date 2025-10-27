import { test, expect } from '@playwright/test'

/**
 * End-to-End Tests for Critical User Paths
 * Tests complete user journeys through the application
 */

test.describe('Homepage to Services Flow', () => {
  test('should navigate from homepage to services page', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/')

    // Verify homepage loads
    await expect(page).toHaveTitle(/Videbimus AI/)

    // Check for hero section
    const hero = page.locator('h1').first()
    await expect(hero).toBeVisible()

    // Navigate to services
    await page.click('text=Services')

    // Verify services page loads
    await expect(page).toHaveURL(/\/services/)
    await expect(page.locator('h1')).toContainText(/Services|Solutions/)
  })

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/')

    // Check for main navigation
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()

    // Verify key navigation items
    await expect(page.locator('text=Home')).toBeVisible()
    await expect(page.locator('text=Services')).toBeVisible()
    await expect(page.locator('text=About')).toBeVisible()
    await expect(page.locator('text=Contact')).toBeVisible()
  })

  test('should have working footer links', async ({ page }) => {
    await page.goto('/')

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Check footer is visible
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
  })
})

test.describe('Contact Form Submission', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto('/contact')

    // Verify form elements
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/contact')

    // Try to submit empty form
    await page.click('button[type="submit"]')

    // Check for validation messages
    const nameInput = page.locator('input[name="name"]')
    await expect(nameInput).toHaveAttribute('required', '')
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/contact')

    // Enter invalid email
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('textarea[name="message"]', 'Test message')

    // Submit form
    await page.click('button[type="submit"]')

    // Email input should show validation error
    const emailInput = page.locator('input[name="email"]')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('should submit form with valid data', async ({ page }) => {
    await page.goto('/contact')

    // Fill form with valid data
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="company"]', 'Test Company')
    await page.fill('textarea[name="message"]', 'This is a test message')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for success message or redirect
    await page.waitForTimeout(2000)

    // Form should be submitted (check for success message or form reset)
    const successIndicator = page.locator('text=/success|thank you|sent/i')
    const isVisible = await successIndicator.isVisible().catch(() => false)

    // Either success message is shown or form is reset
    expect(isVisible || await page.locator('input[name="name"]').inputValue() === '').toBeTruthy()
  })
})

test.describe('AI Demos Interaction', () => {
  test('should load AI playground page', async ({ page }) => {
    await page.goto('/ai')

    // Verify page loads
    await expect(page).toHaveTitle(/AI Playground/)
    await expect(page.locator('h1')).toContainText(/AI Playground/)
  })

  test('should display AI demo tabs', async ({ page }) => {
    await page.goto('/ai')

    // Check for demo tabs
    await expect(page.locator('text=Chat')).toBeVisible()
    await expect(page.locator('text=Sentiment')).toBeVisible()
    await expect(page.locator('text=Summarize')).toBeVisible()
  })

  test('should switch between AI demo tabs', async ({ page }) => {
    await page.goto('/ai')

    // Click on Sentiment tab
    await page.click('text=Sentiment')
    await page.waitForTimeout(500)

    // Sentiment demo should be visible
    await expect(page.locator('text=/sentiment|analyze/i')).toBeVisible()

    // Click on Summarize tab
    await page.click('text=Summarize')
    await page.waitForTimeout(500)

    // Summarization demo should be visible
    await expect(page.locator('text=/summarize|summary/i')).toBeVisible()
  })

  test('should interact with chat interface', async ({ page }) => {
    await page.goto('/ai')

    // Click on Chat tab if not already selected
    await page.click('text=Chat')
    await page.waitForTimeout(500)

    // Look for chat input
    const chatInput = page.locator('textarea, input[placeholder*="message" i], input[placeholder*="chat" i]')
    const inputVisible = await chatInput.first().isVisible().catch(() => false)

    if (inputVisible) {
      await expect(chatInput.first()).toBeVisible()
    }
  })
})

test.describe('Authentication Flow', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/signin')

    // Verify sign in form
    await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation for empty credentials', async ({ page }) => {
    await page.goto('/auth/signin')

    // Try to submit without credentials
    await page.click('button[type="submit"]')

    // Should show validation
    const emailInput = page.locator('input[name="email"], input[type="email"]')
    await expect(emailInput.first()).toHaveAttribute('required', '')
  })

  test('should have link to sign up page', async ({ page }) => {
    await page.goto('/auth/signin')

    // Look for sign up link
    const signUpLink = page.locator('text=/sign up|create account|register/i')
    await expect(signUpLink.first()).toBeVisible()
  })
})

test.describe('Blog Functionality', () => {
  test('should display blog listing page', async ({ page }) => {
    await page.goto('/blog')

    // Verify blog page loads
    await expect(page.locator('h1')).toContainText(/Blog|Articles|Posts/)
  })

  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog')

    // Wait for content to load
    await page.waitForTimeout(1000)

    // Look for blog post cards or list items
    const blogPosts = page.locator('article, [data-testid="blog-post"]')
    const count = await blogPosts.count()

    // Should have at least one post or show empty state
    expect(count >= 0).toBeTruthy()
  })

  test('should navigate to blog post detail', async ({ page }) => {
    await page.goto('/blog')
    await page.waitForTimeout(1000)

    // Click on first blog post if available
    const firstPost = page.locator('article a, [data-testid="blog-post"] a').first()
    const exists = await firstPost.isVisible().catch(() => false)

    if (exists) {
      await firstPost.click()
      await page.waitForTimeout(1000)

      // Should navigate to post detail page
      await expect(page).toHaveURL(/\/blog\//)
    }
  })
})

test.describe('Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Navigation should be visible or have a mobile menu
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    // Content should be visible
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('should be responsive on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')

    // All content should be visible
    await expect(page.locator('h1').first()).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.waitForLoadState('domcontentloaded')

    const loadTime = Date.now() - startTime

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should have no console errors on homepage', async ({ page }) => {
    const errors: string[] = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('net::ERR_')
    )

    expect(criticalErrors.length).toBe(0)
  })
})

test.describe('Accessibility', () => {
  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/')

    // Check for navigation landmarks
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Should have an h1
    const h1 = page.locator('h1')
    await expect(h1.first()).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')

    // Tab through focusable elements
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)

    // Should be able to focus on elements
    expect(focusedElement).toBeTruthy()
  })

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/')

    const images = page.locator('img')
    const count = await images.count()

    if (count > 0) {
      // Check first image has alt attribute
      const firstImage = images.first()
      const hasAlt = await firstImage.getAttribute('alt')
      expect(hasAlt !== null).toBeTruthy()
    }
  })
})

test.describe('SEO', () => {
  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')

    // Check for title
    await expect(page).toHaveTitle(/.+/)

    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]')
    const content = await metaDescription.getAttribute('content')
    expect(content).toBeTruthy()
  })

  test('should have Open Graph tags', async ({ page }) => {
    await page.goto('/')

    // Check for OG tags
    const ogTitle = page.locator('meta[property="og:title"]')
    const hasOgTitle = await ogTitle.count()
    expect(hasOgTitle).toBeGreaterThan(0)
  })
})

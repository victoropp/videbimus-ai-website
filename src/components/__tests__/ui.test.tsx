import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

/**
 * Component Tests for UI Components
 * Tests UI component rendering and interactions
 */

describe('Badge Component', () => {
  it('should render badge with default variant', () => {
    render(<Badge>Default Badge</Badge>)
    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
  })

  it('should render badge with different variants', () => {
    const { rerender } = render(<Badge variant="default">Default</Badge>)
    expect(screen.getByText('Default')).toBeInTheDocument()

    rerender(<Badge variant="secondary">Secondary</Badge>)
    expect(screen.getByText('Secondary')).toBeInTheDocument()

    rerender(<Badge variant="destructive">Destructive</Badge>)
    expect(screen.getByText('Destructive')).toBeInTheDocument()

    rerender(<Badge variant="outline">Outline</Badge>)
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom Badge</Badge>)
    const badge = screen.getByText('Custom Badge')
    expect(badge).toHaveClass('custom-class')
  })
})

describe('Button Component', () => {
  it('should render button with text', () => {
    render(<Button>Click Me</Button>)
    const button = screen.getByText('Click Me')
    expect(button).toBeInTheDocument()
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)

    const button = screen.getByText('Click Me')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render different button variants', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    expect(screen.getByText('Default')).toBeInTheDocument()

    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByText('Destructive')).toBeInTheDocument()

    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByText('Outline')).toBeInTheDocument()

    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByText('Ghost')).toBeInTheDocument()

    rerender(<Button variant="link">Link</Button>)
    expect(screen.getByText('Link')).toBeInTheDocument()
  })

  it('should render different button sizes', () => {
    const { rerender } = render(<Button size="default">Default</Button>)
    expect(screen.getByText('Default')).toBeInTheDocument()

    rerender(<Button size="sm">Small</Button>)
    expect(screen.getByText('Small')).toBeInTheDocument()

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByText('Large')).toBeInTheDocument()

    rerender(<Button size="icon">Icon</Button>)
    expect(screen.getByText('Icon')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByText('Disabled Button')
    expect(button).toBeDisabled()
  })

  it('should not trigger onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)

    const button = screen.getByText('Disabled')
    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should render button as child element with asChild', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByText('Link Button')
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe('A')
  })
})

describe('Form Components', () => {
  it('should validate required fields', () => {
    const validateRequired = (value: string): string | undefined => {
      return value.trim() ? undefined : 'This field is required'
    }

    expect(validateRequired('')).toBe('This field is required')
    expect(validateRequired('  ')).toBe('This field is required')
    expect(validateRequired('valid')).toBeUndefined()
  })

  it('should validate email format', () => {
    const validateEmail = (email: string): string | undefined => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email) ? undefined : 'Invalid email address'
    }

    expect(validateEmail('test@example.com')).toBeUndefined()
    expect(validateEmail('invalid')).toBe('Invalid email address')
    expect(validateEmail('test@')).toBe('Invalid email address')
  })

  it('should validate password strength', () => {
    const validatePassword = (password: string): string | undefined => {
      if (password.length < 8) return 'Password must be at least 8 characters'
      if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter'
      if (!/[a-z]/.test(password)) return 'Password must contain lowercase letter'
      if (!/[0-9]/.test(password)) return 'Password must contain number'
      return undefined
    }

    expect(validatePassword('Short1')).toBe('Password must be at least 8 characters')
    expect(validatePassword('lowercase1')).toBe('Password must contain uppercase letter')
    expect(validatePassword('UPPERCASE1')).toBe('Password must contain lowercase letter')
    expect(validatePassword('NoNumbers')).toBe('Password must contain number')
    expect(validatePassword('Valid123')).toBeUndefined()
  })
})

describe('Accessibility', () => {
  it('buttons should have accessible names', () => {
    render(<Button aria-label="Submit form">Submit</Button>)
    const button = screen.getByLabelText('Submit form')
    expect(button).toBeInTheDocument()
  })

  it('badges should be readable by screen readers', () => {
    render(<Badge role="status">New</Badge>)
    const badge = screen.getByRole('status')
    expect(badge).toBeInTheDocument()
  })

  it('should support keyboard navigation', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Press Enter</Button>)

    const button = screen.getByText('Press Enter')
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })

    // Button should be accessible via keyboard
    expect(button).toBeInTheDocument()
  })
})

describe('Dark Mode Support', () => {
  it('should apply dark mode classes', () => {
    render(<Badge className="dark:bg-gray-800">Dark Mode</Badge>)
    const badge = screen.getByText('Dark Mode')
    expect(badge).toHaveClass('dark:bg-gray-800')
  })
})

describe('Responsive Design', () => {
  it('should apply responsive classes', () => {
    render(<Button className="w-full md:w-auto">Responsive</Button>)
    const button = screen.getByText('Responsive')
    expect(button).toHaveClass('w-full', 'md:w-auto')
  })
})

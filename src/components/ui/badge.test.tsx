import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Badge } from './badge'

describe('Badge', () => {
  it('renders correctly with default props', () => {
    render(<Badge>Default Badge</Badge>)

    const badge = screen.getByText('Default Badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold'
    )
  })

  it('applies default variant correctly', () => {
    render(<Badge>Default</Badge>)

    const badge = screen.getByText('Default')
    expect(badge).toHaveClass('border-transparent', 'bg-primary-500', 'text-white')
  })

  it('applies secondary variant correctly', () => {
    render(<Badge variant="secondary">Secondary</Badge>)

    const badge = screen.getByText('Secondary')
    expect(badge).toHaveClass('border-transparent', 'bg-gray-100', 'text-gray-900')
  })

  it('applies destructive variant correctly', () => {
    render(<Badge variant="destructive">Destructive</Badge>)

    const badge = screen.getByText('Destructive')
    expect(badge).toHaveClass('border-transparent', 'bg-red-500', 'text-white')
  })

  it('applies outline variant correctly', () => {
    render(<Badge variant="outline">Outline</Badge>)

    const badge = screen.getByText('Outline')
    expect(badge).toHaveClass('text-gray-950')
  })

  it('applies custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>)
    
    const badge = screen.getByText('Custom')
    expect(badge).toHaveClass('custom-badge')
  })

  it('forwards props correctly', () => {
    render(<Badge data-testid="test-badge">Test Badge</Badge>)
    
    const badge = screen.getByTestId('test-badge')
    expect(badge).toBeInTheDocument()
  })

  it('renders children correctly', () => {
    render(
      <Badge>
        <span>👍</span>
        Approved
      </Badge>
    )
    
    expect(screen.getByText('👍')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
  })

  it('can be used as a button-like element', () => {
    render(
      <Badge 
        role="button" 
        tabIndex={0}
        onKeyDown={() => {}}
      >
        Clickable Badge
      </Badge>
    )
    
    const badge = screen.getByRole('button')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('tabindex', '0')
  })

  it('supports accessibility attributes', () => {
    render(
      <Badge 
        aria-label="Status indicator"
        title="Current status"
      >
        Active
      </Badge>
    )
    
    const badge = screen.getByText('Active')
    expect(badge).toHaveAttribute('aria-label', 'Status indicator')
    expect(badge).toHaveAttribute('title', 'Current status')
  })

  it('handles empty content gracefully', () => {
    const { container } = render(<Badge></Badge>)

    const badge = container.querySelector('.inline-flex')
    expect(badge).toBeInTheDocument()
    expect(badge).toBeEmptyDOMElement()
  })

  it('maintains consistent sizing across variants', () => {
    const { rerender } = render(<Badge variant="default">Test</Badge>)
    const defaultBadge = screen.getByText('Test')
    const defaultClasses = defaultBadge.className

    rerender(<Badge variant="secondary">Test</Badge>)
    const secondaryBadge = screen.getByText('Test')

    // Check that sizing classes are consistent
    const sizingClasses = ['inline-flex', 'items-center', 'rounded-full', 'px-2.5', 'py-0.5', 'text-xs', 'font-semibold']
    sizingClasses.forEach(className => {
      expect(defaultBadge).toHaveClass(className)
      expect(secondaryBadge).toHaveClass(className)
    })
  })

  it('combines multiple variants and custom classes correctly', () => {
    render(
      <Badge
        variant="outline"
        className="hover:bg-gray-100 cursor-pointer"
      >
        Interactive Badge
      </Badge>
    )

    const badge = screen.getByText('Interactive Badge')
    expect(badge).toHaveClass('text-gray-950') // outline variant
    expect(badge).toHaveClass('hover:bg-gray-100', 'cursor-pointer') // custom classes
  })
})
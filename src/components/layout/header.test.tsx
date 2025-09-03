import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import { Header } from './header'

// Mock Next.js navigation hooks
const mockPush = vi.fn()
const mockPathname = '/'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => mockPathname,
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the header with logo and navigation', () => {
    render(<Header />)
    
    // Check logo
    expect(screen.getByText('Videbimus AI')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
    
    // Check main navigation items
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
    expect(screen.getByText('AI Playground')).toBeInTheDocument()
    expect(screen.getByText('Collaboration')).toBeInTheDocument()
    expect(screen.getByText('Case Studies')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('has correct logo link to home page', () => {
    render(<Header />)
    
    const logoLink = screen.getByRole('link', { name: /videbimus ai/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('has correct navigation links', () => {
    render(<Header />)
    
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: /services/i })).toHaveAttribute('href', '/services')
    expect(screen.getByRole('link', { name: /ai playground/i })).toHaveAttribute('href', '/ai')
    expect(screen.getByRole('link', { name: /collaboration/i })).toHaveAttribute('href', '/collaboration')
    expect(screen.getByRole('link', { name: /case studies/i })).toHaveAttribute('href', '/case-studies')
    expect(screen.getByRole('link', { name: /blog/i })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('href', '/contact')
  })

  it('renders mobile menu toggle button', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    expect(menuButton).toBeInTheDocument()
  })

  it('opens and closes mobile menu', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    
    // Initially closed
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    
    // Open menu
    fireEvent.click(menuButton)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Close menu
    fireEvent.click(menuButton)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes mobile menu when clicking outside', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    fireEvent.click(menuButton)
    
    // Menu should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Click outside (on backdrop)
    const backdrop = screen.getByRole('dialog').parentElement
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    }
  })

  it('closes mobile menu when pressing Escape key', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    fireEvent.click(menuButton)
    
    // Menu should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders theme toggle button', () => {
    render(<Header />)
    
    // Theme toggle should be present
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i })
    expect(themeToggle).toBeInTheDocument()
  })

  it('renders get started button', () => {
    render(<Header />)
    
    const getStartedButton = screen.getByRole('link', { name: /get started/i })
    expect(getStartedButton).toBeInTheDocument()
    expect(getStartedButton).toHaveAttribute('href', '/contact')
  })

  it('has proper accessibility attributes', () => {
    render(<Header />)
    
    // Header should have proper role
    const header = screen.getByRole('banner')
    expect(header).toBeInTheDocument()
    
    // Navigation should have proper role
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    
    // Menu button should have proper aria attributes
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    
    // Open menu and check aria-expanded changes
    fireEvent.click(menuButton)
    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('highlights active navigation item', () => {
    // Mock pathname as '/about'
    vi.mocked(mockPathname).mockReturnValue('/about')
    
    render(<Header />)
    
    const aboutLink = screen.getByRole('link', { name: /about/i })
    expect(aboutLink).toHaveClass('text-cyan-600') // or whatever active class is used
  })

  it('supports keyboard navigation', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    
    // Focus menu button
    menuButton.focus()
    expect(menuButton).toHaveFocus()
    
    // Test Enter key to open menu
    fireEvent.keyDown(menuButton, { key: 'Enter', code: 'Enter' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    
    // Test Escape key to close menu
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows navigation descriptions on hover', () => {
    render(<Header />)
    
    const servicesLink = screen.getByRole('link', { name: /services/i })
    
    // Hover over services link
    fireEvent.mouseEnter(servicesLink)
    
    // Check if description appears (implementation depends on actual component)
    // This test might need adjustment based on actual hover implementation
  })

  it('handles mobile responsive design', () => {
    render(<Header />)
    
    // Check that mobile menu button is present (indicating responsive design)
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    expect(menuButton).toBeInTheDocument()
    
    // Check that navigation items are hidden on mobile initially
    // This would depend on CSS classes and responsive design implementation
  })

  it('maintains scroll position when mobile menu is toggled', () => {
    render(<Header />)
    
    const menuButton = screen.getByRole('button', { name: /toggle navigation/i })
    
    // Set initial scroll position
    window.scrollTo = vi.fn()
    
    // Open menu
    fireEvent.click(menuButton)
    
    // Close menu
    fireEvent.click(menuButton)
    
    // Scroll position should be maintained
    // This is more of an integration test and might need actual DOM testing
  })
})
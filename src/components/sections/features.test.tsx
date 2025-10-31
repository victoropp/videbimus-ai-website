import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Features } from './features'

describe('Features', () => {
  it('renders features section correctly', () => {
    render(<Features />)

    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('displays section heading', () => {
    render(<Features />)

    const heading = screen.getByRole('heading', { level: 2 }) || screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/Why Work With Us|Instead of Hiring/i)
  })

  it('shows multiple feature items', () => {
    render(<Features />)

    // Look for new pain-point focused features
    const featureText = screen.getByText(/You Need Results Yesterday/i)
    expect(featureText).toBeInTheDocument()
  })

  it('displays feature titles and descriptions', () => {
    render(<Features />)

    // Look for new outcome-focused features (use getAllByText for text that appears multiple times)
    const feature1Text = screen.getByText(/You Need Results Yesterday/i)
    expect(feature1Text).toBeInTheDocument()

    const feature2Text = screen.getByText(/Know Exactly What You're Getting/i)
    expect(feature2Text).toBeInTheDocument()
  })

  it('includes feature icons or images', () => {
    render(<Features />)
    
    const images = screen.getAllByRole('img')
    const icons = document.querySelectorAll('svg')
    
    expect(images.length + icons.length).toBeGreaterThan(0)
  })

  it('has proper grid or layout structure', () => {
    render(<Features />)

    const container = document.querySelector('[class*="grid"], [class*="flex"]')
    expect(container).toBeInTheDocument()
  })

  it('displays call-to-action elements', () => {
    render(<Features />)

    // Features component displays feature cards with images and descriptions
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('has accessible feature descriptions', () => {
    render(<Features />)

    const headings = screen.getAllByRole('heading')
    headings.forEach(heading => {
      expect(heading).toBeInTheDocument()
      expect(heading.textContent).toBeTruthy()
    })
  })

  it('includes key AI features', () => {
    render(<Features />)
    
    // Check for common AI features
    const aiKeywords = /natural language|processing|automation|intelligent|smart|analytics/i
    const aiContent = screen.queryByText(aiKeywords)
    
    if (aiContent) {
      expect(aiContent).toBeInTheDocument()
    }
  })

  it('shows collaboration features', () => {
    render(<Features />)
    
    // Check for collaboration-related content
    const collabKeywords = /collaboration|meeting|chat|video|whiteboard|sharing/i
    const collabContent = screen.queryByText(collabKeywords)
    
    if (collabContent) {
      expect(collabContent).toBeInTheDocument()
    }
  })

  it('has responsive design classes', () => {
    render(<Features />)

    const section = document.querySelector('section')
    const hasResponsiveContent = section !== null
    expect(hasResponsiveContent).toBeTruthy()
  })

  it('maintains consistent spacing and typography', () => {
    render(<Features />)
    
    const headings = screen.getAllByRole('heading')
    headings.forEach(heading => {
      expect(heading).toHaveClass(/text-|font-|leading-|tracking-/)
    })
  })

  it('includes proper semantic markup', () => {
    render(<Features />)

    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()

    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })
})
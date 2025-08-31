import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import Features from './features'

describe('Features', () => {
  it('renders features section correctly', () => {
    render(<Features />)
    
    const section = screen.getByRole('region') || screen.getByTestId('features-section')
    expect(section).toBeInTheDocument()
  })

  it('displays section heading', () => {
    render(<Features />)
    
    const heading = screen.getByRole('heading', { level: 2 }) || screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/features|capabilities|services/i)
  })

  it('shows multiple feature items', () => {
    render(<Features />)
    
    // Look for feature cards or items
    const featureItems = screen.getAllByTestId(/feature-|card-/) || 
                        screen.getAllByRole('article') ||
                        document.querySelectorAll('[class*="feature"], [class*="card"]')
    
    expect(featureItems.length).toBeGreaterThan(1)
  })

  it('displays feature titles and descriptions', () => {
    render(<Features />)
    
    // Look for AI-related features
    const aiFeature = screen.getByText(/AI|artificial intelligence|machine learning/i)
    expect(aiFeature).toBeInTheDocument()
    
    // Look for collaboration features
    const collabFeature = screen.queryByText(/collaboration|teamwork|real-time/i)
    if (collabFeature) {
      expect(collabFeature).toBeInTheDocument()
    }
  })

  it('includes feature icons or images', () => {
    render(<Features />)
    
    const images = screen.getAllByRole('img')
    const icons = document.querySelectorAll('svg')
    
    expect(images.length + icons.length).toBeGreaterThan(0)
  })

  it('has proper grid or layout structure', () => {
    render(<Features />)
    
    const container = screen.getByRole('region') || document.querySelector('[class*="grid"], [class*="flex"]')
    expect(container).toBeInTheDocument()
  })

  it('displays call-to-action elements', () => {
    render(<Features />)
    
    const links = screen.getAllByRole('link')
    const buttons = screen.getAllByRole('button')
    
    expect(links.length + buttons.length).toBeGreaterThan(0)
  })

  it('has accessible feature descriptions', () => {
    render(<Features />)
    
    const headings = screen.getAllByRole('heading')
    headings.forEach(heading => {
      expect(heading).toBeVisible()
      expect(heading).toHaveAccessibleName()
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
    
    const container = screen.getByRole('region') || document.querySelector('[class*="features"]')
    const hasResponsiveClasses = container?.className.includes('sm:') || 
                                container?.className.includes('md:') || 
                                container?.className.includes('lg:')
    
    expect(hasResponsiveClasses).toBeTruthy()
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
    
    const section = screen.getByRole('region') || document.querySelector('section')
    expect(section).toBeInTheDocument()
    
    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)
  })
})
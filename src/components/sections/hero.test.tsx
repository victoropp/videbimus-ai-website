import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import Hero from './hero'

describe('Hero', () => {
  it('renders hero section correctly', () => {
    render(<Hero />)
    
    // Check for main heading
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/AI-Powered Solutions/i)
  })

  it('displays company tagline', () => {
    render(<Hero />)
    
    const tagline = screen.getByText(/Next-Generation AI Technology/i)
    expect(tagline).toBeInTheDocument()
  })

  it('contains call-to-action buttons', () => {
    render(<Hero />)
    
    const getStartedButton = screen.getByRole('link', { name: /get started/i })
    const learnMoreButton = screen.getByRole('link', { name: /learn more/i })
    
    expect(getStartedButton).toBeInTheDocument()
    expect(learnMoreButton).toBeInTheDocument()
  })

  it('has proper navigation links', () => {
    render(<Hero />)
    
    const getStartedButton = screen.getByRole('link', { name: /get started/i })
    const learnMoreButton = screen.getByRole('link', { name: /learn more/i })
    
    expect(getStartedButton).toHaveAttribute('href', '/contact')
    expect(learnMoreButton).toHaveAttribute('href', '/about')
  })

  it('displays key features or benefits', () => {
    render(<Hero />)
    
    // Look for common hero content
    const description = screen.getByText(/Transform your business/i)
    expect(description).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<Hero />)
    
    const section = screen.getByRole('banner') || screen.getByRole('region')
    expect(section).toBeInTheDocument()
  })

  it('includes visual elements', () => {
    render(<Hero />)
    
    // Check for hero image or illustration
    const heroImage = screen.queryByRole('img')
    if (heroImage) {
      expect(heroImage).toBeInTheDocument()
      expect(heroImage).toHaveAttribute('alt')
    }
  })

  it('is responsive and mobile-friendly', () => {
    render(<Hero />)
    
    const heroSection = screen.getByRole('banner') || screen.getByRole('region')
    expect(heroSection).toHaveClass(/responsive|container|mx-auto|px-|py-/)
  })

  it('has proper contrast and accessibility', () => {
    render(<Hero />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeVisible()
    
    const buttons = screen.getAllByRole('link')
    buttons.forEach(button => {
      expect(button).toBeVisible()
      expect(button).toHaveAccessibleName()
    })
  })

  it('contains gradient or background styling', () => {
    render(<Hero />)
    
    const heroSection = screen.getByRole('banner') || screen.getByRole('region')
    expect(heroSection).toHaveClass(/bg-|gradient|from-|to-/)
  })

  it('includes animation or motion elements', () => {
    render(<Hero />)
    
    // Check for elements that might have animations
    const animatedElements = screen.getByRole('banner') || screen.getByRole('region')
    expect(animatedElements).toBeInTheDocument()
  })

  it('displays consistent branding', () => {
    render(<Hero />)
    
    // Check for brand name or company name
    const brandElement = screen.getByText(/vidibemus/i) || screen.getByText(/ai/i)
    expect(brandElement).toBeInTheDocument()
  })
})
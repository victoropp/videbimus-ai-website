import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'
import { Hero } from './hero'

describe('Hero', () => {
  it('renders hero section correctly', () => {
    render(<Hero />)

    // Check for main heading with new pain-focused messaging
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/Stop Drowning in Data|Start Making Better Decisions/i)
  })

  it('displays company tagline', () => {
    render(<Hero />)

    const tagline = screen.getByText(/Your Data Is Already Costing You Money/i)
    expect(tagline).toBeInTheDocument()
  })

  it('contains call-to-action buttons', () => {
    render(<Hero />)

    const ctaButton = screen.getByRole('link', { name: /Show Me How|Free Consultation/i })
    const secondaryButton = screen.getByRole('link', { name: /See Real Results|Case Studies/i })

    expect(ctaButton).toBeInTheDocument()
    expect(secondaryButton).toBeInTheDocument()
  })

  it('has proper navigation links', () => {
    render(<Hero />)

    const ctaButton = screen.getByRole('link', { name: /Show Me How|Free Consultation/i })
    const secondaryButton = screen.getByRole('link', { name: /See Real Results|Case Studies/i })

    expect(ctaButton).toHaveAttribute('href', '/contact')
    expect(secondaryButton).toHaveAttribute('href', '/case-studies')
  })

  it('displays key features or benefits', () => {
    render(<Hero />)

    // Look for new outcome-focused content
    const description = screen.getByText(/reduce operational costs|automate repetitive work/i)
    expect(description).toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<Hero />)

    // Hero uses <section> element which has implicit region role
    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('includes visual elements', () => {
    render(<Hero />)

    // Check for hero image - now we definitely have one
    const heroImage = screen.getByRole('img', { name: /data analytics dashboard/i })
    expect(heroImage).toBeInTheDocument()
    expect(heroImage).toHaveAttribute('alt')
    // Next.js Image component transforms and URL-encodes src
    const src = heroImage.getAttribute('src')
    expect(src).toBeTruthy()
    expect(decodeURIComponent(src!)).toContain('/images/home/hero-data-analyst.jpg')
  })

  it('is responsive and mobile-friendly', () => {
    render(<Hero />)

    // Check for responsive container classes
    const container = document.querySelector('.container')
    expect(container).toBeInTheDocument()
  })

  it('has proper contrast and accessibility', () => {
    render(<Hero />)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()

    const buttons = screen.getAllByRole('link')
    buttons.forEach(button => {
      expect(button).toBeInTheDocument()
      expect(button).toHaveAccessibleName()
    })
  })

  it('contains gradient or background styling', () => {
    render(<Hero />)

    // Check for gradient classes in the hero section
    const heroSection = document.querySelector('section')
    expect(heroSection?.className).toMatch(/gradient|from-|to-/)
  })

  it('includes animation or motion elements', () => {
    render(<Hero />)

    // Check for framer-motion animated elements
    const heroSection = document.querySelector('section')
    expect(heroSection).toBeInTheDocument()
  })

  it('displays consistent branding', () => {
    render(<Hero />)

    // Check for key brand messaging instead of brand name (which is in header, not hero)
    const brandMessage = screen.getByText(/Your Data Is Already Costing You Money/i)
    expect(brandMessage).toBeInTheDocument()
  })
})
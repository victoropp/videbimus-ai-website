import type { Metadata } from 'next'
import { Hero } from '@/components/sections/hero'
import { ServicesOverview } from '@/components/sections/services-overview'
import { Features } from '@/components/sections/features'
import { Testimonials } from '@/components/sections/testimonials'
import { Team } from '@/components/sections/team'
import { CTA } from '@/components/sections/cta'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Transform your business with expert AI and Data Science consulting services. From strategy to implementation, we help organizations unlock the power of artificial intelligence.',
  keywords: [
    'AI consulting',
    'Data Science services',
    'Machine Learning consulting',
    'AI transformation',
    'Predictive analytics',
    'Business intelligence',
    'AI strategy',
    'Data analytics'
  ],
  openGraph: {
    title: 'Videbimus AI - Transform Your Business with AI & Data Science',
    description: 'Expert AI and Data Science consulting services. From strategy to implementation, we help organizations unlock the power of artificial intelligence.',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Videbimus AI - AI & Data Science Consulting Services'
      }
    ]
  }
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesOverview />
      <Features />
      <Testimonials />
      <Team />
      <CTA />
    </>
  )
}
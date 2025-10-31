import type { Metadata } from 'next'
import { Hero } from '@/components/sections/hero'
import { ServicesOverview } from '@/components/sections/services-overview'
import { Features } from '@/components/sections/features'
import { Testimonials } from '@/components/sections/testimonials'
import { Team } from '@/components/sections/team'
import { CTA } from '@/components/sections/cta'

export const metadata: Metadata = {
  title: 'Reduce Costs & Automate Manual Work | Videbimus AI',
  description: 'Stop wasting money on manual processes. SMBs and growing companies save money by automating operations and leveraging business data—no complexity, real results fast.',
  keywords: [
    'reduce operational costs',
    'business process automation',
    'cut business expenses',
    'automate manual tasks',
    'business data analytics',
    'small business AI',
    'improve efficiency',
    'save time and money',
    'business automation solutions',
    'data-driven insights'
  ],
  openGraph: {
    title: 'Stop Drowning in Data. Start Making Better Decisions | Videbimus AI',
    description: 'Your team is burning hours on manual tasks. We help companies reduce costs, automate repetitive work, and turn data into profit—without 6-figure budgets.',
    images: [
      {
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'Videbimus AI - Turn Your Data Into Profit'
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
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required')
}

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
  appInfo: {
    name: 'Vidibemus AI Platform',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://vidibemus.ai',
  },
})

// Stripe configuration constants
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  currency: 'USD',
  locale: 'en-US',
  
  // Subscription Plans Configuration
  plans: {
    STARTER: {
      name: 'Starter',
      description: 'Basic AI features for small projects',
      priceId: process.env.STRIPE_STARTER_PRICE_ID!,
      features: [
        'Basic AI Chat',
        'Document Analysis',
        'Up to 10,000 AI tokens/month',
        'Email Support',
        'Basic Analytics'
      ],
      limits: {
        tokensPerMonth: 10000,
        apiCallsPerDay: 100,
        collaborators: 2,
        projects: 5
      }
    },
    PROFESSIONAL: {
      name: 'Professional',
      description: 'Advanced AI + collaboration tools',
      priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
      features: [
        'Advanced AI Models',
        'Real-time Collaboration',
        'Up to 100,000 AI tokens/month',
        'Priority Support',
        'Advanced Analytics',
        'Custom Integrations',
        'Video Conferencing'
      ],
      limits: {
        tokensPerMonth: 100000,
        apiCallsPerDay: 1000,
        collaborators: 10,
        projects: 25
      }
    },
    ENTERPRISE: {
      name: 'Enterprise',
      description: 'Full suite + priority support',
      priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
      features: [
        'All AI Models',
        'Unlimited Collaboration',
        'Unlimited AI tokens',
        'Dedicated Support',
        'Custom Analytics',
        'White-label Options',
        'On-premise Deployment',
        'SLA Guarantees'
      ],
      limits: {
        tokensPerMonth: -1, // unlimited
        apiCallsPerDay: -1, // unlimited
        collaborators: -1, // unlimited
        projects: -1 // unlimited
      }
    }
  },

  // Usage-based billing rates (per 1000 tokens)
  usageRates: {
    CHAT_COMPLETION: 0.002,
    TEXT_GENERATION: 0.002,
    IMAGE_GENERATION: 0.02,
    TRANSCRIPTION: 0.006,
    TRANSLATION: 0.015,
    SENTIMENT_ANALYSIS: 0.001,
    SUMMARIZATION: 0.003,
    ENTITY_EXTRACTION: 0.001,
    KNOWLEDGE_SEARCH: 0.001,
    RECOMMENDATIONS: 0.002,
    COLLABORATION_AI: 0.001
  }
} as const

// Helper function to get plan details by ID
export function getPlanById(planId: string) {
  return Object.values(STRIPE_CONFIG.plans).find(plan => plan.priceId === planId)
}

// Helper function to get plan by name
export function getPlanByName(planName: keyof typeof STRIPE_CONFIG.plans) {
  return STRIPE_CONFIG.plans[planName]
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100) // Stripe amounts are in cents
}

// Convert dollars to cents (Stripe format)
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

// Convert cents to dollars
export function centsToDollars(cents: number): number {
  return cents / 100
}
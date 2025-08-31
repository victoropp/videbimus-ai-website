/**
 * Application constants and configuration values
 * @fileoverview Central location for all application constants
 */

// Application Metadata
export const APP_CONFIG = {
  name: 'Vidibemus AI',
  description: 'Expert AI and Data Science consulting services. We help organizations transform through intelligent automation, predictive analytics, and data-driven decision making.',
  version: '1.0.0',
  author: 'Vidibemus AI',
  url: 'https://vidibemus.ai',
  email: 'hello@vidibemus.ai',
  phone: '+1 (555) 123-4567',
  address: {
    street: '123 Innovation Drive',
    city: 'Tech Valley',
    state: 'CA',
    zip: '94000',
    country: 'United States'
  }
} as const;

// SEO Defaults
export const SEO_DEFAULTS = {
  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  keywords: [
    'AI consulting',
    'Data Science',
    'Machine Learning',
    'Business Intelligence',
    'Predictive Analytics',
    'AI Implementation',
    'Data Analytics',
    'AI Strategy',
    'Digital Transformation',
    'Automation'
  ],
  openGraph: {
    type: 'website' as const,
    locale: 'en_US',
    siteName: APP_CONFIG.name,
    images: {
      default: '/og-image.jpg',
      width: 1200,
      height: 630
    }
  },
  twitter: {
    card: 'summary_large_image' as const,
    site: '@vidibemusai',
    creator: '@vidibemusai'
  }
} as const;

// Navigation
export const NAVIGATION = {
  main: [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'AI Showcase', href: '/ai' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ],
  footer: {
    services: [
      { name: 'AI Strategy', href: '/services#strategy' },
      { name: 'Data Analytics', href: '/services#analytics' },
      { name: 'ML Implementation', href: '/services#implementation' },
      { name: 'AI Training', href: '/services#training' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Team', href: '/about#team' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ],
    resources: [
      { name: 'Blog', href: '/blog' },
      { name: 'Case Studies', href: '/case-studies' },
      { name: 'Documentation', href: '/docs' },
      { name: 'FAQ', href: '/faq' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' }
    ]
  },
  social: {
    twitter: 'https://twitter.com/vidibemusai',
    linkedin: 'https://linkedin.com/company/vidibemus-ai',
    github: 'https://github.com/vidibemus-ai',
    youtube: 'https://youtube.com/vidibemusai'
  }
} as const;

// Service Categories
export const SERVICE_CATEGORIES = {
  discovery: {
    name: 'Discovery & Strategy',
    description: 'Assess your AI readiness and develop comprehensive strategies',
    color: 'blue'
  },
  implementation: {
    name: 'Implementation',
    description: 'Build and deploy AI solutions tailored to your needs',
    color: 'green'
  },
  transformation: {
    name: 'Transformation',
    description: 'Transform your business processes with AI integration',
    color: 'purple'
  },
  specialized: {
    name: 'Specialized Services',
    description: 'Expert services for specific AI and ML challenges',
    color: 'orange'
  }
} as const;

// AI Model Providers
export const AI_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4', 'gpt-3.5-turbo', 'dall-e-3'],
    capabilities: ['text-generation', 'image-generation', 'embeddings']
  },
  anthropic: {
    name: 'Anthropic',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    capabilities: ['text-generation', 'analysis', 'reasoning']
  },
  huggingface: {
    name: 'Hugging Face',
    models: ['various'],
    capabilities: ['text-generation', 'sentiment-analysis', 'translation']
  }
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  retries: 3,
  rateLimit: {
    requests: 100,
    window: 60000 // 1 minute
  }
} as const;

// File Upload Limits
export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json'
  ]
} as const;

// Form Validation
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  name: {
    minLength: 2,
    maxLength: 50
  },
  message: {
    minLength: 10,
    maxLength: 1000
  }
} as const;

// Theme Configuration
export const THEME_CONFIG = {
  colors: {
    primary: 'hsl(195, 100%, 50%)', // #00E5FF
    secondary: 'hsl(240, 5%, 41%)', // #68686B
    accent: 'hsl(280, 100%, 70%)', // #B040FF
    background: 'hsl(0, 0%, 100%)', // #FFFFFF
    foreground: 'hsl(240, 10%, 4%)', // #0A0A0B
    muted: 'hsl(240, 5%, 96%)', // #F5F5F6
    border: 'hsl(240, 6%, 90%)', // #E4E4E7
    success: 'hsl(142, 71%, 45%)', // #22C55E
    warning: 'hsl(38, 92%, 50%)', // #F59E0B
    error: 'hsl(0, 84%, 60%)' // #EF4444
  },
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    serif: ['Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
    heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif']
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
} as const;

// Animation Durations
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 1000,
  ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
} as const;

// Breakpoints
export const BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Z-Index Layers
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
  loading: 1080
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  validation: 'Please check your input and try again.',
  unauthorized: 'You are not authorized to perform this action.',
  forbidden: 'Access denied.',
  notFound: 'The requested resource was not found.',
  rateLimit: 'Too many requests. Please try again later.',
  serverError: 'Server error. Please try again later.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  contactForm: 'Thank you for your message! We\'ll get back to you soon.',
  newsletter: 'Successfully subscribed to our newsletter!',
  download: 'Download started successfully.',
  save: 'Changes saved successfully.',
  upload: 'File uploaded successfully.'
} as const;

// Feature Flags
export const FEATURES = {
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  darkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== 'false',
  collaboration: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION === 'true',
  aiShowcase: process.env.NEXT_PUBLIC_ENABLE_AI_SHOWCASE !== 'false',
  blog: process.env.NEXT_PUBLIC_ENABLE_BLOG !== 'false',
  newsletter: process.env.NEXT_PUBLIC_ENABLE_NEWSLETTER !== 'false'
} as const;
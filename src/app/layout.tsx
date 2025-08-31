import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CustomerServiceBot } from '@/components/ai-assistant/customer-service-bot'
import ClientErrorBoundary from '@/components/client-error-boundary'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Videbimus AI - Transforming Business with AI & Data Science',
    template: '%s | Videbimus AI'
  },
  description: 'Expert AI and Data Science consulting services. We help organizations transform through intelligent automation, predictive analytics, and data-driven decision making.',
  keywords: [
    'AI consulting',
    'Data Science',
    'Machine Learning',
    'Business Intelligence',
    'Predictive Analytics',
    'AI Implementation',
    'Data Analytics',
    'AI Strategy'
  ],
  authors: [{ name: 'Videbimus AI' }],
  creator: 'Videbimus AI',
  metadataBase: new URL('https://videbimus.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://videbimus.ai',
    siteName: 'Videbimus AI',
    title: 'Videbimus AI - Transforming Business with AI & Data Science',
    description: 'Expert AI and Data Science consulting services. Transform your business with intelligent automation and data-driven insights.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Videbimus AI - AI & Data Science Consulting'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Videbimus AI - Transforming Business with AI & Data Science',
    description: 'Expert AI and Data Science consulting services. Transform your business with intelligent automation and data-driven insights.',
    images: ['/twitter-image.jpg'],
    creator: '@videbimusai'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00E5FF" />
      </head>
      <body 
        className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ClientErrorBoundary>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">
                <ClientErrorBoundary isolate>
                  {children}
                </ClientErrorBoundary>
              </main>
              <Footer />
              <CustomerServiceBot />
            </div>
          </ClientErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
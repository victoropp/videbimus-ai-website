'use client'

import type { Metadata } from 'next'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Search, 
  Cog, 
  Building2, 
  Brain,
  BarChart3,
  Bot,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Star
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Service, ServiceFeature, ServiceFeatureInput } from '@/types'

// Create badge component if it doesn't exist
const ServiceBadge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
    {children}
  </span>
)

// Helper function to convert string features to ServiceFeature objects
const normalizeFeature = (feature: ServiceFeatureInput, index: number): ServiceFeature => {
  if (typeof feature === 'string') {
    return {
      id: `feature-${index}`,
      name: feature,
      included: true,
      highlight: false
    }
  }
  return feature
}

const mainServices: Service[] = [
  {
    id: 'discovery',
    title: 'Quick Win Package',
    description: 'Not sure where to start? We find your biggest money leak and show you exactly how to fix it—fast. Perfect for first-time AI buyers who need proof before committing.',
    duration: '2-4 weeks',
    features: [
      'Find where you\'re hemorrhaging money (the data doesn\'t lie)',
      'Live demo with YOUR data (not generic slides)',
      'Exact ROI calculation—no hand-waving',
      'See one working prototype before you commit',
      'Know if your team can actually use it',
      'Clear "go/no-go" recommendation (we\'ll tell you if it won\'t work)',
      '30-day implementation roadmap',
      'Fixed price—no scope creep surprises',
      'Keep the working prototype',
      'Priority scheduling for next phase'
    ],
    category: 'discovery'
  },
  {
    id: 'implementation',
    title: 'Build & Launch',
    description: 'You know the problem. We build the solution. Ship working software in 6-8 weeks that your team will actually use on Monday morning. Most popular for single high-impact projects.',
    duration: '6-8 weeks',
    features: [
      'Working software in 6-8 weeks (not months)',
      'Built with YOUR processes in mind',
      'Integrates with what you already use',
      'Predictive systems that actually predict (failure, demand, churn)',
      'Automation that works without babysitting',
      'Your team trained before we leave',
      'Deployed and monitored 24/7',
      'Security that passes your IT audit',
      'Handoff includes source code and docs',
      '90-day support to iron out issues'
    ],
    category: 'implementation'
  },
  {
    id: 'transformation',
    title: 'Full Stack Solution',
    description: 'Multiple departments bleeding cash? Need 3+ systems fixed? This is the "fix everything" package. We become your AI team for 4-6 months and tackle your biggest operational nightmares.',
    duration: '4-6 months',
    features: [
      'Fix 3-5 major operational problems',
      'One AI platform—multiple use cases',
      'Works across departments (finally)',
      'Scale without rebuilding everything',
      'Your data actually gets used for decisions',
      'Build it right so you don\'t need us forever',
      'Hire and train YOUR permanent AI team',
      'Ongoing support after launch',
      'Systems that learn and improve over time',
      'Guaranteed $500K+ annual savings or money back'
    ],
    category: 'transformation'
  }
]

const specializedServices = [
  {
    id: 'ml',
    icon: Brain,
    title: 'Industry-Specific Solutions',
    description: 'Pre-built solutions for common business nightmares. We\'ve seen your problem before—here\'s how we fixed it.',
    services: [
      { name: 'Oil & Gas: Stop Equipment Failures', description: 'Predict which pumps/compressors will fail before they do. Save $200K per prevented failure.' },
      { name: 'Insurance: Process Claims 60% Faster', description: 'Auto-extract data from documents, flag fraud, route to right adjuster. Cut processing time from days to hours.' },
      { name: 'Manufacturing: Cut Waste by 30%', description: 'Optimize production schedules, predict quality issues, reduce material waste. Real-time dashboards your operators will actually use.' }
    ]
  },
  {
    id: 'data-engineering',
    icon: BarChart3,
    title: 'Fix Your Data Mess',
    description: 'Data scattered everywhere? Can\'t get reports when you need them? We\'ll turn that chaos into a system that actually works.',
    services: [
      { name: 'Connect Everything', description: 'Pull data from all your systems into one place. No more Excel hell or waiting on IT for reports.' },
      { name: 'Dashboards That Make Sense', description: 'See what\'s actually happening in your business. Updated in real-time, not last month\'s numbers.' },
      { name: 'Clean Up the Mess', description: 'Fix duplicate records, standardize formats, make your data trustworthy enough to make decisions on.' }
    ]
  },
  {
    id: 'automation',
    icon: Bot,
    title: 'Automate the Boring Stuff',
    description: 'Your team is too valuable to waste on data entry, copy-paste, and manual approvals. Let software do it.',
    services: [
      { name: 'Kill the Spreadsheet Work', description: 'Automate invoice processing, data entry, report generation. Free up 20+ hours per person per week.' },
      { name: 'Customer Service That Scales', description: 'Chatbots that actually help (not "I didn\'t understand that"). Handle 80% of common questions 24/7.' },
      { name: 'Smart Workflows', description: 'Auto-route approvals, flag issues, make simple decisions without human intervention. Your team handles exceptions only.' }
    ]
  },
  {
    id: 'training',
    icon: GraduationCap,
    title: 'Train Your Team',
    description: 'The best AI system in the world is useless if your team won\'t use it. We make sure they get it.',
    services: [
      { name: 'Executive Workshops', description: 'Help leadership understand what\'s realistic vs. hype. 4-hour session on what AI can actually do for YOUR business.' },
      { name: 'Hands-On Training', description: 'Your team learns on the actual system we built for you. Not generic training—specific to your processes.' },
      { name: 'AI Literacy Programs', description: 'Upskill your whole organization so they can spot opportunities and ask smart questions. 6-week program.' }
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
              Pick Your Problem. We'll Fix It.
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200 mb-8">
              Equipment breaking? Claims taking forever? Can't forecast demand? Pick the package that matches where you're bleeding money.
              We'll show you what's possible—with your own data—in the first two weeks.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-white/90">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span>$50K+ Avg Monthly Savings</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span>6-8 Weeks to Live Solution</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-cyan-400" />
                <span>ROI in First 90 Days</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Service Tiers */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
              Three Ways to Stop the Bleeding
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Start small and prove ROI, or go big if you've got multiple problems burning cash
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 lg:grid-cols-3 mb-16"
          >
            {mainServices.map((service, index) => {
              const icons = [Search, Cog, Building2]
              const Icon = icons[index]
              const gradients = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-green-500 to-emerald-500']
              const gradient = gradients[index]
              
              return (
                <motion.div key={service.id} variants={itemVariants}>
                  <Card className="h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    
                    <CardHeader className="relative">
                      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Duration */}
                      <div className="w-full">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{service.duration}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Timeline</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Key Features:</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {service.features.slice(0, 6).map((feature, idx) => {
                            const normalizedFeature = normalizeFeature(feature, idx)
                            return (
                              <div key={normalizedFeature.id} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                {normalizedFeature.name}
                              </div>
                            )
                          })}
                          {service.features.length > 6 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              +{service.features.length - 6} more features
                            </div>
                          )}
                        </div>
                      </div>

                      <Button asChild className="w-full">
                        <Link href={`/contact?service=${service.id}`}>
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Specialized Services */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
              Common Business Scenarios
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              See yourself in one of these? We've built this solution 10+ times already
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 lg:grid-cols-2"
          >
            {specializedServices.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div key={service.id} variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{service.title}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {service.services.map((subService, idx) => (
                        <div key={idx} className="border-l-2 border-cyan-200 dark:border-cyan-800 pl-4 py-2">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {subService.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {subService.description}
                          </p>
                        </div>
                      ))}
                      <Button asChild variant="outline" className="w-full mt-4">
                        <Link href={`/contact?service=${service.id}`}>
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        <div className="container relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Not Sure Which Package Fits?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              30-minute call. We'll figure out where you're losing money and tell you honestly if we can help.
              No pitch deck. No pressure. Just real talk about what's possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-gray-100">
                <Link href="/contact">
                  Find My Money Leak (Free)
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/case-studies">
                  See Real Results First
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
'use client'

import type { Metadata } from 'next'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
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
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Service, ServiceFeature, ServiceFeatureInput } from '@/types'
import { useState } from 'react'

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

const industryData = [
  { name: 'Oil & Gas', image: 'industry-oil-gas.jpg', description: 'Stop Equipment Failures', detail: 'Predict which pumps/compressors will fail before they do. Save $200K per prevented failure.' },
  { name: 'Insurance', image: 'industry-insurance.jpg', description: 'Process Claims 60% Faster', detail: 'Auto-extract data from documents, flag fraud, route to right adjuster. Cut processing time from days to hours.' },
  { name: 'Manufacturing', image: 'industry-manufacturing.jpg', description: 'Cut Waste by 30%', detail: 'Optimize production schedules, predict quality issues, reduce material waste. Real-time dashboards your operators will actually use.' },
  { name: 'Fintech', image: 'industry-fintech.jpg', description: 'Fraud Detection & Risk', detail: 'Real-time transaction monitoring, pattern recognition, and automated compliance. Reduce fraud losses by 70%.' },
  { name: 'Healthcare', image: 'industry-healthcare.jpg', description: 'Patient Care Optimization', detail: 'Predictive scheduling, resource allocation, patient outcome forecasting. Improve efficiency by 40%.' },
  { name: 'Retail', image: 'industry-retail.jpg', description: 'Smart Inventory & Demand', detail: 'Forecast demand accurately, optimize stock levels, reduce waste. Cut inventory costs by 25%.' },
  { name: 'Logistics', image: 'industry-logistics.jpg', description: 'Route & Fleet Optimization', detail: 'Optimize delivery routes, predict maintenance, reduce fuel costs. Save 15-20% on operations.' },
  { name: 'Energy', image: 'industry-energy.jpg', description: 'Grid & Load Management', detail: 'Predict energy demand, optimize distribution, prevent outages. Improve grid efficiency by 30%.' }
]

const dataFixSteps = [
  { title: 'Before: The Mess', image: 'data-before-messy.jpg', description: 'Data scattered across Excel, PDFs, legacy systems. Nobody trusts the numbers.' },
  { title: 'During: The Fix', image: 'data-during-cleaning.jpg', description: 'We connect, clean, and standardize everything. One source of truth.' },
  { title: 'After: Real Insights', image: 'data-after-dashboard.jpg', description: 'Live dashboards, automated reports, confident decisions. Your data finally works.' }
]

const automationComparison = [
  { title: 'Manual Process', image: 'automation-manual-process.jpg', description: 'Your team drowning in data entry, copy-paste, manual approvals. 40+ hours/week wasted.' },
  { title: 'Automated Process', image: 'automation-automated-process.jpg', description: 'Software handles the grunt work 24/7. Your team focuses on high-value tasks.' }
]

const trainingImages = [
  { title: 'Executive Workshops', image: 'training-workshop.jpg', description: 'Help leadership understand what\'s realistic vs. hype. 4-hour session on what AI can actually do for YOUR business.' },
  { title: 'Hands-On Training', image: 'training-hands-on.jpg', description: 'Your team learns on the actual system we built for you. Not generic training—specific to your processes.' },
  { title: 'AI Literacy Programs', image: 'training-certification.jpg', description: 'Upskill your whole organization so they can spot opportunities and ask smart questions. 6-week program.' }
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
  const [currentTrainingSlide, setCurrentTrainingSlide] = useState(0)

  const nextTrainingSlide = () => {
    setCurrentTrainingSlide((prev) => (prev + 1) % trainingImages.length)
  }

  const prevTrainingSlide = () => {
    setCurrentTrainingSlide((prev) => (prev - 1 + trainingImages.length) % trainingImages.length)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative py-32 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/services/hero-service-excellence.jpg"
            alt="Service Excellence"
            fill
            priority
            className="object-cover"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/95 via-primary-800/90 to-primary-700/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        </div>

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
              const tierImages = ['tier-quick-win.jpg', 'tier-build-launch.jpg', 'tier-full-stack.jpg']
              const tierImage = tierImages[index]

              return (
                <motion.div key={service.id} variants={itemVariants}>
                  <Card className="h-full relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Service Image with Overlay */}
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={`/images/services/${tierImage}`}
                        alt={service.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-70 transition-opacity`} />

                      {/* Icon Badge */}
                      <div className="absolute top-4 left-4">
                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg`}>
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>

                      {/* Duration Badge */}
                      <div className="absolute bottom-4 right-4">
                        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
                          <Clock className="h-4 w-4 text-gray-700" />
                          <span className="text-sm font-medium text-gray-900">{service.duration}</span>
                        </div>
                      </div>
                    </div>

                    <CardHeader className="relative">
                      <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
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

      {/* Industry-Specific Solutions */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
              Industry Expertise
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
              Solutions Built for Your Industry
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
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {industryData.map((industry, index) => (
              <motion.div key={industry.name} variants={itemVariants}>
                <Card className="h-full group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={`/images/services/${industry.image}`}
                      alt={industry.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

                    {/* Industry Name */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-bold text-white text-lg mb-1">{industry.name}</h3>
                      <p className="text-cyan-300 text-sm font-medium">{industry.description}</p>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {industry.detail}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/contact">
                Discuss Your Industry Needs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Data Fix: Before/During/After */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-cyan-500 mr-2" />
              <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
                Data Transformation
              </Badge>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
              Fix Your Data Mess
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Data scattered everywhere? Can't get reports when you need them? We'll turn that chaos into a system that actually works.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {dataFixSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index === 0 ? -50 : index === 2 ? 50 : 0, y: index === 1 ? -30 : 0 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-500">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={`/images/services/${step.image}`}
                      alt={step.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />

                    {/* Step Number */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-cyan-500 text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                    </div>

                    {/* Step Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-bold text-white text-xl mb-2">{step.title}</h3>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <p className="text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/contact?service=data-engineering">
                Clean Up My Data
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Automation: Before vs After */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-purple-500 mr-2" />
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                Process Automation
              </Badge>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
              Automate the Boring Stuff
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Your team is too valuable to waste on data entry, copy-paste, and manual approvals. Let software do it.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
            {automationComparison.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card className={`h-full overflow-hidden group hover:shadow-xl transition-all duration-500 ${index === 0 ? 'border-red-200 dark:border-red-900' : 'border-green-200 dark:border-green-900'}`}>
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={`/images/services/${item.image}`}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className={`${index === 0 ? 'bg-red-500' : 'bg-green-500'} text-white border-0 text-sm`}>
                        {index === 0 ? 'Before' : 'After'}
                      </Badge>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-bold text-white text-2xl mb-2">{item.title}</h3>
                      <p className="text-gray-200">{item.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-6">
              Free up 20+ hours per person per week. Handle 80% of common questions 24/7.
            </p>
            <Button asChild size="lg">
              <Link href="/contact?service=automation">
                Automate My Processes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Training Carousel */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-green-500 mr-2" />
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                Team Enablement
              </Badge>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
              Train Your Team
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              The best AI system in the world is useless if your team won't use it. We make sure they get it.
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <Image
                src={`/images/services/${trainingImages[currentTrainingSlide].image}`}
                alt={trainingImages[currentTrainingSlide].title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <motion.div
                  key={currentTrainingSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="font-bold text-white text-2xl mb-3">
                    {trainingImages[currentTrainingSlide].title}
                  </h3>
                  <p className="text-gray-200 text-lg">
                    {trainingImages[currentTrainingSlide].description}
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTrainingSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextTrainingSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center mt-6 space-x-2">
              {trainingImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTrainingSlide(index)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${
                    index === currentTrainingSlide
                      ? 'bg-green-500 w-8'
                      : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/contact?service=training">
                Schedule Training Session
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
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
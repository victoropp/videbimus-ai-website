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
import type { Service } from '@/types'

// Create badge component if it doesn't exist
const ServiceBadge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
    {children}
  </span>
)

const mainServices: Service[] = [
  {
    id: 'discovery',
    title: 'AI Discovery & Strategy',
    description: 'Comprehensive AI readiness assessment and strategic roadmap development to identify high-impact opportunities.',
    duration: '2-4 weeks',
    features: [
      'Current technology stack evaluation',
      'Data maturity assessment', 
      'Organizational capability review',
      'Gap analysis and recommendations',
      'Use case identification and prioritization',
      'Technology recommendations',
      'Implementation timeline',
      'ROI projections',
      'Proof of concept development',
      'Performance metrics evaluation'
    ],
    category: 'discovery'
  },
  {
    id: 'implementation',
    title: 'AI Implementation & Integration',
    description: 'Custom AI solution development with seamless system integration and comprehensive team enablement.',
    duration: '3-6 months',
    features: [
      'Machine learning model development',
      'Natural language processing solutions',
      'Computer vision applications',
      'Predictive analytics systems',
      'API development and integration',
      'Database optimization',
      'Cloud deployment',
      'Security implementation',
      'Technical training workshops',
      'Documentation and knowledge transfer'
    ],
    category: 'implementation'
  },
  {
    id: 'transformation',
    title: 'Enterprise AI Transformation',
    description: 'End-to-end AI platform development and establishment of AI Center of Excellence for enterprise-wide transformation.',
    duration: '6-18 months',
    features: [
      'Enterprise-wide AI strategy',
      'Multi-department integration',
      'Scalable infrastructure design',
      'Advanced analytics platforms',
      'Governance framework establishment',
      'Best practices documentation',
      'Team structure and hiring support',
      'Ongoing advisory services',
      'Model monitoring and retraining',
      'Performance optimization'
    ],
    category: 'transformation'
  }
]

const specializedServices = [
  {
    id: 'ml',
    icon: Brain,
    title: 'Machine Learning Solutions',
    description: 'Advanced ML models for predictive analytics, deep learning applications, and intelligent automation.',
    services: [
      { name: 'Predictive Analytics', description: 'Demand forecasting, risk assessment, maintenance prediction' },
      { name: 'Deep Learning Applications', description: 'Computer vision, NLP, speech recognition' },
      { name: 'Recommendation Systems', description: 'Personalization engines for e-commerce and content' }
    ]
  },
  {
    id: 'data-engineering',
    icon: BarChart3,
    title: 'Data Engineering & Analytics',
    description: 'Robust data infrastructure, business intelligence solutions, and comprehensive data governance.',
    services: [
      { name: 'Data Pipeline Development', description: 'ETL/ELT processes, real-time streaming, data warehousing' },
      { name: 'Business Intelligence', description: 'Interactive dashboards, self-service analytics, reporting' },
      { name: 'Data Quality & Governance', description: 'Quality frameworks, master data management, compliance' }
    ]
  },
  {
    id: 'automation',
    icon: Bot,
    title: 'AI Automation Services',
    description: 'Intelligent process automation, conversational AI, and smart decision systems.',
    services: [
      { name: 'Robotic Process Automation', description: 'Process automation, document processing, workflow optimization' },
      { name: 'Conversational AI', description: 'Custom chatbots, voice assistants, multi-language support' },
      { name: 'Decision Intelligence', description: 'Automated decisions, optimization algorithms, simulation' }
    ]
  },
  {
    id: 'training',
    icon: GraduationCap,
    title: 'Training & Education',
    description: 'Comprehensive training programs and custom curriculum development for AI literacy.',
    services: [
      { name: 'Corporate Training', description: 'Executive workshops, ML bootcamps, business-focused training' },
      { name: 'Custom Curriculum', description: 'Role-specific training, certification programs, learning platforms' },
      { name: 'Workshops & Seminars', description: 'Strategy sessions, ideation workshops, technology deep dives' }
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
              AI & Data Science Services
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200 mb-8">
              Comprehensive solutions designed to transform your organization at every stage of your AI journey. 
              From initial strategy to enterprise-wide implementation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-white/90">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>50+ Successful Implementations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>4.9/5 Client Satisfaction</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-cyan-400" />
                <span>Fortune 500 Trusted</span>
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
              Our Service Tiers
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Structured approaches designed for organizations at different stages of their AI journey
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
                          {service.features.slice(0, 6).map((feature, idx) => (
                            <div key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
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
              Specialized Services
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Industry-specific solutions and expert consulting across all aspects of AI and data science
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
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Schedule a free consultation to discuss your AI opportunities and get a custom proposal.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-gray-100">
                <Link href="/contact">
                  Schedule Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/case-studies">
                  View Case Studies
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Search, 
  Cog, 
  Building2, 
  ArrowRight,
  Brain,
  BarChart3,
  Bot,
  GraduationCap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const services = [
  {
    icon: Search,
    title: 'AI Discovery & Strategy',
    description: 'AI readiness assessment, strategic roadmap development, and proof of concept validation.',
    duration: '2-4 weeks',
    features: ['AI Readiness Assessment', 'Strategic Roadmap', 'POC Development', 'ROI Analysis'],
    href: '/services#discovery',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Cog,
    title: 'AI Implementation',
    description: 'Custom AI solution development, system integration, and team enablement.',
    duration: '3-6 months',
    features: ['Custom AI Solutions', 'System Integration', 'Team Training', 'Ongoing Support'],
    href: '/services#implementation',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Building2,
    title: 'Enterprise Transformation',
    description: 'End-to-end AI platform development and AI Center of Excellence establishment.',
    duration: '6-18 months',
    features: ['Enterprise AI Platform', 'Center of Excellence', 'Governance Framework', '24/7 Support'],
    href: '/services#transformation',
    color: 'from-green-500 to-emerald-500'
  }
]

const specializedServices = [
  {
    icon: Brain,
    title: 'Machine Learning',
    description: 'Predictive analytics, deep learning applications, and recommendation systems.',
    href: '/services#ml'
  },
  {
    icon: BarChart3,
    title: 'Data Engineering',
    description: 'Data pipeline development, business intelligence, and data quality frameworks.',
    href: '/services#data-engineering'
  },
  {
    icon: Bot,
    title: 'AI Automation',
    description: 'RPA, conversational AI, and intelligent decision systems.',
    href: '/services#automation'
  },
  {
    icon: GraduationCap,
    title: 'Training & Education',
    description: 'Corporate training programs, custom curriculum, and certification.',
    href: '/services#training'
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

export function ServicesOverview() {
  return (
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
            Our AI & Data Science Services
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Comprehensive solutions designed to transform your organization at every stage of your AI journey
          </p>
        </motion.div>

        {/* Main Service Tiers */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-3 mb-16"
        >
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div key={service.title} variants={itemVariants}>
                <Card className="relative h-full overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  
                  <CardHeader className="relative">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${service.color} text-white mb-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{service.duration}</span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Key Features:</span>
                      <ul className="space-y-1">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button asChild className="w-full group/btn">
                      <Link href={service.href}>
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Specialized Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Specialized Services
          </h3>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Industry-specific solutions and expert consulting across all aspects of AI and data science
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12"
        >
          {specializedServices.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div key={service.title} variants={itemVariants}>
                <Link href={service.href}>
                  <Card className="h-full text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mb-4 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-purple-500 group-hover:text-white transition-all">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{service.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{service.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <Button asChild size="lg" variant="glow">
            <Link href="/services">
              View All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
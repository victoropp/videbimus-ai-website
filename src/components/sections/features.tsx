'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  Zap, 
  Users, 
  TrendingUp, 
  Clock, 
  Award,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Zap,
    title: 'Rapid Implementation',
    description: 'Get your AI solutions up and running in weeks, not months. Our proven methodologies ensure fast time-to-value.',
    metrics: '6-8 weeks to MVP'
  },
  {
    icon: TrendingUp,
    title: 'Measurable ROI',
    description: 'Track real business impact with comprehensive analytics and KPI monitoring. Average 200%+ ROI within 18 months.',
    metrics: '200%+ Average ROI'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Industry best practices with bank-level encryption, GDPR compliance, and enterprise-grade security for maximum data protection.',
    metrics: '99.9% Uptime SLA'
  },
  {
    icon: Users,
    title: 'Expert Team',
    description: 'Work directly with AI architects, data scientists, and domain experts with proven track records.',
    metrics: '50+ Implementations'
  },
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock monitoring, support, and optimization to ensure your AI systems perform flawlessly.',
    metrics: '24/7 Monitoring'
  },
  {
    icon: Award,
    title: 'Industry Recognition',
    description: 'Trusted by Fortune 500 companies and recognized by leading industry analysts for excellence.',
    metrics: 'Fortune 500 Trusted'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

export function Features() {
  return (
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
            Why Choose Vidibemus AI?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            We combine cutting-edge AI technology with proven business expertise to deliver 
            transformational results for your organization
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  {/* Gradient background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-8 relative">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white group-hover:scale-110 transition-transform duration-300">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                          {feature.description}
                        </p>
                        <div className="flex items-center text-sm font-medium text-cyan-600 dark:text-cyan-400">
                          <span>{feature.metrics}</span>
                          <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom stats section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-gray-50 to-cyan-50/50 dark:from-gray-900 dark:to-cyan-950/20 border border-gray-200 dark:border-gray-800"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">99.9%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">20+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Enterprises Helped</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">200%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average ROI</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expert Support</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
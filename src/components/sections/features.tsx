'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
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
    title: 'You Need Results Yesterday, Not Next Year',
    description: 'Tired of "6-month implementations" that take 18? We ship working solutions quickly. See it, use it, benefit from it—fast.',
    metrics: 'Rapid Deployment',
    image: '/images/home/feature-fast-implementation.jpg',
    imageAlt: 'Rapid AI implementation and deployment timeline showing quick results'
  },
  {
    icon: TrendingUp,
    title: 'Know Exactly What You\'re Getting',
    description: 'No vague promises. We show you the numbers before we start: how much you\'ll save, when you\'ll break even, what ROI looks like.',
    metrics: '3x Return (Typical)',
    image: '/images/home/feature-roi.jpg',
    imageAlt: 'Clear ROI metrics and financial performance tracking for AI investments'
  },
  {
    icon: Shield,
    title: 'Your Data Isn\'t Going Anywhere',
    description: 'Worried about security? Good. So are we. Bank-level encryption, your servers if you want, zero data sharing. Period.',
    metrics: 'Zero Breaches Ever',
    image: '/images/home/feature-security.jpg',
    imageAlt: 'Enterprise-grade security and data protection measures'
  },
  {
    icon: Users,
    title: 'Talk to People Who Get It',
    description: 'No junior teams learning on your dime. You work with people who\'ve done this 50+ times and actually understand your business.',
    metrics: '50+ Projects Done',
    image: '/images/home/feature-expert-team.jpg',
    imageAlt: 'Experienced AI and data science team collaborating on solutions'
  },
  {
    icon: Award,
    title: 'Other Companies Trust Us. You Can Too.',
    description: 'We\'ve saved oil & gas operations millions, cut insurance claims time by 70%, and helped 20+ businesses like yours succeed.',
    metrics: '20+ Happy Clients',
    image: '/images/home/feature-proven-track-record.jpg',
    imageAlt: 'Success stories and proven results from satisfied clients'
  },
  {
    icon: Clock,
    title: 'We Don\'t Disappear After Launch',
    description: 'Something breaks at 2 AM? We\'re there. Need adjustments? We stick around. Think of us as part of your team.',
    metrics: 'Always Available',
    image: '/images/home/feature-support.jpg',
    imageAlt: '24/7 technical support and ongoing maintenance services'
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
            Why Work With Us Instead of Hiring or Building In-House?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Hiring a data science team costs $150K+ per person (good luck finding them). Building in-house takes forever and usually fails.
            We're the team you can't afford to hire full-time—but at a price you can afford.
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
                  {/* Feature image background */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 group-hover:from-cyan-500/20 group-hover:to-purple-500/20 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Icon on image */}
                    <div className="absolute top-4 left-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Metrics badge */}
                    <div className="absolute bottom-4 right-4">
                      <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold">
                        {feature.metrics}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 relative">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
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
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Proven</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Cost Reduction</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Real</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Fast</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Go Live</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">20+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Businesses Helped</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
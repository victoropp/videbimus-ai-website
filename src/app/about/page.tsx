'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Target, 
  Eye, 
  Heart, 
  Award, 
  Users, 
  TrendingUp, 
  Globe,
  ArrowRight,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Team } from '@/components/sections/team'

const stats = [
  { label: 'Real Projects Shipped', value: '50+', icon: Award },
  { label: 'Average Cost Saved', value: '$50K/mo', icon: TrendingUp },
  { label: 'Time to First Results', value: '6-8 Weeks', icon: Zap },
  { label: 'Team Experience', value: '50+ Years', icon: Users },
]

const values = [
  {
    icon: Zap,
    title: 'Fast Is Better Than Perfect',
    description: 'Working software in 6 weeks beats a "perfect plan" in 6 months. We ship fast, learn fast, improve fast. Your competitors aren\'t waiting.'
  },
  {
    icon: Heart,
    title: 'Your Money, Your Risk',
    description: 'If we can\'t show ROI in the first 90 days, we failed. Not you—us. We don\'t hide behind "long-term transformation" talk when results should be obvious.'
  },
  {
    icon: Lightbulb,
    title: 'Simple Beats Clever',
    description: 'The best solution is the one your team will actually use on Monday morning. We build practical tools, not impressive-sounding tech that gathers dust.'
  },
  {
    icon: Shield,
    title: 'Honest About What Works',
    description: 'AI isn\'t magic. Sometimes the answer is a spreadsheet macro, not a neural network. We\'ll tell you what you need, not what\'s trendy.'
  }
]

const timeline = [
  {
    year: '2023-2024',
    title: 'The Breaking Point',
    description: 'After years at big tech and consulting firms, watching millions wasted on AI projects that never shipped—we hit our limit. Companies deserved better than 18-month "transformations" that delivered PowerPoints.'
  },
  {
    year: 'Early 2025',
    title: 'Built Videbimus AI',
    description: 'Started with a simple idea: What if AI projects actually worked? What if they shipped in weeks and paid for themselves in months? We assembled a team who\'d seen enough waste to know exactly what NOT to do.'
  },
  {
    year: 'Now',
    title: 'Proving It Works',
    description: 'Shipping real solutions for real businesses. Oil & Gas companies reducing equipment failures. Insurance teams processing claims 60% faster. Manufacturing plants cutting waste by millions. No fluff—just results.'
  },
  {
    year: 'Next',
    title: 'Keep It Simple',
    description: 'We\'re not chasing unicorn status or building the next AI platform. We\'re here to help businesses stop bleeding money on manual processes. One practical solution at a time.'
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

export default function AboutPage() {
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
              We Got Tired of Watching Companies Waste Money
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200 mb-8">
              So we built Videbimus AI. After years at big tech companies and Fortune 500s, watching
              "AI projects" fail because they were too complex, too expensive, or took too long—we decided to do it differently.
              Fast implementations. Real results. No unnecessary complexity.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div key={stat.label} variants={itemVariants} className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white mb-4 mx-auto">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={itemVariants}>
              <Card className="p-8 h-full">
                <div className="flex items-center mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white mr-4">
                    <Target className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Our Mission</CardTitle>
                </div>
                <CardContent className="p-0">
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Stop the waste. We've seen too many companies burn millions on "AI transformation" projects
                    that never ship. Our mission? Get you results in weeks, not years. Whether you're in Oil & Gas
                    losing money on equipment failures, or Insurance drowning in manual claims—we build solutions
                    that actually work and pay for themselves.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-8 h-full">
                <div className="flex items-center mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white mr-4">
                    <Eye className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-2xl">Our Vision</CardTitle>
                </div>
                <CardContent className="p-0">
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Be the team companies call when they're done wasting time. When someone says "we need AI,"
                    we want them thinking "call Videbimus—they'll actually deliver." No flashy promises. No year-long
                    roadmaps. Just proven systems that save money, starting this quarter.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
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
              Our Values
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              The principles that guide everything we do and every decision we make
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value) => {
              const Icon = value.icon
              return (
                <motion.div key={value.title} variants={itemVariants}>
                  <Card className="h-full text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white mb-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
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
              How We Got Here
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              From watching the waste to fixing it—one practical solution at a time
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-cyan-500 to-purple-500"></div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-12"
            >
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  variants={itemVariants}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="p-6 hover:shadow-lg transition-all duration-300">
                      <div className="font-bold text-2xl text-cyan-600 dark:text-cyan-400 mb-2">
                        {item.year}
                      </div>
                      <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </Card>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full border-4 border-white dark:border-gray-950"></div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <Team />

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
              Tired of AI Projects That Go Nowhere?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Let's find the biggest money leak in your operations and show you exactly how to fix it.
              Free consultation. No sales pitch. Just honest assessment of what's possible.
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
                  See Real Results
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
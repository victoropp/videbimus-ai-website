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
  CheckCircle,
  Lightbulb,
  Shield,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Team } from '@/components/sections/team'

const stats = [
  { label: 'Combined Team Experience', value: '50+ Years', icon: Award },
  { label: 'AI Projects in Pipeline', value: '20+', icon: TrendingUp },
  { label: 'Countries Reached', value: '4', icon: Globe },
  { label: 'Expert Team Members', value: '8', icon: Users },
]

const values = [
  {
    icon: Lightbulb,
    title: 'Innovation First',
    description: 'We stay at the forefront of AI technology, continuously exploring new methodologies and tools to deliver cutting-edge solutions.'
  },
  {
    icon: Heart,
    title: 'Client Success',
    description: 'Our success is measured by your success. We partner closely with clients to ensure measurable business impact and ROI.'
  },
  {
    icon: Shield,
    title: 'Trust & Security',
    description: 'We maintain the highest standards of data security and privacy, with industry best practices and GDPR compliance.'
  },
  {
    icon: Zap,
    title: 'Speed & Agility',
    description: 'We believe in rapid prototyping and iterative development to deliver value quickly and adapt to changing requirements.'
  }
]

const timeline = [
  {
    year: 'Q1 2025',
    title: 'Founded Vidibemus AI',
    description: 'Assembled a team of senior AI experts with decades of combined experience in machine learning, data science, and enterprise solutions.'
  },
  {
    year: 'Q2 2025',
    title: 'First Client Engagements',
    description: 'Secured initial partnerships with forward-thinking businesses ready to leverage AI for competitive advantage.'
  },
  {
    year: 'Q3 2025',
    title: 'Rapid Growth',
    description: 'Expanded team with specialized experts in NLP, Computer Vision, and MLOps to meet growing demand.'
  },
  {
    year: 'Q4 2025',
    title: 'Global Expansion',
    description: 'Establishing presence across UK, Ghana, and expanding into European markets with 24/7 support capabilities.'
  },
  {
    year: '2026',
    title: 'Scale & Innovation',
    description: 'Building strategic partnerships and developing proprietary AI frameworks to accelerate client implementations.'
  },
  {
    year: '2027',
    title: 'Industry Leadership',
    description: 'Positioning as the go-to AI consulting partner for enterprises seeking transformational AI adoption.'
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
              About Vidibemus AI
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200 mb-8">
              Founded in 2025, we bring together decades of collective experience from leading tech companies,
              research institutions, and Fortune 500 enterprises to deliver cutting-edge AI solutions that drive real business value.
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
            {stats.map((stat, index) => {
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
                    To democratize artificial intelligence and make cutting-edge AI solutions accessible 
                    to businesses of all sizes. We believe every organization should have the opportunity 
                    to leverage AI for competitive advantage, operational efficiency, and innovation.
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
                    To be the world's most trusted AI consulting partner, known for delivering 
                    transformational business outcomes through ethical, responsible, and innovative 
                    AI implementations that create lasting value for our clients and society.
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
            {values.map((value, index) => {
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
              Our Journey
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Ambitious roadmap backed by experienced leadership and proven expertise
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
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Be among the first to leverage our team's decades of AI expertise for your business transformation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-gray-100">
                <Link href="/contact">
                  Start Your AI Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/case-studies">
                  See Success Stories
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
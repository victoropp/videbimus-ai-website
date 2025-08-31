'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp, DollarSign, Clock, Users, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CaseStudy } from '@/types'

const caseStudies: CaseStudy[] = [
  {
    id: 'techcorp-automation',
    title: 'Manufacturing Process Optimization',
    description: 'AI-powered predictive maintenance and quality control system that reduced downtime by 60% and improved product quality by 40%.',
    client: 'TechCorp Industries',
    industry: 'Manufacturing',
    image: '/case-studies/techcorp-automation.jpg',
    tags: ['Predictive Analytics', 'Computer Vision', 'IoT Integration'],
    results: [
      { metric: 'Downtime Reduction', value: '60%' },
      { metric: 'Quality Improvement', value: '40%' },
      { metric: 'Cost Savings', value: '$2.5M' },
      { metric: 'ROI', value: '280%' }
    ]
  },
  {
    id: 'financeflow-fraud',
    title: 'Advanced Fraud Detection System',
    description: 'Machine learning-powered fraud detection system that processes millions of transactions daily with 99.7% accuracy.',
    client: 'FinanceFlow',
    industry: 'Financial Services',
    image: '/case-studies/financeflow-fraud.jpg',
    tags: ['Machine Learning', 'Real-time Processing', 'Risk Assessment'],
    results: [
      { metric: 'False Positive Reduction', value: '65%' },
      { metric: 'Fraud Detection Rate', value: '99.7%' },
      { metric: 'Processing Speed', value: '<50ms' },
      { metric: 'Annual Savings', value: '$8.2M' }
    ]
  },
  {
    id: 'healthtech-diagnosis',
    title: 'AI-Assisted Medical Diagnosis',
    description: 'Deep learning system for medical imaging analysis that assists radiologists in early disease detection.',
    client: 'HealthTech Solutions',
    industry: 'Healthcare',
    image: '/case-studies/healthtech-diagnosis.jpg',
    tags: ['Deep Learning', 'Computer Vision', 'Medical AI'],
    results: [
      { metric: 'Diagnostic Accuracy', value: '95.8%' },
      { metric: 'Time Reduction', value: '50%' },
      { metric: 'Patient Outcomes', value: '25% Better' },
      { metric: 'Radiologist Efficiency', value: '3x Faster' }
    ]
  },
  {
    id: 'retailmax-personalization',
    title: 'E-commerce Personalization Engine',
    description: 'AI-driven recommendation system that delivers personalized shopping experiences and increases customer engagement.',
    client: 'RetailMax',
    industry: 'E-commerce',
    image: '/case-studies/retailmax-personalization.jpg',
    tags: ['Recommendation Systems', 'NLP', 'Customer Analytics'],
    results: [
      { metric: 'Conversion Rate', value: '+35%' },
      { metric: 'Customer LTV', value: '+50%' },
      { metric: 'Revenue Growth', value: '+28%' },
      { metric: 'User Engagement', value: '+45%' }
    ]
  },
  {
    id: 'logisticscorp-optimization',
    title: 'Supply Chain & Route Optimization',
    description: 'AI-powered logistics optimization platform that reduces delivery times and operational costs across global supply chains.',
    client: 'LogisticsCorp',
    industry: 'Logistics',
    image: '/case-studies/logisticscorp-optimization.jpg',
    tags: ['Optimization Algorithms', 'Route Planning', 'Supply Chain AI'],
    results: [
      { metric: 'Delivery Time', value: '-25%' },
      { metric: 'Fuel Savings', value: '30%' },
      { metric: 'Cost Reduction', value: '$5.1M' },
      { metric: 'Customer Satisfaction', value: '92%' }
    ]
  },
  {
    id: 'energycorp-prediction',
    title: 'Smart Grid Energy Forecasting',
    description: 'Machine learning models for energy demand prediction and grid optimization, enabling renewable energy integration.',
    client: 'EnergyCorp',
    industry: 'Energy',
    image: '/case-studies/energycorp-prediction.jpg',
    tags: ['Time Series Forecasting', 'IoT Data', 'Green Energy'],
    results: [
      { metric: 'Prediction Accuracy', value: '96.5%' },
      { metric: 'Energy Waste', value: '-22%' },
      { metric: 'Renewable Integration', value: '+40%' },
      { metric: 'Grid Efficiency', value: '+18%' }
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

export default function CaseStudiesPage() {
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
              Success Stories
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200 mb-8">
              Discover how organizations across industries have transformed their operations and achieved 
              remarkable results with our AI solutions.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-white/90">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>4.9/5 Client Satisfaction</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span>200%+ Average ROI</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-cyan-400" />
                <span>50+ Success Stories</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {caseStudies.map((study, index) => (
              <motion.div key={study.id} variants={itemVariants}>
                <Card className="h-full group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/20 dark:to-purple-900/20 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-6xl font-bold text-cyan-500/20">
                        {study.client.split(' ')[0][0]}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded-full text-xs font-medium text-gray-900 dark:text-white">
                        {study.industry}
                      </div>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {study.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="line-clamp-3">
                      {study.description}
                    </CardDescription>
                    <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400 mt-2">
                      {study.client}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {study.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Results */}
                    <div className="grid grid-cols-2 gap-3">
                      {study.results.slice(0, 4).map((result, idx) => (
                        <div key={idx} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="font-bold text-lg text-gray-900 dark:text-white">
                            {result.value}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {result.metric}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button asChild variant="outline" className="w-full group/btn">
                      <Link href={`/case-studies/${study.id}`}>
                        View Full Case Study
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
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
              Our Track Record
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Numbers that speak for themselves - the measurable impact we've delivered
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-r from-gray-50 to-cyan-50/50 dark:from-gray-900 dark:to-cyan-950/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-800"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">$50M+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost Savings</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">99.7%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Accuracy</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">280%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average ROI</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">6 months</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Average Payback</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Industries Section */}
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
              Industries We Serve
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Delivering AI solutions across diverse sectors with industry-specific expertise
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
          >
            {['Manufacturing', 'Financial Services', 'Healthcare', 'E-commerce', 'Logistics', 'Energy', 'Retail', 'Technology', 'Insurance', 'Automotive'].map((industry, index) => (
              <motion.div key={industry} variants={itemVariants}>
                <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                      {industry[0]}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {industry}
                    </h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Join these industry leaders and transform your business with AI. 
              Schedule a consultation to discuss your opportunities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-gray-100">
                <Link href="/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/services">
                  Explore Our Services
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
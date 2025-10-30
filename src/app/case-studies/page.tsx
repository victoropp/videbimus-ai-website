'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp, DollarSign, Clock, Users, Star } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { CaseStudy } from '@/types'

const caseStudies: CaseStudy[] = [
  {
    id: 'petroverse-oil-gas',
    title: 'Oil & Gas: Stop $200K Equipment Failures',
    description: 'Equipment kept failing with zero warning. Every failure cost $200K+ in downtime and repairs. Maintenance teams were flying blind—reacting to breakdowns instead of preventing them. We built a system that predicts failures 2 weeks before they happen.',
    client: 'Petroverse',
    industry: 'Oil & Gas',
    image: '/case-studies/petroverse-oil-gas.jpg',
    tags: ['Predictive Maintenance', 'Saved $2.5M First Year', 'Live in 7 Weeks'],
    results: [
      { metric: 'Equipment Failures Cut', value: '45%' },
      { metric: 'Early Warning Time', value: '2 Weeks' },
      { metric: 'First Year Savings', value: '$2.5M' },
      { metric: 'False Alarms', value: '<5%' }
    ]
  },
  {
    id: 'insure360-insurance',
    title: 'Insurance: Process Claims 60% Faster',
    description: 'Claims were taking 7-10 days because adjusters spent hours manually extracting data from PDFs and photos. Fraud was slipping through. Customers were furious. We automated the document processing and built fraud detection that actually works—claims now take 2-3 days.',
    client: 'INSURE360',
    industry: 'Insurance',
    image: '/case-studies/insure360-insurance.jpg',
    tags: ['Claims Automation', 'Fraud Detection', 'Cut Processing 60%'],
    results: [
      { metric: 'Processing Time', value: '2-3 Days' },
      { metric: 'Fraud Caught', value: '98.5%' },
      { metric: 'Labor Cost Saved', value: '50%' },
      { metric: 'Customer Complaints', value: '-70%' }
    ]
  },
  {
    id: 'techcorp-automation',
    title: 'Manufacturing: Cut Production Waste 30%',
    description: 'Quality issues weren\'t caught until products shipped—costing millions in returns and warranty claims. Production scheduling was guesswork. We built computer vision QC and predictive scheduling. Defects caught in real-time, production optimized automatically.',
    client: 'TechCorp Industries',
    industry: 'Manufacturing',
    image: '/case-studies/techcorp-automation.jpg',
    tags: ['Quality Control', 'Saved $2.5M/Year', 'Defect Detection'],
    results: [
      { metric: 'Product Defects', value: '-40%' },
      { metric: 'Material Waste', value: '-30%' },
      { metric: 'Annual Savings', value: '$2.5M' },
      { metric: 'Payback Period', value: '4 Months' }
    ]
  },
  {
    id: 'financeflow-fraud',
    title: 'FinTech: Stop $8M in Annual Fraud',
    description: 'Fraud detection was catching fraud but drowning legitimate transactions in false alarms—customers were furious. Manual review couldn\'t keep up. We built ML models that learn what "normal" looks like for each customer. Fraud caught faster, false alarms down 65%.',
    client: 'FinanceFlow',
    industry: 'Financial Services',
    image: '/case-studies/financeflow-fraud.jpg',
    tags: ['Fraud Detection', 'Real-time', 'Saved $8.2M'],
    results: [
      { metric: 'False Alarms Cut', value: '65%' },
      { metric: 'Fraud Caught', value: '99.7%' },
      { metric: 'Decision Time', value: '<50ms' },
      { metric: 'Annual Savings', value: '$8.2M' }
    ]
  },
  {
    id: 'healthtech-diagnosis',
    title: 'Healthcare: Help Radiologists See More Patients',
    description: 'Radiologists were backlogged 3-4 weeks analyzing scans. Patients waited in limbo. We built AI that pre-analyzes scans and flags areas of concern. Radiologists review faster, catch more issues early, patients get answers sooner.',
    client: 'HealthTech Solutions',
    industry: 'Healthcare',
    image: '/case-studies/healthtech-diagnosis.jpg',
    tags: ['Medical Imaging', 'Computer Vision', '3x Faster'],
    results: [
      { metric: 'Analysis Speed', value: '3x Faster' },
      { metric: 'Accuracy Rate', value: '95.8%' },
      { metric: 'Patient Wait Time', value: '-50%' },
      { metric: 'Early Detection', value: '+25%' }
    ]
  },
  {
    id: 'retailmax-personalization',
    title: 'E-commerce: Increase Revenue 28% Same Traffic',
    description: 'Generic product recommendations were converting <2%. Customers couldn\'t find what they wanted and left. We built personalization that learns from behavior—not just demographics. Right products shown to right people. Conversion jumped 35%, revenue up 28% with same traffic.',
    client: 'RetailMax',
    industry: 'E-commerce',
    image: '/case-studies/retailmax-personalization.jpg',
    tags: ['Personalization', '+28% Revenue', 'Recommendations'],
    results: [
      { metric: 'Conversion Rate', value: '+35%' },
      { metric: 'Revenue (Same Traffic)', value: '+28%' },
      { metric: 'Avg Order Value', value: '+22%' },
      { metric: 'Customer Lifetime Value', value: '+50%' }
    ]
  },
  {
    id: 'logisticscorp-optimization',
    title: 'Logistics: Save $5M on Fuel and Routes',
    description: 'Routes were planned manually using "gut feel" and outdated maps. Trucks drove 20-30% more miles than needed. Deliveries late. Fuel costs insane. We built route optimization that factors in real-time traffic, weather, delivery windows. Saved $5.1M first year.',
    client: 'LogisticsCorp',
    industry: 'Logistics',
    image: '/case-studies/logisticscorp-optimization.jpg',
    tags: ['Route Optimization', 'Saved $5.1M', 'Real-time'],
    results: [
      { metric: 'Miles Driven', value: '-25%' },
      { metric: 'Fuel Costs', value: '-30%' },
      { metric: 'First Year Savings', value: '$5.1M' },
      { metric: 'On-Time Delivery', value: '92%' }
    ]
  },
  {
    id: 'energycorp-prediction',
    title: 'Energy: Cut Grid Waste 22% with Forecasting',
    description: 'Energy demand forecasting was consistently wrong by 15-20%—leading to massive waste or brownouts. Renewables were unpredictable. We built ML forecasting that learns seasonal patterns and weather impacts. Prediction accuracy 96.5%, waste down 22%.',
    client: 'EnergyCorp',
    industry: 'Energy',
    image: '/case-studies/energycorp-prediction.jpg',
    tags: ['Demand Forecasting', '96.5% Accuracy', 'Green Energy'],
    results: [
      { metric: 'Forecast Accuracy', value: '96.5%' },
      { metric: 'Energy Waste', value: '-22%' },
      { metric: 'Renewable Usage', value: '+40%' },
      { metric: 'Grid Stability', value: '+18%' }
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
              From "We're Losing Money" to "How'd We Do That?"
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200 mb-8">
              Real companies. Real problems. Real solutions that actually shipped and paid for themselves.
              No fluff—just the before, the solution, and what it cost them vs. what they saved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-white/90">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <span>$50M+ Total Savings (Real Money)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                <span>6-8 Weeks Avg Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
                <span>ROI in First 90 Days</span>
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
                        {typeof study.client === 'string' 
                          ? study.client.split(' ')[0][0] 
                          : study.client.name.split(' ')[0][0]}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded-full text-xs font-medium text-gray-900 dark:text-white">
                        {typeof study.industry === 'string' ? study.industry : study.industry.name}
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
                      {typeof study.client === 'string' ? study.client : study.client.name}
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
              Got a Similar Problem?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Equipment failures? Manual processes? Claims backlog? We've probably fixed your exact problem before.
              30-minute call to see if we can help—and what it would actually cost you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-gray-100">
                <Link href="/contact">
                  Let's Talk About Your Problem
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/services">
                  See Our Solutions
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
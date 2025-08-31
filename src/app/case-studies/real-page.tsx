'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp, DollarSign, Clock, Users, Star, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api } from '@/lib/trpc/client'
import { useState, useEffect, useMemo } from 'react'
import type { CaseStudyEntry } from '@prisma/client'

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

interface CaseStudyWithResults extends CaseStudyEntry {
  results: Array<{ metric: string; value: string }>
}

export default function CaseStudiesRealPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [caseStudies, setCaseStudies] = useState<CaseStudyWithResults[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch case studies
  const { data, isLoading: trpcLoading, error } = api.caseStudies.list.useQuery({
    status: 'PUBLISHED',
    limit: 50,
  })

  // Fetch industries and tags
  const { data: industries = [] } = api.caseStudies.getIndustries.useQuery()
  const { data: availableTags = [] } = api.caseStudies.getTags.useQuery()
  const { data: stats } = api.caseStudies.getStats.useQuery()

  useEffect(() => {
    if (data) {
      // Parse JSON results if they exist
      const parsedCaseStudies = data.caseStudies.map(cs => ({
        ...cs,
        results: Array.isArray(cs.results) ? cs.results as Array<{ metric: string; value: string }> : []
      }))
      setCaseStudies(parsedCaseStudies)
      setIsLoading(false)
    }
  }, [data])

  // Fallback case studies
  const fallbackCaseStudies: CaseStudyWithResults[] = [
    {
      id: 'techcorp-automation',
      title: 'Manufacturing Process Optimization',
      description: 'AI-powered predictive maintenance and quality control system that reduced downtime by 60% and improved product quality by 40%.',
      client: 'TechCorp Industries',
      industry: 'Manufacturing',
      image: '/case-studies/techcorp-automation.jpg',
      slug: 'techcorp-automation',
      tags: ['Predictive Analytics', 'Computer Vision', 'IoT Integration'],
      results: [
        { metric: 'Downtime Reduction', value: '60%' },
        { metric: 'Quality Improvement', value: '40%' },
        { metric: 'Cost Savings', value: '$2.5M' },
        { metric: 'ROI', value: '280%' }
      ],
      content: null,
      status: 'PUBLISHED' as const,
      featured: true,
      sortOrder: 0,
      seoTitle: null,
      seoDescription: null,
      publishedAt: new Date(),
      authorId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'financeflow-fraud',
      title: 'Advanced Fraud Detection System',
      description: 'Machine learning-powered fraud detection system that processes millions of transactions daily with 99.7% accuracy.',
      client: 'FinanceFlow',
      industry: 'Financial Services',
      image: '/case-studies/financeflow-fraud.jpg',
      slug: 'financeflow-fraud',
      tags: ['Machine Learning', 'Real-time Processing', 'Risk Assessment'],
      results: [
        { metric: 'False Positive Reduction', value: '65%' },
        { metric: 'Fraud Detection Rate', value: '99.7%' },
        { metric: 'Processing Speed', value: '<50ms' },
        { metric: 'Annual Savings', value: '$8.2M' }
      ],
      content: null,
      status: 'PUBLISHED' as const,
      featured: true,
      sortOrder: 1,
      seoTitle: null,
      seoDescription: null,
      publishedAt: new Date(),
      authorId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'healthtech-diagnosis',
      title: 'AI-Assisted Medical Diagnosis',
      description: 'Deep learning system for medical imaging analysis that assists radiologists in early disease detection.',
      client: 'HealthTech Solutions',
      industry: 'Healthcare',
      image: '/case-studies/healthtech-diagnosis.jpg',
      slug: 'healthtech-diagnosis',
      tags: ['Deep Learning', 'Computer Vision', 'Medical AI'],
      results: [
        { metric: 'Diagnostic Accuracy', value: '95.8%' },
        { metric: 'Time Reduction', value: '50%' },
        { metric: 'Patient Outcomes', value: '25% Better' },
        { metric: 'Radiologist Efficiency', value: '3x Faster' }
      ],
      content: null,
      status: 'PUBLISHED' as const,
      featured: false,
      sortOrder: 2,
      seoTitle: null,
      seoDescription: null,
      publishedAt: new Date(),
      authorId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]

  const displayCaseStudies = caseStudies.length > 0 ? caseStudies : fallbackCaseStudies
  const displayIndustries = industries.length > 0 ? industries : [...new Set(fallbackCaseStudies.map(cs => cs.industry))]
  const displayTags = availableTags.length > 0 ? availableTags : [...new Set(fallbackCaseStudies.flatMap(cs => cs.tags))]

  // Filter case studies based on search and filters
  const filteredCaseStudies = useMemo(() => {
    return displayCaseStudies.filter(study => {
      const matchesSearch = searchQuery === '' || 
        study.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        study.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesIndustry = selectedIndustry === 'all' || study.industry === selectedIndustry

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => study.tags.includes(tag))

      return matchesSearch && matchesIndustry && matchesTags
    })
  }, [displayCaseStudies, searchQuery, selectedIndustry, selectedTags])

  if (error && caseStudies.length === 0) {
    console.warn('Failed to load case studies from database, using fallback data:', error.message)
  }

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
                <span>{stats?.published || 50}+ Success Stories</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search case studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Industry Filter */}
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {displayIndustries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2">
              {displayTags.slice(0, 5).map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    )
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(selectedIndustry !== 'all' || selectedTags.length > 0 || searchQuery) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              
              {searchQuery && (
                <Badge variant="secondary">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {selectedIndustry !== 'all' && (
                <Badge variant="secondary">
                  Industry: {selectedIndustry}
                  <button
                    onClick={() => setSelectedIndustry('all')}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    onClick={() => setSelectedTags(prev => prev.filter(t => t !== tag))}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedIndustry('all')
                  setSelectedTags([])
                }}
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <div className="mb-8">
            <p className="text-gray-600 dark:text-gray-400">
              Showing {filteredCaseStudies.length} of {displayCaseStudies.length} case studies
            </p>
          </div>

          {isLoading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading case studies...</p>
            </div>
          )}

          {!isLoading && filteredCaseStudies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No case studies found matching your criteria.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedIndustry('all')
                  setSelectedTags([])
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            </div>
          )}

          {!isLoading && filteredCaseStudies.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredCaseStudies.map((study, index) => (
                <motion.div key={study.id} variants={itemVariants}>
                  <Card className="h-full group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                    {/* Image placeholder */}
                    <div className="h-48 bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/20 dark:to-purple-900/20 relative overflow-hidden">
                      {study.image ? (
                        <img 
                          src={study.image} 
                          alt={study.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to gradient with client initial
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-6xl font-bold text-cyan-500/20">
                            {study.client.split(' ')[0][0]}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <div className="bg-white/90 dark:bg-gray-900/90 px-2 py-1 rounded-full text-xs font-medium text-gray-900 dark:text-white">
                          {study.industry}
                        </div>
                      </div>
                      {study.featured && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-yellow-500 text-white">Featured</Badge>
                        </div>
                      )}
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
                        {study.tags.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            +{study.tags.length - 3} more
                          </span>
                        )}
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
                        <Link href={`/case-studies/${study.slug}`}>
                          View Full Case Study
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
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

      {/* Admin notice */}
      {process.env.NODE_ENV === 'development' && caseStudies.length === 0 && (
        <div className="fixed bottom-4 right-4 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg shadow-lg max-w-sm">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">
            <strong>Dev Notice:</strong> No case studies found in database. Using fallback data. 
            Add case studies via the admin panel to see real data.
          </p>
        </div>
      )}
    </div>
  )
}
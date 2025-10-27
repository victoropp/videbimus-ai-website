'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, HelpCircle, FileText, BookOpen, CheckCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QADemo } from '@/components/ai/demos/qa-demo'

export default function QADemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/ai" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to AI Demos
            </Link>
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                <HelpCircle className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-4xl font-bold text-white mb-3">
                  Document Q&A AI
                </h1>
                <p className="text-xl text-gray-200 mb-4">
                  Ask questions about your documents and get instant AI-powered answers with source highlighting
                </p>
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span>Document Upload</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-green-400" />
                    <span>Context Extraction</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-purple-400" />
                    <span>Source Highlighting</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <QADemo />
          </motion.div>
        </div>
      </section>

      {/* Features & Use Cases */}
      <section className="py-16 bg-white dark:bg-gray-900/50">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-2 gap-12"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Key Features
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Contextual Understanding
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      AI understands document context to provide accurate, relevant answers
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Source Highlighting
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      See exactly where in the document the answer comes from
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Multiple Questions
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Ask unlimited questions about the same document
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Confidence Scoring
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get confidence scores for each answer to gauge reliability
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Business Use Cases
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Contract Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Quickly extract key terms, dates, and obligations from legal contracts
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Technical Documentation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Help teams find answers in product manuals and technical specs
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Research Papers
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Extract specific findings and data points from academic papers
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Customer Support
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Enable support teams to quickly find answers in knowledge bases
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Industry Applications */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Industry Applications
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Document Q&A is transforming how organizations handle information across industries
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Legal Services</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Lawyers use Q&A to quickly review contracts, case files, and legal precedents,
                reducing research time by 70%.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Healthcare</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Medical professionals extract patient information and treatment protocols from
                medical records instantly.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Financial Services</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Analysts quickly find specific data points in financial reports, compliance docs,
                and regulatory filings.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        <div className="container relative text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Transform How Your Team Works with Documents
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Deploy enterprise-grade document Q&A across your organization. Support multiple formats,
              languages, and integrate with your existing systems.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-gray-100">
                <Link href="/contact">
                  Request Enterprise Demo
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/ai">
                  View All Demos
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

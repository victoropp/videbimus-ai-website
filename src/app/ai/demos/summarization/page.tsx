'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, FileText, Sparkles, Copy, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SummarizationDemo } from '@/components/ai/demos/summarization-demo'

export default function SummarizationDemoPage() {
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
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                <FileText className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-4xl font-bold text-white mb-3">
                  AI Text Summarization
                </h1>
                <p className="text-xl text-gray-200 mb-4">
                  Transform long documents into concise, actionable summaries with advanced AI
                </p>
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span>Powered by Claude AI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-green-400" />
                    <span>Instant Results</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-purple-400" />
                    <span>Multiple Formats</span>
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
            <SummarizationDemo />
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
                      Intelligent Summarization
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      AI extracts key points while maintaining context and meaning
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Customizable Length
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Choose from short, medium, or long summaries based on your needs
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Multiple Formats
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get summaries as bullet points, paragraphs, or executive summaries
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Copy to Clipboard
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Instantly copy summaries for use in reports and presentations
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
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Meeting Minutes
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Quickly summarize long meeting transcripts into actionable points
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Research Papers
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Extract key findings from lengthy academic or technical documents
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Customer Feedback
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Condense customer reviews and feedback into insights
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Legal Documents
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Simplify complex contracts and legal documents for quick review
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
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
              Want This for Your Business?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              We can integrate custom AI summarization into your workflows, saving your team hours every day.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-gray-100">
                <Link href="/contact">
                  Request Custom Solution
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/ai">
                  Try More Demos
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

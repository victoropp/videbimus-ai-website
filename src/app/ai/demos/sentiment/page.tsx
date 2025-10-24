'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Heart, BarChart3, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SentimentDemo } from '@/components/ai/demos/sentiment-demo'

export default function SentimentDemoPage() {
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
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white flex-shrink-0">
                <Heart className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="font-display text-4xl font-bold text-white mb-3">
                  AI Sentiment Analysis
                </h1>
                <p className="text-xl text-gray-200 mb-4">
                  Understand customer emotions and sentiment with AI-powered text analysis
                </p>
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <span>Emotion Detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-green-400" />
                    <span>Confidence Scores</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span>Visual Analytics</span>
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
            <SentimentDemo />
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
                      Multi-Level Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Detect positive, negative, and neutral sentiment with high accuracy
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Emotion Recognition
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Identify specific emotions like joy, anger, sadness, fear, and surprise
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Confidence Scores
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Get precise confidence percentages for each sentiment classification
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Batch Processing
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Analyze multiple texts at once for trend analysis
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
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Customer Feedback Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Monitor customer satisfaction across reviews, surveys, and support tickets
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Social Media Monitoring
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Track brand sentiment across social platforms in real-time
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Product Review Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Understand customer opinions and identify areas for improvement
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white flex-shrink-0">
                    <span className="text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Employee Feedback
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Analyze employee surveys to gauge morale and engagement
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Real-World Impact */}
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
              Real-World Impact
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              See how businesses use sentiment analysis to drive better outcomes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">85%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Faster feedback processing</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">92%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy in classification</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">60%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Improvement in response time</div>
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
              Ready to Understand Your Customers Better?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Implement real-time sentiment analysis in your customer feedback systems and support channels.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-gray-100">
                <Link href="/contact">
                  Get Custom Solution
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/ai">
                  Explore More Demos
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

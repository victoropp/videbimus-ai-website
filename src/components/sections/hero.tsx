'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play, Sparkles, Zap, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'

const floatingIcons = [
  { icon: Sparkles, delay: 0, x: 20, y: -20, duration: 4 },
  { icon: Zap, delay: 1, x: -30, y: 20, duration: 5 },
  { icon: Brain, delay: 2, x: 40, y: -10, duration: 6 },
]

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-cyan-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950/10">
      {/* Animated background elements */}
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 grid-bg opacity-50" />
      
      {/* Floating icons */}
      {floatingIcons.map(({ icon: Icon, delay, x, y, duration }, index) => (
        <motion.div
          key={index}
          className="absolute text-cyan-500/20 dark:text-cyan-400/10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1],
            x: [0, x, 0],
            y: [0, y, 0],
          }}
          transition={{
            duration,
            repeat: Infinity,
            delay,
            ease: 'easeInOut',
          }}
          style={{
            left: `${20 + index * 20}%`,
            top: `${30 + index * 15}%`,
          }}
        >
          <Icon size={48} />
        </motion.div>
      ))}

      <div className="container relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-cyan-500/20 dark:border-cyan-400/20">
              <Sparkles className="mr-2 h-4 w-4 text-cyan-500" />
              Transforming Business with AI & Data Science
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl mb-6"
          >
            Unlock the Power of{' '}
            <span className="text-gradient animate-pulse">
              Artificial Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl mb-10"
          >
            We help organizations transform through intelligent automation, predictive analytics, 
            and data-driven decision making. From AI strategy to implementation.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Button
              asChild
              size="lg"
              className="group relative overflow-hidden"
            >
              <Link href="/contact">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="group"
            >
              <Link href="/case-studies">
                <Play className="mr-2 h-5 w-5" />
                View Case Studies
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">200%+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average ROI</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">AI Implementations</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Enterprise Support</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-gray-500 dark:text-gray-400"
        >
          <span className="text-sm mb-2">Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600" />
        </motion.div>
      </motion.div>
    </section>
  )
}
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
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

      {/* Hero background image with overlay */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <Image
          src="/images/home/hero-data-analyst.jpg"
          alt="Advanced data analytics dashboard showcasing business intelligence and AI-powered insights"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-cyan-50/70 dark:from-gray-950/95 dark:via-gray-900/90 dark:to-cyan-950/85" />
      </div>
      
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
              Your Data Is Already Costing You Money. We Turn It Into Profit.
            </div>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl mb-6"
          >
            Stop Drowning in Data.{' '}
            <span className="text-gradient animate-pulse">
              Start Making Better Decisions.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mx-auto max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl mb-10"
          >
            Your team is burning hours on manual tasks while competitors move faster.
            We help SMBs and growing companies cut operational costs by 45%, automate repetitive work,
            and actually use the mountains of data you're sitting on—without the complexity or 6-figure price tag.
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
                Show Me How (Free Consultation)
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
                See Real Results
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
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">45%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Cost Reduction (First 90 Days)</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">6-8 Weeks</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">To First Working Solution</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">$50K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Saved Per Month (Typical Client)</div>
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
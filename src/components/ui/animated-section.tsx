'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  initial?: any
  animate?: any
  whileInView?: any
  viewport?: any
  transition?: any
  variants?: any
}

export function AnimatedSection({
  children,
  className,
  initial = { opacity: 0, y: 20 },
  animate = { opacity: 1, y: 0 },
  whileInView,
  viewport = { once: true },
  transition = { duration: 0.6 },
  variants,
  ...props
}: AnimatedSectionProps) {
  if (variants) {
    return (
      <motion.div
        className={className}
        variants={variants}
        initial="hidden"
        whileInView={whileInView || "visible"}
        viewport={viewport}
        transition={transition}
        {...props}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      animate={animate}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedDiv({ children, className, ...motionProps }: any) {
  return (
    <motion.div className={className} {...motionProps}>
      {children}
    </motion.div>
  )
}
'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          className="inline-block w-12 h-12 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-600 dark:border-t-cyan-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4"
        >
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Loading...
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Please wait while we prepare your content
          </p>
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="mt-6 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full max-w-xs mx-auto"
        />
      </div>
    </div>
  )
}
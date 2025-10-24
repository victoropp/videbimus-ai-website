'use client'

import { useEffect } from 'react'
import { initializePerformanceMonitoring } from '@/lib/web-vitals'

/**
 * Performance Monitor Component
 * Initializes performance monitoring on the client side
 */

export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    initializePerformanceMonitoring()
  }, [])

  return null
}

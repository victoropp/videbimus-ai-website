/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and sends to analytics
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, type Metric } from 'web-vitals'

const vitalsUrl = '/api/analytics/vitals'

function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id
    })
  }

  // Send to analytics endpoint
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  })

  // Use sendBeacon if available for better reliability
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, body)
  } else {
    fetch(vitalsUrl, {
      body,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      keepalive: true
    }).catch(console.error)
  }
}

export function reportWebVitals() {
  try {
    getCLS(sendToAnalytics)
    getFID(sendToAnalytics)
    getFCP(sendToAnalytics)
    getLCP(sendToAnalytics)
    getTTFB(sendToAnalytics)
  } catch (err) {
    console.error('Error reporting web vitals:', err)
  }
}

// Performance observer for custom metrics
export function observePerformance() {
  if (typeof window === 'undefined') return

  // Observe long tasks (> 50ms)
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('Long Task detected:', {
              duration: entry.duration,
              startTime: entry.startTime,
              name: entry.name
            })
          }
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      // Long task API not supported
    }

    // Observe layout shifts
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if ((entry as any).value > 0.1) {
            console.warn('Significant Layout Shift:', {
              value: (entry as any).value,
              sources: (entry as any).sources
            })
          }
        }
      })
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (e) {
      // Layout shift API not supported
    }

    // Observe resource timing
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming
          if (resource.duration > 1000) {
            console.warn('Slow Resource:', {
              name: resource.name,
              duration: resource.duration,
              size: resource.transferSize
            })
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (e) {
      // Resource timing API not supported
    }
  }
}

// Bundle size tracking
export function trackBundleSize() {
  if (typeof window === 'undefined') return

  const performance = window.performance

  if (performance && performance.getEntriesByType) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

    let totalJS = 0
    let totalCSS = 0
    let totalImages = 0

    resources.forEach((resource) => {
      const size = resource.transferSize || 0

      if (resource.name.endsWith('.js')) {
        totalJS += size
      } else if (resource.name.endsWith('.css')) {
        totalCSS += size
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        totalImages += size
      }
    })

    console.log('Bundle Sizes:', {
      js: `${(totalJS / 1024).toFixed(2)} KB`,
      css: `${(totalCSS / 1024).toFixed(2)} KB`,
      images: `${(totalImages / 1024).toFixed(2)} KB`,
      total: `${((totalJS + totalCSS + totalImages) / 1024).toFixed(2)} KB`
    })
  }
}

// Memory usage tracking (if available)
export function trackMemoryUsage() {
  if (typeof window === 'undefined') return

  const performance = window.performance as any

  if (performance.memory) {
    const memory = performance.memory
    console.log('Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
    })
  }
}

// Initialize all monitoring
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return

  // Report web vitals
  reportWebVitals()

  // Observe performance
  observePerformance()

  // Track bundle size on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      trackBundleSize()
      trackMemoryUsage()
    }, 2000)
  })
}

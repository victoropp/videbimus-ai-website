/**
 * State-of-the-art Error Reporting API
 * Handles client-side error reporting with comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'

// Error report schema
const ErrorReportSchema = z.object({
  errorId: z.string().min(1),
  message: z.string().min(1),
  stack: z.string().optional(),
  componentStack: z.string().optional(),
  timestamp: z.string().datetime(),
  userAgent: z.string().optional(),
  url: z.string().url().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  buildId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

type ErrorReport = z.infer<typeof ErrorReportSchema>

// Rate limiting for error reports (prevent spam)
const errorReportLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 error reports per minute per IP
  message: 'Too many error reports, please try again later',
})

// Enhanced error categorization
const categorizeError = (error: ErrorReport): string => {
  const { message, stack, componentStack } = error
  const lowerMessage = message.toLowerCase()
  const lowerStack = stack?.toLowerCase() || ''
  
  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'network'
  }
  
  // Authentication errors
  if (lowerMessage.includes('unauthorized') || lowerMessage.includes('auth')) {
    return 'authentication'
  }
  
  // Permission errors
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
    return 'authorization'
  }
  
  // API errors
  if (lowerMessage.includes('api') || lowerStack.includes('/api/')) {
    return 'api'
  }
  
  // Database errors
  if (lowerMessage.includes('database') || lowerMessage.includes('prisma')) {
    return 'database'
  }
  
  // React/Component errors
  if (componentStack || lowerStack.includes('react')) {
    return 'component'
  }
  
  // JavaScript runtime errors
  if (lowerMessage.includes('reference') || lowerMessage.includes('undefined')) {
    return 'runtime'
  }
  
  // Type errors
  if (lowerMessage.includes('type') || lowerMessage.includes('property')) {
    return 'type'
  }
  
  return 'unknown'
}

// Determine error severity
const determineErrorSeverity = (error: ErrorReport): 'low' | 'medium' | 'high' | 'critical' => {
  const { message, url, stack } = error
  const lowerMessage = message.toLowerCase()
  const isProductionUrl = url?.includes('videbimus.ai') || process.env.NODE_ENV === 'production'
  
  // Critical errors
  if (
    lowerMessage.includes('payment') ||
    lowerMessage.includes('security') ||
    lowerMessage.includes('auth') ||
    lowerMessage.includes('data loss')
  ) {
    return 'critical'
  }
  
  // High severity errors
  if (
    isProductionUrl ||
    lowerMessage.includes('server') ||
    lowerMessage.includes('database') ||
    lowerMessage.includes('api')
  ) {
    return 'high'
  }
  
  // Medium severity errors
  if (
    lowerMessage.includes('component') ||
    lowerMessage.includes('render') ||
    stack?.includes('Error boundary')
  ) {
    return 'medium'
  }
  
  return 'low'
}

// Store error in database (if available)
const storeError = async (error: ErrorReport & { category: string; severity: string }) => {
  try {
    // In a real implementation, you would store this in your database
    // For now, we'll just log it with structured format
    console.error('ERROR_REPORT', {
      ...error,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    })
    
    // Optionally send to external monitoring service
    await sendToMonitoring(error)
    
    return true
  } catch (err) {
    console.error('Failed to store error report:', err)
    return false
  }
}

// Send to external monitoring service
const sendToMonitoring = async (error: ErrorReport & { category: string; severity: string }) => {
  // Sentry integration
  try {
    const Sentry = require('@sentry/nextjs')
    if (Sentry?.captureException) {
      Sentry.withScope((scope: any) => {
        scope.setTag('errorId', error.errorId)
        scope.setTag('category', error.category)
        scope.setTag('severity', error.severity)
        scope.setLevel(error.severity === 'critical' ? 'fatal' : error.severity)
        scope.setContext('errorDetails', {
          userAgent: error.userAgent,
          url: error.url,
          timestamp: error.timestamp,
          metadata: error.metadata,
        })
        
        const syntheticError = new Error(error.message)
        if (error.stack) {
          syntheticError.stack = error.stack
        }
        
        Sentry.captureException(syntheticError)
      })
    }
  } catch (sentryError) {
    // Silently fail if Sentry is not available
    console.warn('Sentry not available for error reporting:', sentryError)
  }
  
  // Other monitoring services can be added here
  // e.g., DataDog, New Relic, LogRocket, etc.
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await errorReportLimit(request)
    if (rateLimitResult) {
      return rateLimitResult
    }
    
    // Parse request body
    const body = await request.json()
    const errorReport = ErrorReportSchema.parse(body)
    
    // Enhance error with additional data
    const enhancedError = {
      ...errorReport,
      category: categorizeError(errorReport),
      severity: determineErrorSeverity(errorReport),
      reportedAt: new Date().toISOString(),
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      serverTimestamp: new Date().toISOString(),
    }
    
    // Store the error
    const stored = await storeError(enhancedError)
    
    return NextResponse.json(
      {
        success: true,
        errorId: errorReport.errorId,
        category: enhancedError.category,
        severity: enhancedError.severity,
        stored,
        message: 'Error report received and processed',
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error in error reporting API:', error)
    
    // Even our error reporting API can fail, so we need to handle this gracefully
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid error report format',
          details: error.errors,
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process error report',
      },
      { status: 500 }
    )
  }
}

// Health check for error reporting system
export async function GET() {
  return NextResponse.json(
    {
      service: 'error-reporting',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      capabilities: {
        errorCollection: true,
        rateLimiting: true,
        categorization: true,
        severityDetection: true,
        externalMonitoring: !!process.env.SENTRY_DSN,
      },
    },
    { status: 200 }
  )
}

// Export types for use in other parts of the application
export type { ErrorReport }
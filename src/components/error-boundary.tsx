/**
 * State-of-the-art Error Boundary Component
 * Provides comprehensive error handling with recovery options
 */

'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorId: string
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  isolate?: boolean
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  errorId: string
}

// Enhanced error logging
const logError = (error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
  const errorDetails = {
    errorId,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Server',
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error Boundary [${errorId}]`)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Full Details:', errorDetails)
    console.groupEnd()
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // This would typically send to Sentry, LogRocket, etc.
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorDetails),
      }).catch(err => console.error('Failed to report error:', err))
    } catch (reportError) {
      console.error('Failed to report error:', reportError)
    }
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError, errorId }) => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <Bug className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2">
              {isProduction ? (
                <span>Error ID: <code className="font-mono text-xs">{errorId}</code></span>
              ) : (
                <details className="mt-2">
                  <summary className="cursor-pointer hover:text-foreground">
                    Technical Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={resetError} variant="default" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            
            {!isProduction && (
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
            )}
          </div>

          {isProduction && (
            <div className="text-center text-sm text-muted-foreground">
              If this problem persists, please contact support with the error ID above.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log the error
    logError(error, errorInfo, this.state.errorId)
    
    // Call optional error callback
    this.props.onError?.(error, errorInfo)
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    })
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState) {
    // Auto-recovery attempt after 10 seconds in development
    if (
      process.env.NODE_ENV === 'development' &&
      this.state.hasError &&
      !prevState.hasError
    ) {
      this.resetTimeoutId = window.setTimeout(() => {
        console.log('🔄 Error Boundary: Attempting auto-recovery...')
        this.resetError()
      }, 10000)
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      
      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={this.resetError}
          errorId={this.state.errorId}
        />
      )
    }

    // Wrap children in isolation boundary if requested
    if (this.props.isolate) {
      return <div className="error-boundary-isolation">{this.props.children}</div>
    }

    return <>{this.props.children}</>
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: any) => {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create fake errorInfo if not provided
    const fakeErrorInfo = {
      componentStack: errorInfo?.componentStack || 'No component stack available',
    }
    
    logError(error, fakeErrorInfo, errorId)
  }, [])
}

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary
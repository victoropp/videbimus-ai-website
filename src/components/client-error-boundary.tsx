/**
 * Client-side Error Boundary Wrapper
 * Handles the server/client component boundary issues
 */

'use client'

import dynamic from 'next/dynamic'

// Dynamically import the error boundary to avoid SSR issues
const ErrorBoundary = dynamic(() => import('./error-boundary'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Loading...</div>
})

interface ClientErrorBoundaryProps {
  children: React.ReactNode
  isolate?: boolean
}

export default function ClientErrorBoundary({ children, isolate = false }: ClientErrorBoundaryProps) {
  return (
    <ErrorBoundary isolate={isolate}>
      {children}
    </ErrorBoundary>
  )
}
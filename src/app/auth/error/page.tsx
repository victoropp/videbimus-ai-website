'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, { title: string; description: string }> = {
    Configuration: {
      title: 'Configuration Error',
      description: 'There is a problem with the server configuration. Please contact support if this persists.',
    },
    AccessDenied: {
      title: 'Access Denied',
      description: 'You do not have permission to sign in. Please contact your administrator.',
    },
    Verification: {
      title: 'Verification Error',
      description: 'The verification link has expired or has already been used.',
    },
    Default: {
      title: 'Authentication Error',
      description: 'An error occurred during authentication. Please try again.',
    },
  }

  const errorInfo = errorMessages[error || 'Default'] || errorMessages.Default

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold">{errorInfo.title}</CardTitle>
            <CardDescription className="text-center mt-2">
              {errorInfo.description}
            </CardDescription>
            {error && (
              <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-400">
                Error code: {error}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-center text-gray-500 dark:text-gray-400">
              If you continue to experience issues, please contact our support team at{' '}
              <a href="mailto:support@videbimusai.com" className="text-primary hover:underline">
                support@videbimusai.com
              </a>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go to Homepage
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
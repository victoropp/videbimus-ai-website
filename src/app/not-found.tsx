'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchX, Home, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-24 h-24 bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6"
            >
              <SearchX className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
                404
              </CardTitle>
              <CardTitle className="text-3xl mb-2">Page Not Found</CardTitle>
              <CardDescription className="text-lg">
                The page you're looking for doesn't exist or has been moved.
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Button asChild size="lg" className="h-12">
                <Link href="/" className="flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Go Home
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="h-12">
                <Link href="javascript:history.back()" className="flex items-center">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </Link>
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="border-t border-gray-200 dark:border-gray-700 pt-8"
            >
              <h3 className="text-lg font-semibold mb-4">Popular Pages</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <Link
                  href="/about"
                  className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  About Us
                </Link>
                <Link
                  href="/services"
                  className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  Services
                </Link>
                <Link
                  href="/case-studies"
                  className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  Case Studies
                </Link>
                <Link
                  href="/contact"
                  className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center"
                >
                  Contact
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Still can't find what you're looking for?
              </p>
              <Button asChild variant="ghost" size="sm">
                <Link href="/contact" className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Support
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// Add metadata for SEO
export const metadata = {
  title: '404 - Page Not Found | Videbimus AI',
  description: 'The page you are looking for could not be found.',
  robots: 'noindex, nofollow'
}
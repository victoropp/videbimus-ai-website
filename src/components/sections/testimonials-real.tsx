'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/lib/trpc/client'
import { useEffect, useState } from 'react'
import type { Testimonial } from '@prisma/client'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

interface TestimonialsProps {
  limit?: number
  className?: string
}

export function TestimonialsReal({ limit = 6, className = '' }: TestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use TRPC to fetch testimonials
  const { data, isLoading: trpcLoading, error: trpcError } = api.testimonials.list.useQuery({
    isActive: true,
    limit,
  })

  useEffect(() => {
    if (data) {
      setTestimonials(data)
      setIsLoading(false)
    }
    if (trpcError) {
      setError(trpcError.message)
      setIsLoading(false)
    }
  }, [data, trpcError])

  // Fallback testimonials for when database is empty
  const fallbackTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Chief Technology Officer',
      company: 'TechCorp Industries',
      content: 'Videbimus AI transformed our entire data infrastructure. Their team delivered a comprehensive ML platform that increased our operational efficiency by 40% and reduced costs by $2M annually.',
      image: '/testimonials/sarah-chen.jpg',
      rating: 5,
      isActive: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      role: 'Head of Data Science',
      company: 'FinanceFlow',
      content: 'The fraud detection system they built has been a game-changer. We\'ve reduced false positives by 60% while catching 95% more actual fraud attempts. The ROI was evident within 3 months.',
      image: '/testimonials/michael-rodriguez.jpg',
      rating: 5,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Dr. Emily Watson',
      role: 'VP of Innovation',
      company: 'HealthTech Solutions',
      content: 'Their expertise in healthcare AI is unmatched. The clinical decision support system they developed has improved patient outcomes by 25% while reducing diagnostic time by half.',
      image: '/testimonials/emily-watson.jpg',
      rating: 5,
      isActive: true,
      sortOrder: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const displayTestimonials = testimonials.length > 0 ? testimonials : fallbackTestimonials.slice(0, limit)

  if (error && testimonials.length === 0) {
    console.warn('Failed to load testimonials from database, using fallback data:', error)
  }

  return (
    <section className={`py-24 bg-gray-50 dark:bg-gray-900/50 ${className}`}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
            Trusted by Industry Leaders
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            See how organizations across industries have transformed their operations with our AI solutions
          </p>
        </motion.div>

        {isLoading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading testimonials...</p>
          </div>
        )}

        {!isLoading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {displayTestimonials.map((testimonial, index) => (
              <motion.div key={testimonial.id} variants={itemVariants}>
                <Card className="h-full relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                  {/* Quote icon background */}
                  <div className="absolute top-6 right-6 opacity-10">
                    <Quote className="h-8 w-8 text-cyan-500" />
                  </div>
                  
                  <CardContent className="p-8 h-full flex flex-col">
                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <blockquote className="text-gray-600 dark:text-gray-300 mb-6 flex-1 leading-relaxed">
                      "{testimonial.content}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                        {testimonial.image ? (
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.parentElement!.innerHTML = testimonial.name.split(' ').map(n => n[0]).join('')
                            }}
                          />
                        ) : (
                          testimonial.name.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {testimonial.role}
                        </div>
                        <div className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                          {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Trusted by companies across industries
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center opacity-60">
            {Array.from(new Set(displayTestimonials.map(t => t.company))).slice(0, 5).map((company, index) => (
              <div
                key={company}
                className="text-lg font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Admin notice */}
        {process.env.NODE_ENV === 'development' && testimonials.length === 0 && (
          <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-center">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Dev Notice:</strong> No testimonials found in database. Using fallback data. 
              Add testimonials via the admin panel to see real data.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
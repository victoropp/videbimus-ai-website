'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Testimonial } from '@/types'

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Chief Technology Officer',
    company: 'TechCorp Industries',
    content: 'Vidibemus AI transformed our entire data infrastructure. Their team delivered a comprehensive ML platform that increased our operational efficiency by 40% and reduced costs by $2M annually.',
    image: '/testimonials/sarah-chen.jpg',
    rating: 5
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    role: 'Head of Data Science',
    company: 'FinanceFlow',
    content: 'The fraud detection system they built has been a game-changer. We\'ve reduced false positives by 60% while catching 95% more actual fraud attempts. The ROI was evident within 3 months.',
    image: '/testimonials/michael-rodriguez.jpg',
    rating: 5
  },
  {
    id: '3',
    name: 'Dr. Emily Watson',
    role: 'VP of Innovation',
    company: 'HealthTech Solutions',
    content: 'Their expertise in healthcare AI is unmatched. The clinical decision support system they developed has improved patient outcomes by 25% while reducing diagnostic time by half.',
    image: '/testimonials/emily-watson.jpg',
    rating: 5
  },
  {
    id: '4',
    name: 'James Liu',
    role: 'CEO',
    company: 'RetailMax',
    content: 'The personalization engine Vidibemus AI created for us increased our conversion rates by 35% and customer lifetime value by 50%. Their team understood our business from day one.',
    image: '/testimonials/james-liu.jpg',
    rating: 5
  },
  {
    id: '5',
    name: 'Amanda Foster',
    role: 'Operations Director',
    company: 'ManufacturePro',
    content: 'Predictive maintenance was just a concept until Vidibemus AI made it reality. We\'ve prevented 90% of equipment failures and saved over $5M in unplanned downtime.',
    image: '/testimonials/amanda-foster.jpg',
    rating: 5
  },
  {
    id: '6',
    name: 'David Kim',
    role: 'Chief Data Officer',
    company: 'LogisticsCorp',
    content: 'Route optimization through AI has revolutionized our delivery network. 30% reduction in fuel costs, 25% faster deliveries, and happier customers. Exceptional work!',
    image: '/testimonials/david-kim.jpg',
    rating: 5
  }
]

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

export function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial, index) => (
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
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
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
            {['TechCorp', 'FinanceFlow', 'HealthTech', 'RetailMax', 'LogisticsCorp'].map((company, index) => (
              <div
                key={company}
                className="text-lg font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
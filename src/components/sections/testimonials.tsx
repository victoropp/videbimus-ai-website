'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Testimonial } from '@/types'

const testimonials: Partial<Testimonial>[] = [
  {
    id: '1',
    name: 'John Thompson',
    role: 'Operations Director',
    company: 'Petroverse - Oil & Gas',
    content: 'Honestly? I was skeptical. We\'d tried "predictive maintenance" before and it was a disaster. But our equipment failures were costing us $200K every time something broke. Videbimus showed us a working demo with our own data in week 2. Now we catch problems before they happen. Downtime is down 45%. My boss asked me why we didn\'t do this sooner.',
    image: '/testimonials/john-thompson.jpg',
    rating: 5
  },
  {
    id: '2',
    name: 'Lisa Martinez',
    role: 'Chief Technology Officer',
    company: 'INSURE360 - Insurance',
    content: 'Claims were taking 3-4 weeks and our customers were furious. Every call was "where\'s my money?" We couldn\'t hire fast enough. Videbimus automated the whole thing—now it\'s 3-4 DAYS. Fraud detection caught stuff our team missed. Best part? Our adjusters aren\'t drowning anymore. They actually like their jobs again.',
    image: '/testimonials/lisa-martinez.jpg',
    rating: 5
  },
  {
    id: '3',
    name: 'Sarah Chen',
    role: 'Chief Technology Officer',
    company: 'TechCorp Industries',
    content: 'We had data everywhere—spreadsheets, old databases, nothing talked to each other. I spent 6 months trying to hire a data team. Couldn\'t find anyone good. Videbimus came in, organized the chaos, built us a system that actually works. Saved us $2M in year one. Worth every penny.',
    image: '/testimonials/sarah-chen.jpg',
    rating: 5
  },
  {
    id: '4',
    name: 'Michael Rodriguez',
    role: 'Head of Data Science',
    company: 'FinanceFlow',
    content: 'Our fraud system was flagging everything. Legitimate customers got blocked, actual fraud slipped through. It was embarrassing. Videbimus rebuilt it from scratch. False alarms dropped 60%, real fraud detection went UP. Paid for itself in 3 months just from what we stopped losing.',
    image: '/testimonials/michael-rodriguez.jpg',
    rating: 5
  },
  {
    id: '5',
    name: 'Dr. Emily Watson',
    role: 'VP of Innovation',
    company: 'HealthTech Solutions',
    content: 'Healthcare moves slow. Regulations, compliance, everyone\'s scared of liability. Videbimus got it. They didn\'t promise magic—they showed us what was possible within our constraints. Clinical decision support that actually helps doctors without getting in the way. Patient outcomes improved 25%. That\'s lives saved.',
    image: '/testimonials/emily-watson.jpg',
    rating: 5
  },
  {
    id: '6',
    name: 'James Liu',
    role: 'CEO',
    company: 'RetailMax',
    content: 'We were showing every customer the same products. Conversion rate was garbage. Tried building personalization in-house—9 months, nothing worked. Videbimus shipped in 8 weeks. Conversions up 35%, people are buying MORE stuff. My CMO keeps asking "can we do this for email too?" Yes. We can.',
    image: '/testimonials/james-liu.jpg',
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
            Real People, Real Problems, Real Results
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            They were skeptical too. Here's what happened when they gave us a shot.
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
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
            {['Petroverse', 'INSURE360', 'TechCorp', 'FinanceFlow', 'HealthTech', 'RetailMax'].map((company, index) => (
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
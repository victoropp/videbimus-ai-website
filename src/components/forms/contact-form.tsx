'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ContactFormData } from '@/types'

const services = [
  { value: 'discovery', label: 'AI Discovery & Strategy' },
  { value: 'implementation', label: 'AI Implementation & Integration' },
  { value: 'transformation', label: 'Enterprise AI Transformation' },
  { value: 'ml', label: 'Machine Learning Solutions' },
  { value: 'data-engineering', label: 'Data Engineering & Analytics' },
  { value: 'automation', label: 'AI Automation Services' },
  { value: 'training', label: 'Training & Education' },
  { value: 'other', label: 'Other / Not Sure' },
]

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>('idle')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    setFormState('loading')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Here you would typically send the data to your backend
      console.log('Form data:', data)
      
      setFormState('success')
      reset()
      
      // Reset to idle after showing success message
      setTimeout(() => setFormState('idle'), 5000)
    } catch (error) {
      console.error('Form submission error:', error)
      setFormState('error')
      
      // Reset to idle after showing error message
      setTimeout(() => setFormState('idle'), 5000)
    }
  }

  if (formState === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 mb-4 mx-auto">
              <CheckCircle className="h-8 w-8" />
            </div>
            <CardTitle className="text-xl mb-2">Message Sent!</CardTitle>
            <CardDescription className="text-base">
              Thank you for your interest in VidebimusAI! Our team will review your request and respond within 24 hours to schedule your free 30-minute consultation. Check your email for confirmation.
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started Today</CardTitle>
        <CardDescription>
          Fill out the form below and we'll get back to you within 24 hours to schedule your free consultation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <Input
              id="name"
              type="text"
              error={!!errors.name}
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
              placeholder="John Smith"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              error={!!errors.email}
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="john@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name
            </label>
            <Input
              id="company"
              type="text"
              {...register('company')}
              placeholder="Acme Corporation"
            />
          </div>

          {/* Industry */}
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Industry
            </label>
            <select
              id="industry"
              {...register('industry')}
              className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-cyan-400"
            >
              <option value="">Select your industry...</option>
              <option value="oil-gas">Oil & Gas</option>
              <option value="insurance">Insurance</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance & Banking</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail & E-commerce</option>
              <option value="technology">Technology</option>
              <option value="logistics">Logistics & Supply Chain</option>
              <option value="energy">Energy & Utilities</option>
              <option value="small-business">Small Business</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Service */}
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Service Interest
            </label>
            <select
              id="service"
              {...register('service')}
              className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-cyan-400"
            >
              <option value="">Select a service...</option>
              {services.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Timeline
            </label>
            <select
              id="timeline"
              {...register('timeline')}
              className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-cyan-400"
            >
              <option value="">When do you want to start?</option>
              <option value="immediately">Immediately (within 2 weeks)</option>
              <option value="1-month">Within 1 month</option>
              <option value="1-3-months">1-3 months</option>
              <option value="3-6-months">3-6 months</option>
              <option value="6-plus-months">6+ months</option>
              <option value="exploring">Just exploring options</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Budget Range (Optional)
            </label>
            <select
              id="budget"
              {...register('budget')}
              className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-cyan-400"
            >
              <option value="">Select budget range...</option>
              <option value="under-10k">Under $10,000</option>
              <option value="10k-25k">$10,000 - $25,000</option>
              <option value="25k-50k">$25,000 - $50,000</option>
              <option value="50k-100k">$50,000 - $100,000</option>
              <option value="100k-plus">$100,000+</option>
              <option value="not-sure">Not sure yet</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Details *
            </label>
            <Textarea
              id="message"
              error={!!errors.message}
              {...register('message', { 
                required: 'Project details are required',
                minLength: { value: 10, message: 'Please provide more details (minimum 10 characters)' }
              })}
              placeholder="Tell us about your AI goals, challenges, and what you're looking to achieve..."
              rows={4}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Error state */}
          {formState === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
            >
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">
                Something went wrong. Please try again or contact us directly.
              </span>
            </motion.div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={formState === 'loading'}
          >
            {formState === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending Message...
              </>
            ) : (
              <>
                Send Message
                <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            By submitting this form, you agree to our Privacy Policy and Terms of Service.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
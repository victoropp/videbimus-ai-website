'use client'

import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, MessageCircle, Calendar, Users, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/forms/contact-form'

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Send us an email and we\'ll respond within 24 hours',
    contact: 'consulting@videbimusai.com',
    action: 'mailto:consulting@videbimusai.com'
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Speak directly with our AI experts',
    contact: '+44 7442 852 675',
    action: 'tel:+447442852675'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'Message us on WhatsApp for quick responses',
    contact: '+233 248 769 377',
    action: 'https://wa.me/233248769377'
  }
]

const processSteps = [
  {
    step: 1,
    title: 'Discovery Call',
    description: '30-minute consultation to understand your needs and AI opportunities',
    duration: '30 minutes',
    icon: Phone
  },
  {
    step: 2,
    title: 'Proposal Development',
    description: 'Custom solution design with detailed timeline and investment requirements',
    duration: '3-5 business days',
    icon: Users
  },
  {
    step: 3,
    title: 'Project Kickoff',
    description: 'Team introductions, project setup, and initial planning phase',
    duration: '1 week',
    icon: Calendar
  },
  {
    step: 4,
    title: 'Implementation',
    description: 'Iterative development with regular updates and continuous optimization',
    duration: 'Varies by project',
    icon: CheckCircle
  }
]

const faqs = [
  {
    question: 'How long does a typical AI project take?',
    answer: 'Project timelines vary based on complexity. Discovery projects typically take 2-4 weeks, implementation projects 3-6 months, and enterprise transformations 6-18 months.'
  },
  {
    question: 'What industries do you work with?',
    answer: 'Our team brings experience from diverse sectors including manufacturing, healthcare, finance, retail, logistics, and energy. We adapt our expertise to your specific industry needs.'
  },
  {
    question: 'Do you provide ongoing support after implementation?',
    answer: 'Yes, we offer comprehensive support packages including 24/7 monitoring, model retraining, performance optimization, and quarterly business reviews.'
  },
  {
    question: 'What\'s the typical ROI for AI projects?',
    answer: 'Based on industry benchmarks and our team\'s previous experience, AI projects typically achieve 200%+ ROI within 18 months, with significant cost reductions and revenue increases depending on the use case.'
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

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
              Let's Transform Your Business Together
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200 mb-8">
              Ready to unlock the power of AI for your organization? Schedule a free consultation 
              with our experienced team and discover how we can help you achieve your goals.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                <span>Free 30-min consultation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No obligation</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span>Expert guidance</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50 -mt-12 relative z-10">
        <div className="container">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon
              return (
                <motion.div key={method.title} variants={itemVariants}>
                  <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-8">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white mb-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {method.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {method.description}
                      </p>
                      <a
                        href={method.action}
                        className="font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
                      >
                        {method.contact}
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-24 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ContactForm />
            </motion.div>

            {/* Contact Info & Process */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 text-cyan-500 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">consulting@videbimusai.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">+44 7442 852 675</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">WhatsApp: +233 248 769 377</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">Monday-Friday, 9 AM - 6 PM GMT</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">Global Remote Team</span>
                  </div>
                </CardContent>
              </Card>

              {/* Process */}
              <Card>
                <CardHeader>
                  <CardTitle>Our Process</CardTitle>
                  <CardDescription>
                    Here's what happens after you reach out to us
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {processSteps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div key={step.step} className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white font-bold text-sm">
                            {step.step}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {step.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                            {step.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {step.duration}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Common questions about our AI consulting services and process
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        <div className="container relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-200 mb-6 max-w-2xl mx-auto">
              Our AI experts are here to help. No question is too big or small.
            </p>
            <div className="flex items-center justify-center space-x-8 text-white/90">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Free consultation</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No sales pressure</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Expert advice</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Mail, Phone, MapPin, Clock, MessageCircle, Calendar, Users, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/forms/contact-form'

const contactMethods = [
  {
    icon: Mail,
    title: 'Email (Detailed Questions)',
    description: 'Got a complex situation? Email us the details—we\'ll respond in 24 hours with real answers',
    contact: 'consulting@videbimusai.com',
    action: 'mailto:consulting@videbimusai.com',
    image: '/images/contact/method-email.jpg'
  },
  {
    icon: Phone,
    title: 'Call (Quick Chat)',
    description: 'Want to talk it through? Call us. Real people answer, not a menu tree',
    contact: '+44 7442 852 675',
    action: 'tel:+447442852675',
    image: '/images/contact/method-phone.jpg'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp (Fast Response)',
    description: 'Easiest way to reach us. Message us and we\'ll get back to you same-day',
    contact: '+233 248 769 377',
    action: 'https://wa.me/233248769377',
    image: '/images/contact/method-whatsapp.jpg'
  }
]

const processSteps = [
  {
    step: 1,
    title: 'Real Talk (30 min)',
    description: 'Tell us where it hurts. We\'ll tell you if we can fix it—and what it actually costs. No vague "transformation" talk.',
    duration: '30 minutes',
    icon: Phone,
    image: '/images/contact/process-real-talk.jpg'
  },
  {
    step: 2,
    title: 'Show You What\'s Possible',
    description: 'We build a quick prototype with YOUR data (not generic demos). See if it actually solves your problem before spending big.',
    duration: '1-2 weeks',
    icon: Users,
    image: '/images/contact/process-proof.jpg'
  },
  {
    step: 3,
    title: 'Fixed-Price Proposal',
    description: 'Exact timeline. Exact cost. No scope creep surprises. You know what you\'re getting before day one.',
    duration: '3-5 days',
    icon: Calendar,
    image: '/images/contact/process-proposal.jpg'
  },
  {
    step: 4,
    title: 'Ship Working Software',
    description: 'We build it, your team tests it, we fix issues. You get software that actually works on Monday morning—not vaporware.',
    duration: '6-8 weeks typical',
    icon: CheckCircle,
    image: '/images/contact/process-ship.jpg'
  }
]

const faqs = [
  {
    question: 'How do I know this won\'t turn into another expensive IT project that goes nowhere?',
    answer: 'Fair question—we\'ve seen those disasters too. That\'s why we show you a working prototype with YOUR data in week 2. If it doesn\'t work, we tell you. If it does, you see it before committing big money. Fixed-price quotes mean no surprise costs. And we ship in 6-8 weeks, not "6 months that becomes 18 months."'
  },
  {
    question: 'What if my team won\'t use it?',
    answer: 'This is the #1 reason AI projects fail. We build tools your team will actually want to use on Monday morning—not complex systems that require a PhD to operate. We train your people before we leave, and the first 90 days include support to iron out real-world issues. If your team isn\'t using it, we failed.'
  },
  {
    question: 'Do I need clean data or a big IT infrastructure first?',
    answer: 'No. Messy data is normal—we\'ll help you clean what matters. And we work with what you have: Excel, old databases, whatever. If you need infrastructure upgrades, we\'ll tell you upfront (and help you get budget approval with real numbers). We don\'t make you "get ready" for 6 months before starting.'
  },
  {
    question: 'What does this actually cost?',
    answer: 'Honest answer: Discovery package (2-4 weeks, includes working prototype) typically runs $15K-$25K. Full implementation (6-8 weeks to working software) runs $75K-$150K depending on complexity. Enterprise solutions (multiple systems, 4-6 months) start around $300K. We give you exact numbers after understanding your problem—no "it depends" hand-waving.'
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
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/contact/hero-consultation.jpg"
            alt="Professional business consultation"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/90 to-primary-700/90" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
              Let's Find Where You're Losing Money
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200 mb-8">
              30-minute call. Zero pressure. We'll look at your operation and tell you honestly where AI can help—and where it can't.
              Equipment failures? Manual processes eating your team's time? Claims taking forever? Let's talk specifics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                <span>30-min honest assessment</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No pitch deck, just real talk</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span>Talk to people who've shipped this before</span>
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
                  <Card className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                    {/* Method Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={method.image}
                        alt={method.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-8">
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
                  <CardTitle>What Happens Next</CardTitle>
                  <CardDescription>
                    No mystery—here's exactly how we work
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {processSteps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div key={step.step} className="flex space-x-4 group">
                        <div className="flex-shrink-0">
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                            <Image
                              src={step.image}
                              alt={step.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/80 to-purple-500/80 flex items-center justify-center">
                              <span className="text-white font-bold text-2xl">{step.step}</span>
                            </div>
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
              Questions You're Probably Asking
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              The real concerns decision-makers have (we've heard them all before)
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
              Want to Know What This Would Actually Cost?
            </h2>
            <p className="text-xl text-gray-200 mb-6 max-w-2xl mx-auto">
              Fill out the form above or call us. We'll give you real numbers after understanding your specific problem.
              Not "it depends"—actual ballpark figures so you know if it makes sense for your budget.
            </p>
            <div className="flex items-center justify-center space-x-8 text-white/90">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Real pricing, not "contact for quote"</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>We'll tell you if it won't work</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No pressure to buy anything</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
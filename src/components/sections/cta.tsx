'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700" />
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
      
      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl mb-6">
            Ready to Transform Your Business with AI?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-200 mb-8">
            Partner with experienced AI professionals who bring decades of expertise from leading tech companies. 
            Get started with a free consultation today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <Calendar className="h-8 w-8 text-cyan-400 mx-auto mb-4" />
            <h3 className="font-semibold text-white mb-2">Free Consultation</h3>
            <p className="text-gray-200 text-sm">
              30-minute discovery call to understand your AI opportunities
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <MessageCircle className="h-8 w-8 text-purple-400 mx-auto mb-4" />
            <h3 className="font-semibold text-white mb-2">Custom Proposal</h3>
            <p className="text-gray-200 text-sm">
              Tailored solution design with timeline and investment details
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <Phone className="h-8 w-8 text-green-400 mx-auto mb-4" />
            <h3 className="font-semibold text-white mb-2">Quick Start</h3>
            <p className="text-gray-200 text-sm">
              Begin your AI journey with proven methodologies and expert guidance
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-primary-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
          >
            <Link href="/contact">
              Schedule Free Consultation
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
          >
            <Link href="/case-studies">
              View Success Stories
            </Link>
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-8 text-white/80 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Enterprise-Grade Security</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>24/7 Support</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
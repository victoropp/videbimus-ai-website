'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Linkedin, Twitter, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { TeamMember } from '@/types'

const team: TeamMember[] = [
  {
    id: '1',
    name: 'Victor Collins Oppon',
    role: 'Founder & CEO',
    bio: 'FCCA, MBA, BSc. Experienced leader in AI and data science consulting with expertise in transforming businesses through intelligent automation and data-driven strategies.',
    image: '/team/victor-collins-oppon.jpg',
    linkedin: 'https://www.linkedin.com/in/victor-collins-oppon-fcca-mba-bsc-01541019/'
  },
  {
    id: '2',
    name: 'Sai Raj Ali',
    role: 'Chief Technology Officer',
    bio: 'Innovative technology leader with deep expertise in AI architecture, machine learning systems, and enterprise-scale implementations.',
    image: '/team/sai-raj-ali.jpg',
    linkedin: 'https://www.linkedin.com/in/sairajdream/'
  },
  {
    id: '3',
    name: 'Shawanah Ally',
    role: 'Head of Data Science',
    bio: 'Data science expert specializing in predictive analytics, statistical modeling, and developing data-driven solutions for complex business challenges.',
    image: '/team/shawanah-ally.jpg',
    linkedin: 'https://www.linkedin.com/in/sally01/'
  },
  {
    id: '4',
    name: 'Rukayat Salau',
    role: 'AI Strategy Director',
    bio: 'Strategic AI consultant with expertise in developing and implementing comprehensive AI transformation roadmaps for enterprise clients.',
    image: '/team/rukayat-salau.jpg',
    linkedin: 'https://www.linkedin.com/in/rukayatsalau/'
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
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5
    }
  }
}

export function Team() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
            Meet Our Expert Team
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            World-class AI researchers, data scientists, and engineers from top tech companies and universities
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12"
        >
          {team.map((member, index) => (
            <motion.div key={member.id} variants={itemVariants}>
              <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-6 text-center">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {/* Status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-950 rounded-full"></div>
                  </div>

                  {/* Info */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {member.name}
                    </h3>
                    <p className="text-cyan-600 dark:text-cyan-400 font-medium mb-3">
                      {member.role}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>

                  {/* Social links */}
                  <div className="flex items-center justify-center space-x-3">
                    {member.linkedin && (
                      <Link
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-cyan-500 transition-colors"
                        aria-label={`${member.name} LinkedIn`}
                      >
                        <Linkedin className="h-5 w-5" />
                      </Link>
                    )}
                    {member.twitter && (
                      <Link
                        href={member.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-cyan-500 transition-colors"
                        aria-label={`${member.name} Twitter`}
                      >
                        <Twitter className="h-5 w-5" />
                      </Link>
                    )}
                    <Link
                      href={`mailto:${member.name.toLowerCase().replace(' ', '.')}@videbimusai.com`}
                      className="text-gray-400 hover:text-cyan-500 transition-colors"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail className="h-5 w-5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Team stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-gray-50 to-cyan-50/50 dark:from-gray-900 dark:to-cyan-950/20 rounded-2xl p-8 border border-gray-200 dark:border-gray-800"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">10+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Research Papers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">50+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Combined Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">20+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Enterprises Helped</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Global Support</div>
            </div>
          </div>
        </motion.div>

        {/* Join team CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <h3 className="font-display text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Want to Join Our Team?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
            We're always looking for talented AI researchers, data scientists, and engineers to join our mission.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/careers">
              View Open Positions
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
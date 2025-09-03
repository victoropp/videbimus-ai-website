'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Linkedin, Twitter, Github, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/trpc/client'
import { useEffect, useState } from 'react'
import type { TeamMember } from '@prisma/client'

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

interface TeamProps {
  limit?: number
  className?: string
}

export function TeamReal({ limit = 8, className = '' }: TeamProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use TRPC to fetch team members
  const { data, isLoading: trpcLoading, error: trpcError } = api.team.list.useQuery({
    isActive: true,
    limit,
  })

  useEffect(() => {
    if (data) {
      setTeamMembers(data)
      setIsLoading(false)
    }
    if (trpcError) {
      setError(trpcError.message)
      setIsLoading(false)
    }
  }, [data, trpcError])

  // Fallback team members for when database is empty
  const fallbackTeam: TeamMember[] = [
    {
      id: '1',
      name: 'Dr. Alex Thompson',
      role: 'Founder & CEO',
      bio: 'Former Google AI researcher with 15+ years in machine learning and enterprise AI. PhD in Computer Science from Stanford.',
      image: '/team/alex-thompson.jpg',
      email: 'alex.thompson@videbimusai.com',
      linkedin: 'https://linkedin.com/in/alexthompson',
      twitter: 'https://twitter.com/alexthompsonai',
      github: null,
      isActive: true,
      sortOrder: 0,
      skills: ['Machine Learning', 'Deep Learning', 'AI Strategy', 'Leadership'],
      experience: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Dr. Priya Patel',
      role: 'Chief Data Scientist',
      bio: 'Ex-Microsoft Azure ML lead with expertise in deep learning and NLP. Published 50+ research papers on AI applications.',
      image: '/team/priya-patel.jpg',
      email: 'priya.patel@videbimusai.com',
      linkedin: 'https://linkedin.com/in/priyapatel',
      twitter: 'https://twitter.com/priyapatelai',
      github: null,
      isActive: true,
      sortOrder: 1,
      skills: ['Deep Learning', 'NLP', 'Computer Vision', 'Research'],
      experience: 12,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Marcus Chen',
      role: 'Head of Engineering',
      bio: 'Former Amazon Principal Engineer specializing in scalable ML infrastructure and cloud architecture.',
      image: '/team/marcus-chen.jpg',
      email: 'marcus.chen@videbimusai.com',
      linkedin: 'https://linkedin.com/in/marcuschen',
      twitter: null,
      github: 'https://github.com/marcuschen',
      isActive: true,
      sortOrder: 2,
      skills: ['Cloud Architecture', 'MLOps', 'Python', 'AWS'],
      experience: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Dr. Sarah Williams',
      role: 'AI Strategy Director',
      bio: 'McKinsey alum with expertise in AI transformation strategies. Helped 100+ enterprises implement AI solutions.',
      image: '/team/sarah-williams.jpg',
      email: 'sarah.williams@videbimusai.com',
      linkedin: 'https://linkedin.com/in/sarahwilliams',
      twitter: 'https://twitter.com/sarahwai',
      github: null,
      isActive: true,
      sortOrder: 3,
      skills: ['AI Strategy', 'Digital Transformation', 'Business Analysis', 'Consulting'],
      experience: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]

  const displayTeam = teamMembers.length > 0 ? teamMembers : fallbackTeam.slice(0, limit)

  if (error && teamMembers.length === 0) {
    console.warn('Failed to load team members from database, using fallback data:', error)
  }

  // Calculate stats
  const totalExperience = displayTeam.reduce((sum, member) => sum + (member.experience || 0), 0)
  const uniqueSkills = Array.from(new Set(displayTeam.flatMap(member => member.skills || [])))

  return (
    <section className={`py-24 bg-white dark:bg-gray-950 ${className}`}>
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

        {isLoading && (
          <div className="text-center mb-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading team members...</p>
          </div>
        )}

        {!isLoading && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12"
          >
            {displayTeam.map((member, index) => (
              <motion.div key={member.id} variants={itemVariants}>
                <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <CardContent className="p-6 text-center">
                    {/* Avatar */}
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                        {member.image ? (
                          <img 
                            src={member.image} 
                            alt={member.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.parentElement!.innerHTML = member.name.split(' ').map(n => n[0]).join('')
                            }}
                          />
                        ) : (
                          member.name.split(' ').map(n => n[0]).join('')
                        )}
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
                      {member.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                          {member.bio}
                        </p>
                      )}
                      {member.experience && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.experience} years experience
                        </p>
                      )}
                    </div>

                    {/* Skills */}
                    {member.skills && member.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {member.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 text-xs bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-200 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {member.skills.length > 3 && (
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                              +{member.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

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
                      {member.github && (
                        <Link
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-cyan-500 transition-colors"
                          aria-label={`${member.name} GitHub`}
                        >
                          <Github className="h-5 w-5" />
                        </Link>
                      )}
                      {member.email && (
                        <Link
                          href={`mailto:${member.email}`}
                          className="text-gray-400 hover:text-cyan-500 transition-colors"
                          aria-label={`Email ${member.name}`}
                        >
                          <Mail className="h-5 w-5" />
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

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
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {uniqueSkills.length}+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Core Skills</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {Math.round(totalExperience / displayTeam.length) || 10}+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">100+</div>
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

        {/* Admin notice */}
        {process.env.NODE_ENV === 'development' && teamMembers.length === 0 && (
          <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg text-center">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              <strong>Dev Notice:</strong> No team members found in database. Using fallback data. 
              Add team members via the admin panel to see real data.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { List } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')

  // Extract headings from markdown content
  const headings = useMemo(() => {
    const headingRegex = /^#{2,3}\s+(.+)$/gm
    const matches: Heading[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[0].split('#').length - 1
      const text = match[1].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()

      matches.push({ id, text, level })
    }

    return matches
  }, [content])

  // Add IDs to actual heading elements in the DOM
  useEffect(() => {
    if (headings.length === 0) return

    headings.forEach(({ id, text }) => {
      // Find heading elements by text content
      const allHeadings = document.querySelectorAll('h2, h3')
      allHeadings.forEach((heading) => {
        const headingText = heading.textContent?.trim()
        if (headingText === text && !heading.id) {
          heading.id = id
        }
      })
    })
  }, [headings])

  // Set up Intersection Observer for active section highlighting
  useEffect(() => {
    if (headings.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0,
      }
    )

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [headings])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })

      // Update active state immediately
      setActiveId(id)
    }
  }

  // Return null if no headings found (after all hooks have been called)
  if (headings.length === 0) {
    return null
  }

  return (
    <Card
      variant="default"
      padding="none"
      className={cn('sticky top-24 w-full max-w-sm', className)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <List className="h-5 w-5 text-cyan-500" />
          Table of Contents
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <nav aria-label="Table of contents">
          <ul className="space-y-2 text-sm">
            {headings.map(({ id, text, level }) => (
              <motion.li
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ x: 4 }}
              >
                <a
                  href={`#${id}`}
                  onClick={(e) => handleClick(e, id)}
                  className={cn(
                    'block py-1.5 transition-all duration-200 border-l-2',
                    level === 3 && 'pl-4',
                    level === 2 && 'pl-2',
                    activeId === id
                      ? 'border-cyan-500 text-cyan-600 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
                  )}
                >
                  {text}
                </a>
              </motion.li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  )
}

export default TableOfContents

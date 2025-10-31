'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, User, ArrowRight, Search, Tag, Filter, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SEOHead from '@/components/blog/seo-head'
import type { BlogPost, BlogCategory, BlogTag, BlogSearchResult } from '@/types'

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

export default function BlogPage() {
  const categories = ['AI & Machine Learning', 'Data Science', 'Industry Insights', 'Best Practices']
  
  // Featured post data
  const featuredPost = {
    id: '1',
    slug: 'the-future-of-ai-in-business',
    title: 'The Future of AI in Business: 2024 and Beyond',
    excerpt: 'Explore how artificial intelligence is reshaping business operations, from automation to decision-making, and what lies ahead for organizations embracing AI transformation.',
    content: '',
    author: 'Dr. Sarah Chen',
    authorImage: '/images/blog/author-1.jpg',
    publishedAt: new Date('2024-08-20'),
    date: new Date('2024-08-20'),
    readTime: 8,
    category: { id: '1', name: 'AI & Machine Learning', slug: 'ai-machine-learning' },
    tags: ['AI Strategy', 'Digital Transformation', 'Business Intelligence', 'Machine Learning'],
    image: '/images/blog/featured-ai-future-business.jpg',
    views: 1542,
    likes: 234,
  }

  // Other posts data
  const otherPosts = [
    {
      id: '2',
      slug: 'implementing-data-pipelines',
      title: 'Building Scalable Data Pipelines for Real-Time Analytics',
      excerpt: 'Learn the best practices for designing and implementing data pipelines that can handle millions of events per second.',
      author: 'Marcus Johnson',
      authorImage: '/images/blog/author-2.jpg',
      date: new Date('2024-08-18'),
      readTime: 12,
      tags: ['Data Engineering', 'Apache Kafka', 'Stream Processing'],
      category: { id: '2', name: 'Data Science', slug: 'data-science' },
      image: '/images/blog/article-data-pipelines.jpg',
    },
    {
      id: '3',
      slug: 'mlops-best-practices',
      title: 'MLOps Best Practices: From Development to Production',
      excerpt: 'A comprehensive guide to implementing MLOps practices that ensure reliable and scalable machine learning deployments.',
      author: 'Emily Rodriguez',
      authorImage: '/images/blog/author-3.jpg',
      date: new Date('2024-08-15'),
      readTime: 10,
      tags: ['MLOps', 'DevOps', 'Machine Learning'],
      category: { id: '1', name: 'AI & Machine Learning', slug: 'ai-machine-learning' },
      image: '/images/blog/article-mlops-practices.jpg',
    },
    {
      id: '4',
      slug: 'ai-ethics-considerations',
      title: 'Ethical AI: Building Responsible AI Systems',
      excerpt: 'Exploring the critical ethical considerations when developing AI systems and how to implement responsible AI practices.',
      author: 'Dr. James Wilson',
      authorImage: '/images/blog/author-4.jpg',
      date: new Date('2024-08-12'),
      readTime: 7,
      tags: ['AI Ethics', 'Responsible AI', 'Governance'],
      category: { id: '3', name: 'Industry Insights', slug: 'industry-insights' },
      image: '/images/blog/article-ai-ethics.jpg',
    },
    {
      id: '5',
      slug: 'computer-vision-manufacturing',
      title: 'Computer Vision in Manufacturing: Quality Control Revolution',
      excerpt: 'How computer vision is transforming quality control processes in manufacturing with real-world case studies.',
      author: 'Lisa Chang',
      authorImage: '/images/blog/author-1.jpg',
      date: new Date('2024-08-10'),
      readTime: 9,
      tags: ['Computer Vision', 'Manufacturing', 'Quality Control'],
      category: { id: '3', name: 'Industry Insights', slug: 'industry-insights' },
      image: '/images/blog/article-computer-vision-manufacturing.jpg',
    },
    {
      id: '6',
      slug: 'natural-language-processing-customer-service',
      title: 'Transforming Customer Service with NLP',
      excerpt: 'Discover how natural language processing is revolutionizing customer service through chatbots and sentiment analysis.',
      author: 'Michael Brown',
      authorImage: '/images/blog/author-2.jpg',
      date: new Date('2024-08-08'),
      readTime: 6,
      tags: ['NLP', 'Customer Service', 'Chatbots'],
      category: { id: '1', name: 'AI & Machine Learning', slug: 'ai-machine-learning' },
      image: '/images/blog/article-nlp-customer-service.jpg',
    },
  ]
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/blog/hero-knowledge-sharing.jpg"
            alt="Knowledge sharing and AI insights"
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
              AI Insights & Expertise
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-gray-200 mb-8">
              Stay ahead of the curve with the latest insights, trends, and best practices
              in artificial intelligence and data science from our expert team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-6 items-center justify-between"
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 4).map((category, index) => (
                <Button
                  key={category}
                  variant={index === 0 ? "primary" : "outline"}
                  size="sm"
                  className="text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Featured Article
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Our latest insights on AI and data science
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group">
              <div className="lg:flex">
                {/* Image */}
                <div className="lg:w-2/3 h-64 lg:h-auto relative overflow-hidden">
                  <Image
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="success">Featured</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="lg:w-1/3 p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {featuredPost.tags.slice(0, 3).map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {featuredPost.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                          <Image
                            src={featuredPost.authorImage}
                            alt={featuredPost.author}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span>{featuredPost.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{featuredPost.date.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{featuredPost.readTime} min read</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="mt-6 group/btn">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Latest Articles
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Expert insights and practical guides from our AI team
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {otherPosts.map((post, index) => (
              <motion.div key={post.id} variants={itemVariants}>
                <Link href={`/blog/${post.slug}`} className="block group">
                  <Card className="h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                    {/* Image */}
                    <div className="h-48 relative overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>

                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 2).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {post.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <div className="relative h-6 w-6 rounded-full overflow-hidden">
                            <Image
                              src={post.authorImage}
                              alt={post.author}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span>{post.date.toLocaleDateString()}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime}m</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Load More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg">
              Load More Articles
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Signup */}
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
              Stay Updated with AI Insights
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Get the latest AI trends, case studies, and expert insights delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
              />
              <Button className="bg-white text-primary-900 hover:bg-gray-100">
                Subscribe
              </Button>
            </div>
            <p className="text-gray-300 text-sm mt-4">
              No spam, unsubscribe at any time. Privacy policy compliant.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
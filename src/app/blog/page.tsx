'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, User, ArrowRight, Search, Tag, Filter, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SEOHead from '@/components/blog/seo-head'
import type { BlogPost, BlogCategory, BlogTag } from '@/types'

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

interface BlogApiResponse {
  posts: BlogPost[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: {
    categories: BlogCategory[]
    tags: BlogTag[]
    authors: Array<{
      id: string
      name: string | null
      email: string
      image: string | null
      role: string
    }>
  }
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to first page on new search
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '9', // 9 posts per page for the grid
          sortBy: 'publishedAt',
          sortOrder: 'desc'
        })

        if (debouncedSearch) {
          params.append('query', debouncedSearch)
        }

        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory)
        }

        const response = await fetch(`/api/blog/posts?${params.toString()}`)

        if (!response.ok) {
          throw new Error('Failed to fetch blog posts')
        }

        const data: BlogApiResponse = await response.json()

        // Get featured post separately (first request only)
        if (currentPage === 1 && !debouncedSearch && selectedCategory === 'all') {
          const featuredResponse = await fetch('/api/blog/posts?featured=true&limit=1')
          if (featuredResponse.ok) {
            const featuredData: BlogApiResponse = await featuredResponse.json()
            if (featuredData.posts.length > 0) {
              setFeaturedPost(featuredData.posts[0])
              // Remove featured post from regular posts if it exists
              const filteredPosts = data.posts.filter(p => p.id !== featuredData.posts[0].id)
              setPosts(filteredPosts)
            } else {
              setPosts(data.posts)
            }
          } else {
            setPosts(data.posts)
          }
        } else {
          setPosts(data.posts)
        }

        setTotalPages(data.pagination.pages)
        setTotalPosts(data.pagination.total)

        // Set filters (only once)
        if (categories.length === 0 && data.filters.categories.length > 0) {
          setCategories(data.filters.categories)
        }
        if (tags.length === 0 && data.filters.tags.length > 0) {
          setTags(data.filters.tags)
        }
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load blog posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [currentPage, debouncedSearch, selectedCategory])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1) // Reset to first page on category change
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return 'Date unavailable'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getAuthorImage = (post: BlogPost): string => {
    return post.author?.image || '/images/blog/default-avatar.jpg'
  }

  const getAuthorName = (post: BlogPost): string => {
    return post.author?.name || 'Anonymous'
  }

  const getPostImage = (post: BlogPost): string => {
    return post.featuredImage || '/images/blog/default-post.jpg'
  }

  const getPostTags = (post: BlogPost): string[] => {
    // Support both tags array (backward compatibility) and postTags relation
    if (post.tags && post.tags.length > 0) {
      return post.tags
    }
    if (post.postTags && post.postTags.length > 0) {
      return post.postTags.map(pt => pt.tag.name)
    }
    return []
  }

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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? "primary" : "outline"}
                size="sm"
                className="text-sm"
                onClick={() => handleCategoryChange('all')}
              >
                All Posts
              </Button>
              {categories.slice(0, 4).map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? "primary" : "outline"}
                  size="sm"
                  className="text-sm"
                  onClick={() => handleCategoryChange(category.slug)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Loading State */}
      {loading && currentPage === 1 && (
        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="container flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading articles...</p>
          </div>
        </section>
      )}

      {/* Error State */}
      {error && !loading && (
        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="container flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Articles
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </section>
      )}

      {/* Featured Post */}
      {!loading && !error && featuredPost && currentPage === 1 && !debouncedSearch && selectedCategory === 'all' && (
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
                      src={getPostImage(featuredPost)}
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
                        {getPostTags(featuredPost).slice(0, 3).map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {featuredPost.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {featuredPost.excerpt || 'Read this featured article to learn more about AI and data science.'}
                      </p>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                          <div className="relative h-8 w-8 rounded-full overflow-hidden">
                            <Image
                              src={getAuthorImage(featuredPost)}
                              alt={getAuthorName(featuredPost)}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span>{getAuthorName(featuredPost)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(featuredPost.publishedAt)}</span>
                        </div>
                        {featuredPost.readTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{featuredPost.readTime} min read</span>
                          </div>
                        )}
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
      )}

      {/* Blog Posts Grid */}
      {!loading && !error && posts.length > 0 && (
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
                {debouncedSearch || selectedCategory !== 'all' ? 'Search Results' : 'Latest Articles'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {debouncedSearch || selectedCategory !== 'all'
                  ? `Found ${totalPosts} article${totalPosts !== 1 ? 's' : ''}`
                  : 'Expert insights and practical guides from our AI team'
                }
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {posts.map((post, index) => (
                <motion.div key={post.id} variants={itemVariants}>
                  <Link href={`/blog/${post.slug}`} className="block group">
                    <Card className="h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                      {/* Image */}
                      <div className="h-48 relative overflow-hidden">
                        <Image
                          src={getPostImage(post)}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      </div>

                      <CardHeader>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {getPostTags(post).slice(0, 2).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {post.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {post.excerpt || 'Click to read more about this article.'}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <div className="relative h-6 w-6 rounded-full overflow-hidden">
                              <Image
                                src={getAuthorImage(post)}
                                alt={getAuthorName(post)}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span>{getAuthorName(post)}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span>{formatDate(post.publishedAt)}</span>
                            {post.readTime && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{post.readTime}m</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination / Load More */}
            {currentPage < totalPages && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center mt-12"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    `Load More Articles (${totalPosts - posts.length} remaining)`
                  )}
                </Button>
              </motion.div>
            )}

            {/* Page Info */}
            {totalPages > 1 && (
              <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
                Showing page {currentPage} of {totalPages}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container flex flex-col items-center justify-center min-h-[400px]">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Articles Found
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center max-w-md">
              {debouncedSearch
                ? `No articles match your search for "${debouncedSearch}". Try different keywords.`
                : selectedCategory !== 'all'
                ? `No articles found in this category. Try browsing other categories.`
                : 'No articles have been published yet. Check back soon!'}
            </p>
            {(debouncedSearch || selectedCategory !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </section>
      )}

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

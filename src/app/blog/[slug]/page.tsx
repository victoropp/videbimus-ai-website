'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Eye, Heart, Share2, MessageSquare, Tag, ArrowLeft, ArrowRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import SEOHead from '@/components/blog/seo-head'
import type { BlogPost } from '@/types'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  useEffect(() => {
    if (params.slug) {
      fetchPost(params.slug as string)
    }
  }, [params.slug])

  const fetchPost = async (slug: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blog/posts/${slug}`)
      
      if (response.ok) {
        const data = await response.json()
        setPost(data)
        setLikesCount(data.likes || 0)
        
        // Fetch related posts
        if (data.category) {
          fetchRelatedPosts(data.category.slug, data.id)
        }
      } else if (response.status === 404) {
        router.push('/blog')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedPosts = async (categorySlug: string, currentPostId: string) => {
    try {
      const response = await fetch(`/api/blog/posts?category=${categorySlug}&limit=3`)
      if (response.ok) {
        const data = await response.json()
        // Filter out current post
        const filtered = data.posts.filter((p: BlogPost) => p.id !== currentPostId)
        setRelatedPosts(filtered.slice(0, 3))
      }
    } catch (error) {
      console.error('Error fetching related posts:', error)
    }
  }

  const handleLike = async () => {
    if (!post || liked) return
    
    try {
      // In a real implementation, you'd have an API endpoint for likes
      setLiked(true)
      setLikesCount(prev => prev + 1)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <SEOHead title="Loading..." />
        
        {/* Loading skeleton */}
        <div className="container py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The blog post you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/blog')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <SEOHead post={post} />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-300 mb-6">
              <button
                onClick={() => router.push('/')}
                className="hover:text-white transition-colors"
              >
                Home
              </button>
              <span>/</span>
              <button
                onClick={() => router.push('/blog')}
                className="hover:text-white transition-colors"
              >
                Blog
              </button>
              {post.category && (
                <>
                  <span>/</span>
                  <button
                    onClick={() => router.push(`/blog/category/${post.category!.slug}`)}
                    className="hover:text-white transition-colors"
                  >
                    {post.category.name}
                  </button>
                </>
              )}
            </nav>

            {/* Article Header */}
            <div className="max-w-4xl">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.featured && (
                  <Badge variant="default" className="bg-yellow-500 text-yellow-900">
                    Featured
                  </Badge>
                )}
                {post.category && (
                  <Badge variant="secondary">
                    {post.category.name}
                  </Badge>
                )}
                {post.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-white/20 text-white">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {post.title}
              </h1>
              
              {post.excerpt && (
                <p className="text-xl text-gray-200 leading-relaxed mb-6 max-w-3xl">
                  {post.excerpt}
                </p>
              )}

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-6 text-gray-300">
                <div className="flex items-center space-x-2">
                  {post.author.image && (
                    <img
                      src={typeof post.author.image === 'string' ? post.author.image : '/avatar-placeholder.png'}
                      alt={post.author.name || ''}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{post.author.name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime} min read</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views} views</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image - Commented out as featuredImage field doesn't exist */}
      {/* {post.featuredImage && (
        <div className="relative h-96 overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )} */}

      {/* Main Content */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="lg:flex lg:gap-12">
              {/* Article Content */}
              <article className="lg:flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="prose prose-lg dark:prose-dark max-w-none"
                >
                  <ReactMarkdown
                    components={{
                      code({node, className, children, ...props}: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        const inline = node?.position ? false : true
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </motion.div>

                {/* Article Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center justify-between py-6 border-t mt-12"
                >
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      disabled={liked}
                      className={liked ? 'text-red-500 border-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                      {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>0 comments</span>
                  </div>
                </motion.div>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="py-6 border-t"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/blog/tag/${tag}`)}
                          className="text-xs"
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </article>

              {/* Sidebar */}
              <aside className="lg:w-80 mt-12 lg:mt-0">
                {/* Author Info */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="sticky top-6">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        {post.author.image && (
                          <img
                            src={typeof post.author.image === 'string' ? post.author.image : '/avatar-placeholder.png'}
                            alt={post.author.name || ''}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">{post.author.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-normal">
                            Author
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Expert in AI and machine learning with years of experience helping businesses 
                        implement cutting-edge solutions.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Related Articles
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Continue reading with these related posts from our blog
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden group">
                    {/* Placeholder image */}
                    <div className="h-48 bg-gradient-to-br from-cyan-100 to-purple-100 dark:from-cyan-900/20 dark:to-purple-900/20 relative overflow-hidden">
                      {relatedPost.featuredImage ? (
                        <img 
                          src={relatedPost.featuredImage} 
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-4xl font-bold text-cyan-500/30">
                            {relatedPost.title.split(' ')[0][0]}{relatedPost.title.split(' ')[1]?.[0] || ''}
                          </div>
                        </div>
                      )}
                    </div>

                    <CardHeader>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {relatedPost.category && (
                          <Badge variant="secondary" className="text-xs">
                            {relatedPost.category.name}
                          </Badge>
                        )}
                        {relatedPost.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag.id} variant="outline" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {relatedPost.title}
                      </CardTitle>
                      {relatedPost.excerpt && (
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                          {relatedPost.excerpt}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{relatedPost.author.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span>{new Date(relatedPost.createdAt).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{relatedPost.readTime}m</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => router.push(`/blog/${relatedPost.slug}`)}
                        className="w-full mt-4 group/btn"
                      >
                        Read Article
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
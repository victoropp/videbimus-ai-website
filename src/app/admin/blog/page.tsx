'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Folder,
  Star,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { BlogPost, BlogCategory, BlogTag, BlogSearchResult, PostStatus } from '@/types'

const statusColors = {
  DRAFT: 'gray',
  PUBLISHED: 'green',
  SCHEDULED: 'blue',
  ARCHIVED: 'yellow',
  DELETED: 'red'
}

export default function BlogAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Redirect if not authenticated or not admin/consultant
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }
    
    if (!['ADMIN', 'CONSULTANT'].includes(session.user.role)) {
      router.push('/')
      return
    }
  }, [session, status, router])

  // Fetch posts
  useEffect(() => {
    fetchPosts()
  }, [searchQuery, selectedStatus, selectedCategory, currentPage])

  // Fetch categories and tags
  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchQuery && { query: searchQuery }),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
      })

      const response = await fetch(`/api/blog/posts?${params}`)
      if (response.ok) {
        const data: BlogSearchResult = await response.json()
        setPosts(data.posts)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories?includeInactive=true')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/blog/tags')
      if (response.ok) {
        const data = await response.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleStatusChange = async (postId: string, newStatus: PostStatus) => {
    try {
      const response = await fetch(`/api/blog/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, status: newStatus, published: newStatus === 'PUBLISHED' }
            : post
        ))
      }
    } catch (error) {
      console.error('Error updating post status:', error)
    }
  }

  if (status === 'loading' || !session) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Blog Administration
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Manage your blog content, categories, and settings
              </p>
            </div>
            
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={() => {
                    setSearchQuery('')
                    setSelectedStatus('all')
                    setSelectedCategory('all')
                    setCurrentPage(1)
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts List */}
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="pt-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="flex gap-2">
                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        No posts found. Create your first post to get started.
                      </p>
                      <Button asChild className="mt-4">
                        <Link href="/admin/blog/new">Create First Post</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {post.status}
                              </Badge>
                              {post.featured && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              {post.category && (
                                <Badge variant="outline" className="text-xs">
                                  <Folder className="h-3 w-3 mr-1" />
                                  {post.category.name}
                                </Badge>
                              )}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {post.title}
                            </h3>
                            
                            {post.excerpt && (
                              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {post.author.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(post.createdAt).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {post.views} views
                              </div>
                              {post.readTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {post.readTime} min read
                                </div>
                              )}
                            </div>

                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {post.tags.slice(0, 3).map(tag => (
                                  <Badge key={tag.id} variant="outline" className="text-xs">
                                    <Tag className="h-2 w-2 mr-1" />
                                    {tag.name}
                                  </Badge>
                                ))}
                                {post.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{post.tags.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/blog/${post.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/blog/${post.slug}`} target="_blank">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {post.status === 'DRAFT' && (
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(post.id, 'PUBLISHED')}
                                >
                                  Publish
                                </DropdownMenuItem>
                              )}
                              {post.status === 'PUBLISHED' && (
                                <DropdownMenuItem 
                                  onClick={() => handleStatusChange(post.id, 'ARCHIVED')}
                                >
                                  Archive
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  Manage blog post categories and their hierarchy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 font-medium text-sm">
                      <div>Name</div>
                      <div>Slug</div>
                      <div>Posts</div>
                      <div>Actions</div>
                    </div>
                    {categories.map(category => (
                      <div key={category.id} className="grid grid-cols-4 gap-4 p-4 border-t">
                        <div>{category.name}</div>
                        <div className="text-gray-500">{category.slug}</div>
                        <div>0 posts</div>
                        <div>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags">
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Manage blog post tags for better organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tag
                  </Button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tags.map(tag => (
                      <Card key={tag.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag.name}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                          {tag.description && (
                            <p className="text-sm text-gray-500 mt-2">
                              {tag.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Blog Settings</CardTitle>
                <CardDescription>
                  Configure blog-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">General Settings</h4>
                    <p className="text-gray-600 dark:text-gray-300">
                      Blog settings functionality coming soon...
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
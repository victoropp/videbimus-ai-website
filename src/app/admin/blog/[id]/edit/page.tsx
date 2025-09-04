'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import BlogEditor from '@/components/blog/blog-editor'
import type { BlogPost, BlogCategory } from '@/types'

// Simple tag interface since BlogTag model doesn't exist
interface TagInfo {
  name: string
  slug: string
  count: number
}

interface EditBlogPostPageProps {
  params: {
    id: string
  }
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<TagInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

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

  // Fetch post, categories and tags
  useEffect(() => {
    if (session && ['ADMIN', 'CONSULTANT'].includes(session.user.role)) {
      fetchPost()
      fetchCategories()
      fetchTags()
    }
  }, [session, params.id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data)
      } else if (response.status === 404) {
        router.push('/admin/blog')
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/blog/categories')
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

  const handleSave = async (postData: Partial<BlogPost>) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blog/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postData,
          changeNote: 'Post updated via admin interface'
        })
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setPost(updatedPost)
        alert('Post saved successfully!')
      } else {
        const error = await response.json()
        alert(`Error saving post: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (postData: Partial<BlogPost>) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/blog/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postData,
          status: 'PUBLISHED',
          publishedAt: postData.publishedAt || new Date(),
          changeNote: 'Post published via admin interface'
        })
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setPost(updatedPost)
        router.push(`/blog/${updatedPost.slug}`)
      } else {
        const error = await response.json()
        alert(`Error publishing post: ${error.error}`)
      }
    } catch (error) {
      console.error('Error publishing post:', error)
      alert('Error publishing post')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/blog/posts/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/blog')
      } else {
        const error = await response.json()
        alert(`Error deleting post: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Error deleting post')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || initialLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Post Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The blog post you're looking for doesn't exist or you don't have permission to edit it.
          </p>
          <button
            onClick={() => router.push('/admin/blog')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Blog Admin
          </button>
        </div>
      </div>
    )
  }

  // Check permissions - only author or admin can edit
  if (post.author.id !== session.user.id && session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You don't have permission to edit this post.
          </p>
          <button
            onClick={() => router.push('/admin/blog')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Blog Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <BlogEditor
      post={post}
      categories={categories}
      tags={tags}
      onSave={handleSave}
      onPublish={handlePublish}
      onDelete={handleDelete}
      loading={loading}
    />
  )
}
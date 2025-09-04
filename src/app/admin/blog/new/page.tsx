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

export default function NewBlogPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<TagInfo[]>([])
  const [loading, setLoading] = useState(false)

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

  // Fetch categories and tags
  useEffect(() => {
    fetchCategories()
    fetchTags()
  }, [])

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
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })

      if (response.ok) {
        const post = await response.json()
        router.push(`/admin/blog/${post.id}/edit`)
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
      const response = await fetch('/api/blog/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...postData,
          status: 'PUBLISHED',
          publishedAt: new Date()
        })
      })

      if (response.ok) {
        const post = await response.json()
        router.push(`/blog/${post.slug}`)
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

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <BlogEditor
      categories={categories}
      tags={tags}
      onSave={handleSave}
      onPublish={handlePublish}
      loading={loading}
    />
  )
}
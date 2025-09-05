'use client'

import { useState, useRef, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Image, 
  Eye,
  Save,
  Upload,
  X,
  Plus,
  Hash
} from 'lucide-react'
import type { BlogPost, BlogCategory, PostStatus } from '@/types'

// Simple tag interface since BlogTag model doesn't exist
interface TagInfo {
  name: string
  slug: string
  count: number
}

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded" />
  }
)

interface BlogEditorProps {
  post?: Partial<BlogPost>
  categories: BlogCategory[]
  tags: TagInfo[]
  onSave: (post: Partial<BlogPost>) => Promise<void>
  onPublish: (post: Partial<BlogPost>) => Promise<void>
  onDelete?: () => Promise<void>
  loading?: boolean
}

const statusOptions: { value: PostStatus; label: string; color: string }[] = [
  { value: 'DRAFT', label: 'Draft', color: 'gray' },
  { value: 'PUBLISHED', label: 'Published', color: 'green' },
  { value: 'SCHEDULED', label: 'Scheduled', color: 'blue' },
  { value: 'ARCHIVED', label: 'Archived', color: 'yellow' }
]

export default function BlogEditor({ 
  post, 
  categories, 
  tags, 
  onSave, 
  onPublish, 
  onDelete, 
  loading = false 
}: BlogEditorProps) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    status: post?.status || 'DRAFT' as PostStatus,
    featured: post?.featured || false,
    categoryId: post?.category?.id || '',
    selectedTags: post?.tags || [], // tags is String[] not objects
    seoTitle: post?.seoTitle || '',
    seoDescription: post?.seoDescription || '',
    seoKeywords: post?.seoKeywords || [] as string[], // Add seoKeywords field as string array
    featuredImage: post?.featuredImage || '',
    publishedAt: post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : ''
  })

  const [editorMode, setEditorMode] = useState<'visual' | 'markdown' | 'html'>('visual')
  const [previewMode, setPreviewMode] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .slice(0, 50)
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-generate slug from title
      if (field === 'title' && (!post?.slug || prev.slug === generateSlug(prev.title))) {
        updated.slug = generateSlug(value)
      }
      
      // Auto-generate SEO title from title if not set
      if (field === 'title' && !prev.seoTitle) {
        updated.seoTitle = value
      }
      
      return updated
    })
  }

  const handleTagToggle = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagName)
        ? prev.selectedTags.filter(tag => tag !== tagName)
        : [...prev.selectedTags, tagName]
    }))
  }

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.seoKeywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        seoKeywords: [...prev.seoKeywords, newKeyword.trim()]
      }))
      setNewKeyword('')
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter(k => k !== keyword)
    }))
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('alt', file.name)
      if (post?.id) {
        uploadFormData.append('blogPostId', post.id)
      }

      const response = await fetch('/api/blog/images', {
        method: 'POST',
        body: uploadFormData
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const image = await response.json()
      
      // Insert image markdown into content
      const imageMarkdown = `![${image.alt || ''}](${image.url})`
      setFormData(prev => ({
        ...prev,
        content: prev.content + '\n\n' + imageMarkdown
      }))

      // Set as featured image if none is set
      if (!formData.featuredImage) {
        setFormData(prev => ({
          ...prev,
          featuredImage: image.url
        }))
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    try {
      await onSave({
        ...formData,
        tags: formData.selectedTags, // tags is String[] not tagIds
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt) : undefined
      })
    } catch (error) {
      console.error('Error saving post:', error)
    }
  }

  const handlePublish = async () => {
    try {
      await onPublish({
        ...formData,
        status: 'PUBLISHED',
        tags: formData.selectedTags, // tags is String[] not tagIds
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt) : new Date()
      })
    } catch (error) {
      console.error('Error publishing post:', error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {post?.id ? 'Edit Post' : 'Create New Post'}
          </h1>
          <p className="text-gray-600 mt-1">
            {post?.id ? 'Make changes to your blog post' : 'Write and publish a new blog post'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={loading}>
            Publish
          </Button>
          {onDelete && (
            <Button variant="destructive" onClick={onDelete} disabled={loading}>
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Title */}
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter post title..."
                  className="text-lg"
                />
              </div>

              {/* Slug */}
              <div>
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="post-url-slug"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL: /blog/{formData.slug}
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Brief description of your post..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Content</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={editorMode} onValueChange={(value: any) => setEditorMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="markdown">Markdown</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editorMode === 'visual' && (
                <Textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Start writing your post..."
                  className="min-h-96 font-mono"
                />
              )}
              
              {(editorMode === 'markdown' || editorMode === 'html') && (
                <MonacoEditor
                  height="400px"
                  language={editorMode === 'markdown' ? 'markdown' : 'html'}
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value || '')}
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    fontSize: 14,
                    lineHeight: 1.6
                  }}
                  theme="vs-light"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: PostStatus) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="px-1 py-0">
                            {option.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Featured Post</Label>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                />
              </div>

              {formData.status === 'SCHEDULED' && (
                <div>
                  <Label htmlFor="publishedAt">Publish Date</Label>
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) => handleInputChange('publishedAt', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => handleInputChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Category</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {formData.selectedTags.map(tagName => (
                    <Badge
                      key={tagName}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tagName)}
                    >
                      {tagName}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                  {tags
                    .filter(tag => !formData.selectedTags.includes(tag.name))
                    .map(tag => (
                      <Button
                        key={tag.name}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTagToggle(tag.name)}
                        className="justify-start h-8"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        {tag.name}
                        <span className="ml-auto text-xs text-gray-500">
                          ({tag.count})
                        </span>
                      </Button>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input
                  value={formData.featuredImage}
                  onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  placeholder="Image URL or upload image above"
                />
                {formData.featuredImage && (
                  <div className="relative">
                    <img
                      src={formData.featuredImage}
                      alt="Featured image preview"
                      className="w-full h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={formData.seoTitle}
                  onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                  placeholder="SEO optimized title..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="seoDescription">Meta Description</Label>
                <Textarea
                  id="seoDescription"
                  value={formData.seoDescription}
                  onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                  placeholder="Brief description for search engines..."
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>

              <div>
                <Label>Keywords</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {formData.seoKeywords.map(keyword => (
                    <Badge
                      key={keyword}
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleRemoveKeyword(keyword)}
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {keyword}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button size="sm" onClick={handleAddKeyword}>
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
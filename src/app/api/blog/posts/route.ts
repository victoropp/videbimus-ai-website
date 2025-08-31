import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { BlogSearchParams, PostStatus } from '@/types'

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  metaContent: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED', 'DELETED']).default('DRAFT'),
  featured: z.boolean().default(false),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).default([]),
  featuredImage: z.string().optional(),
  publishedAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
})

// GET /api/blog/posts - Get blog posts with search and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('query') || undefined
    const category = searchParams.get('category') || undefined
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const author = searchParams.get('author') || undefined
    const status = (searchParams.get('status') as PostStatus) || undefined
    const featured = searchParams.get('featured') === 'true' ? true : undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 posts per request
    const sortBy = (searchParams.get('sortBy') as any) || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

    // Build where clause for filtering
    const where: any = {}
    
    // Only show published posts for public API unless admin
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'
    
    if (!isAdmin) {
      where.published = true
      where.status = 'PUBLISHED'
    } else if (status) {
      where.status = status
    }

    if (featured !== undefined) {
      where.featured = featured
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (tags.length > 0) {
      where.tags = {
        some: {
          slug: {
            in: tags
          }
        }
      }
    }

    if (author) {
      where.author = {
        name: {
          contains: author,
          mode: 'insensitive'
        }
      }
    }

    // Full-text search
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.blogPost.count({ where })

    // Get posts with relations
    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        category: true,
        tags: true,
        images: true,
        _count: {
          select: {
            comments: {
              where: {
                isApproved: true
              }
            }
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Calculate read time for posts that don't have it
    const postsWithReadTime = posts.map(post => ({
      ...post,
      readTime: post.readTime || Math.ceil(post.content.split(' ').length / 200), // ~200 words per minute
      commentCount: post._count.comments
    }))

    // Get filter options
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: 'asc' }
    })

    const allTags = await prisma.blogTag.findMany({
      orderBy: { name: 'asc' }
    })

    const authors = await prisma.user.findMany({
      where: {
        blogPosts: {
          some: isAdmin ? {} : { published: true, status: 'PUBLISHED' }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true
      }
    })

    return NextResponse.json({
      posts: postsWithReadTime,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories,
        tags: allTags,
        authors
      }
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

// POST /api/blog/posts - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins and consultants can create blog posts
    if (!['ADMIN', 'CONSULTANT'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const json = await request.json()
    const data = createPostSchema.parse(json)

    // Check if slug is unique
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: data.slug }
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Create the post
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        metaContent: data.metaContent,
        status: data.status,
        published: data.status === 'PUBLISHED',
        publishedAt: data.publishedAt,
        featured: data.featured,
        authorId: session.user.id,
        categoryId: data.categoryId,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        seoKeywords: data.seoKeywords,
        featuredImage: data.featuredImage,
        readTime: Math.ceil(data.content.split(' ').length / 200),
        tags: {
          connect: data.tagIds.map(id => ({ id }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        category: true,
        tags: true,
        images: true
      }
    })

    // Create initial revision
    await prisma.blogRevision.create({
      data: {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        authorId: session.user.id,
        blogPostId: post.id,
        version: 1,
        changeNote: 'Initial version'
      }
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating blog post:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    )
  }
}
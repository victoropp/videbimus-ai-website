import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  metaContent: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED', 'DELETED']).optional(),
  featured: z.boolean().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  publishedAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  changeNote: z.string().optional()
})

// GET /api/blog/posts/[id] - Get a specific blog post
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const session = await getServerSession()
    const isAdmin = session?.user?.role === 'ADMIN'

    // Find post by ID or slug
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ],
        // Only show published posts unless admin
        ...(!isAdmin && {
          published: true,
          status: 'PUBLISHED'
        })
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
        category: true
      }
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Increment view count
    if (!isAdmin) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { views: { increment: 1 } }
      })
      post.views += 1
    }

    // Calculate read time if not set
    const readTime = post.readTime || Math.ceil(post.content.split(' ').length / 200)

    return NextResponse.json({
      ...post,
      readTime,
      commentCount: 0
    })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    )
  }
}

// PUT /api/blog/posts/[id] - Update a blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const json = await request.json()
    const data = updatePostSchema.parse(json)

    // Find existing post
    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check permissions - author or admin can edit
    if (existingPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existingPost.slug) {
      const duplicatePost = await prisma.blogPost.findUnique({
        where: { slug: data.slug }
      })

      if (duplicatePost) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    
    if (data.title) updateData.title = data.title
    if (data.slug) updateData.slug = data.slug
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt
    if (data.content) updateData.content = data.content
    if (data.metaContent !== undefined) updateData.metaContent = data.metaContent
    if (data.status) {
      updateData.status = data.status
      updateData.published = data.status === 'PUBLISHED'
    }
    if (data.featured !== undefined) updateData.featured = data.featured
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId
    if (data.seoTitle !== undefined) updateData.seoTitle = data.seoTitle
    if (data.seoDescription !== undefined) updateData.seoDescription = data.seoDescription
    if (data.seoKeywords) updateData.seoKeywords = data.seoKeywords
    if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt

    // Update read time if content changed
    if (data.content) {
      updateData.readTime = Math.ceil(data.content.split(' ').length / 200)
    }

    // Handle tags
    if (data.tagIds) {
      updateData.tags = {
        set: data.tagIds.map(id => ({ id }))
      }
    }

    // Update the post
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: updateData,
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
        category: true
      }
    })

    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating blog post:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

// DELETE /api/blog/posts/[id] - Delete a blog post
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    // Find existing post
    const existingPost = await prisma.blogPost.findUnique({
      where: { id }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Check permissions - author or admin can delete
    if (existingPost.authorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Soft delete by marking as ARCHIVED
    await prisma.blogPost.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        published: false
      }
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
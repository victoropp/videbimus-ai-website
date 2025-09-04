import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
})

// GET /api/blog/tags - Get all tags from BlogTag model
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const popular = searchParams.get('popular') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')

    const session = await getServerSession()
    const isAdmin = session?.user?.role === 'ADMIN'

    if (popular) {
      // Get tags with post count, sorted by popularity
      const tags = await prisma.blogTag.findMany({
        include: {
          posts: {
            where: isAdmin ? {} : {
              post: {
                published: true,
                status: 'PUBLISHED'
              }
            }
          },
          _count: {
            select: {
              posts: {
                where: isAdmin ? {} : {
                  post: {
                    published: true,
                    status: 'PUBLISHED'
                  }
                }
              }
            }
          }
        },
        orderBy: {
          posts: {
            _count: 'desc'
          }
        },
        take: limit
      })

      return NextResponse.json(tags.map(tag => ({
        ...tag,
        count: tag._count.posts
      })))
    } else {
      // Get all tags sorted alphabetically
      const tags = await prisma.blogTag.findMany({
        include: {
          _count: {
            select: {
              posts: {
                where: isAdmin ? {} : {
                  post: {
                    published: true,
                    status: 'PUBLISHED'
                  }
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        },
        take: limit
      })

      return NextResponse.json(tags.map(tag => ({
        ...tag,
        count: tag._count.posts
      })))
    }
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// POST /api/blog/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins and consultants can create tags
    if (!['ADMIN', 'CONSULTANT'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const json = await request.json()
    const data = createTagSchema.parse(json)

    // Check if slug is unique
    const existingTag = await prisma.blogTag.findUnique({
      where: { slug: data.slug }
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this slug already exists' },
        { status: 400 }
      )
    }

    const tag = await prisma.blogTag.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description
      }
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}
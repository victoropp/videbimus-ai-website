import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  color: z.string().optional()
})

// GET /api/blog/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const popular = searchParams.get('popular') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')

    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'

    if (popular) {
      // Get most popular tags based on usage
      const tags = await prisma.blogTag.findMany({
        include: {
          _count: {
            select: {
              blogPosts: isAdmin ? true : {
                where: {
                  published: true,
                  status: 'PUBLISHED'
                }
              }
            }
          }
        },
        orderBy: {
          blogPosts: {
            _count: 'desc'
          }
        },
        take: limit
      })

      // Filter out tags with no published posts for non-admins
      const filteredTags = tags.filter(tag => 
        isAdmin || tag._count.blogPosts > 0
      )

      return NextResponse.json(filteredTags)
    } else {
      // Get all tags
      const tags = await prisma.blogTag.findMany({
        include: {
          _count: {
            select: {
              blogPosts: isAdmin ? true : {
                where: {
                  published: true,
                  status: 'PUBLISHED'
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' },
        take: limit
      })

      return NextResponse.json(tags)
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
    const session = await getServerSession(authOptions)
    
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

    // Check if name is unique
    const existingName = await prisma.blogTag.findUnique({
      where: { name: data.name }
    })

    if (existingName) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 400 }
      )
    }

    // Create the tag
    const tag = await prisma.blogTag.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        color: data.color
      },
      include: {
        _count: {
          select: {
            blogPosts: true
          }
        }
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
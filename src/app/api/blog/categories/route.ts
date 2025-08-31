import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  color: z.string().optional(),
  parentId: z.string().optional(),
  orderIndex: z.number().default(0),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
})

// GET /api/blog/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const hierarchical = searchParams.get('hierarchical') === 'true'

    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'

    const where = {
      ...(!includeInactive && !isAdmin && { isActive: true })
    }

    if (hierarchical) {
      // Get categories in hierarchical structure
      const categories = await prisma.category.findMany({
        where: {
          ...where,
          parentId: null // Root categories only
        },
        include: {
          children: {
            where,
            include: {
              children: {
                where,
                orderBy: { orderIndex: 'asc' }
              },
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
            orderBy: { orderIndex: 'asc' }
          },
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
        orderBy: { orderIndex: 'asc' }
      })

      return NextResponse.json(categories)
    } else {
      // Get flat list of categories
      const categories = await prisma.category.findMany({
        where,
        include: {
          parent: true,
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
        orderBy: { orderIndex: 'asc' }
      })

      return NextResponse.json(categories)
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/blog/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Only admins can create categories
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const json = await request.json()
    const data = createCategorySchema.parse(json)

    // Check if slug is unique
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }

    // Check if name is unique
    const existingName = await prisma.category.findUnique({
      where: { name: data.name }
    })

    if (existingName) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      )
    }

    // Verify parent exists if specified
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId }
      })

      if (!parent) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        )
      }
    }

    // Create the category
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        color: data.color,
        parentId: data.parentId,
        orderIndex: data.orderIndex,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription
      },
      include: {
        parent: true,
        _count: {
          select: {
            blogPosts: true
          }
        }
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
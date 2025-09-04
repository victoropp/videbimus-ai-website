import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  color: z.string().optional()
})

// GET /api/blog/categories - Get all categories
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession()
    const isAdmin = session?.user?.role === 'ADMIN'

    // Get flat list of categories
    const categories = await prisma.category.findMany({
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
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
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
    const session = await getServerSession()
    
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


    // Create the category  
    const categoryData: any = {
      name: data.name,
      slug: data.slug
    };
    
    // Only add optional fields if they are defined
    if (data.description !== undefined) categoryData.description = data.description;
    if (data.color !== undefined) categoryData.color = data.color;

    const category = await prisma.category.create({
      data: categoryData,
      include: {
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
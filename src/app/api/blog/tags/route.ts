import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/blog/tags - Get all tags (from BlogPost.tags String[])
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const popular = searchParams.get('popular') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')

    const session = await getServerSession()
    const isAdmin = session?.user?.role === 'ADMIN'

    // Get all blog posts with tags
    const blogPosts = await prisma.blogPost.findMany({
      where: isAdmin ? {} : { published: true, status: 'PUBLISHED' },
      select: { tags: true },
    })

    // Count tag usage
    const tagCounts = new Map<string, number>()
    blogPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })

    // Convert to array and sort
    let tagsArray = Array.from(tagCounts.entries()).map(([name, count]) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      count,
      _count: { blogPosts: count }
    }))

    if (popular) {
      // Sort by usage count (most popular first)
      tagsArray.sort((a, b) => b.count - a.count)
    } else {
      // Sort alphabetically by name
      tagsArray.sort((a, b) => a.name.localeCompare(b.name))
    }

    // Apply limit
    tagsArray = tagsArray.slice(0, limit)

    return NextResponse.json(tagsArray)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

// Tags are managed as String[] in BlogPost model, not as separate entities
// POST method removed - tags are created/managed when creating/updating blog posts
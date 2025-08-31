import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/blog/search - Advanced search for blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const author = searchParams.get('author') || ''
    const dateFrom = searchParams.get('dateFrom') 
    const dateTo = searchParams.get('dateTo')
    const featured = searchParams.get('featured')
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === 'ADMIN'

    // Build base where clause
    const where: any = {}
    
    // Only show published posts for public search
    if (!isAdmin) {
      where.published = true
      where.status = 'PUBLISHED'
    }

    // Text search with ranking
    if (query.trim()) {
      const searchTerms = query.trim().split(/\s+/)
      
      // Create search conditions for different fields with weights
      const titleConditions = searchTerms.map(term => ({
        title: { contains: term, mode: 'insensitive' as const }
      }))
      
      const excerptConditions = searchTerms.map(term => ({
        excerpt: { contains: term, mode: 'insensitive' as const }
      }))
      
      const contentConditions = searchTerms.map(term => ({
        content: { contains: term, mode: 'insensitive' as const }
      }))

      where.OR = [
        { AND: titleConditions },
        { AND: excerptConditions },
        { AND: contentConditions }
      ]
    }

    // Category filter
    if (category) {
      where.category = {
        slug: category
      }
    }

    // Tags filter
    if (tags.length > 0) {
      where.tags = {
        some: {
          slug: {
            in: tags
          }
        }
      }
    }

    // Author filter
    if (author) {
      where.author = {
        OR: [
          { name: { contains: author, mode: 'insensitive' } },
          { email: { contains: author, mode: 'insensitive' } }
        ]
      }
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.publishedAt = {}
      if (dateFrom) {
        where.publishedAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.publishedAt.lte = new Date(dateTo)
      }
    }

    // Featured filter
    if (featured === 'true') {
      where.featured = true
    } else if (featured === 'false') {
      where.featured = false
    }

    // Get total count
    const total = await prisma.blogPost.count({ where })

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }
    
    switch (sortBy) {
      case 'date':
        orderBy = { publishedAt: 'desc' }
        break
      case 'views':
        orderBy = { views: 'desc' }
        break
      case 'likes':
        orderBy = { likes: 'desc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      case 'relevance':
      default:
        // For relevance, we'll use a combination of factors
        if (query.trim()) {
          // Use database-specific text search ranking when available
          orderBy = [
            { featured: 'desc' },
            { views: 'desc' },
            { createdAt: 'desc' }
          ]
        } else {
          orderBy = { createdAt: 'desc' }
        }
        break
    }

    // Execute search
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
        images: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            comments: {
              where: { isApproved: true }
            }
          }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    })

    // Calculate relevance scores if text search
    let rankedPosts = posts
    
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/)
      
      rankedPosts = posts.map(post => {
        let score = 0
        const titleLower = post.title.toLowerCase()
        const excerptLower = (post.excerpt || '').toLowerCase()
        const contentLower = post.content.toLowerCase()
        
        // Title matches (highest weight)
        searchTerms.forEach(term => {
          if (titleLower.includes(term)) score += 10
        })
        
        // Exact title match bonus
        if (titleLower.includes(query.toLowerCase())) score += 20
        
        // Excerpt matches (medium weight)
        searchTerms.forEach(term => {
          if (excerptLower.includes(term)) score += 5
        })
        
        // Content matches (lower weight)
        searchTerms.forEach(term => {
          const matches = (contentLower.match(new RegExp(term, 'g')) || []).length
          score += matches * 1
        })
        
        // Boost for featured posts
        if (post.featured) score += 5
        
        // Boost for popular posts
        score += Math.log(post.views + 1) * 0.1
        score += Math.log(post.likes + 1) * 0.2
        
        return { ...post, relevanceScore: score }
      })
      
      if (sortBy === 'relevance') {
        rankedPosts.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      }
    }

    // Add read times and clean up
    const finalPosts = rankedPosts.map(post => ({
      ...post,
      readTime: post.readTime || Math.ceil(post.content.split(' ').length / 200),
      commentCount: post._count.comments,
      // Remove _count from response
      _count: undefined
    }))

    // Get search suggestions
    const suggestions = []
    
    if (query.trim() && total === 0) {
      // Get popular tags and categories as suggestions
      const popularTags = await prisma.blogTag.findMany({
        include: {
          _count: {
            select: {
              blogPosts: isAdmin ? true : {
                where: { published: true, status: 'PUBLISHED' }
              }
            }
          }
        },
        orderBy: {
          blogPosts: { _count: 'desc' }
        },
        take: 5
      })
      
      const popularCategories = await prisma.category.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              blogPosts: isAdmin ? true : {
                where: { published: true, status: 'PUBLISHED' }
              }
            }
          }
        },
        orderBy: {
          blogPosts: { _count: 'desc' }
        },
        take: 5
      })
      
      suggestions.push(
        ...popularTags.filter(t => t._count.blogPosts > 0).map(t => ({ type: 'tag', name: t.name, slug: t.slug })),
        ...popularCategories.filter(c => c._count.blogPosts > 0).map(c => ({ type: 'category', name: c.name, slug: c.slug }))
      )
    }

    return NextResponse.json({
      posts: finalPosts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      query: {
        text: query,
        category,
        tags,
        author,
        dateFrom,
        dateTo,
        featured,
        sortBy
      },
      suggestions: suggestions.slice(0, 10)
    })
  } catch (error) {
    console.error('Error searching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to search blog posts' },
      { status: 500 }
    )
  }
}
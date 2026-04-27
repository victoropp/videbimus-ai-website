import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { PostStatus } from '@/types'

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  metaContent: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  featured: z.boolean().default(false),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).default([]),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.array(z.string()).default([]),
  featuredImage: z.string().optional(),
  publishedAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
})

// Helper function for safe integer parsing
const parsePositiveInt = (value: string | null, defaultValue: number): number => {
  const parsed = parseInt(value || String(defaultValue));
  return Number.isNaN(parsed) || parsed < 1 ? defaultValue : parsed;
};

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
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), 10), 50);

    // Type-safe sortBy validation
    type SortField = 'createdAt' | 'updatedAt' | 'title' | 'views' | 'publishedAt';
    const sortByParam = searchParams.get('sortBy') as SortField | null;
    const validSorts: SortField[] = ['createdAt', 'updatedAt', 'title', 'views', 'publishedAt'];
    const sortBy: SortField = sortByParam && validSorts.includes(sortByParam) ? sortByParam : 'createdAt';

    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

    // Build where clause for filtering
    const where: any = {}
    
    // Only show published posts for public API unless admin
    const session = await getServerSession()
    const isAdmin = session?.user?.role === 'ADMIN'
    
    if (!isAdmin) {
      where.published = true
      where.status = 'PUBLISHED' as PostStatus
    } else if (status) {
      where.status = status as PostStatus
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
      where.postTags = {
        some: {
          tag: {
            slug: {
              in: tags
            }
          }
        }
      }
    }

    // Author filtering removed - author relation not defined in Prisma schema
    // Only authorId field exists. To enable author filtering, add User relation to BlogPost model
    if (author) {
      // where.authorId = author // Can only filter by exact authorId, not by name
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
        postTags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Calculate read time for posts that don't have it and format tags
    const postsWithReadTime = posts.map(post => ({
      ...post,
      readTime: post.readTime || Math.ceil(post.content.split(' ').length / 200), // ~200 words per minute
      commentCount: 0, // Comments not implemented yet
      tags: post.postTags?.map(pt => pt.tag.name) || [] // Convert tag relations to string array for backwards compatibility
    }))

    // Get filter options
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
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
    // Return static fallback articles when DB is unavailable (e.g. Vercel deployment)
    return NextResponse.json(STATIC_POSTS)
  }
}

const STATIC_POSTS = {
  posts: [
    {
      id: '1',
      title: 'How AI is Transforming the Oil & Gas Industry',
      slug: 'ai-transforming-oil-gas-industry',
      excerpt: 'From predictive maintenance to real-time equipment diagnostics, discover how Videbimus AI helped Petroverse reduce unplanned downtime by 45% and cut operational costs by 25%.',
      content: '',
      status: 'PUBLISHED',
      published: true,
      featured: true,
      featuredImage: null,
      authorId: '1',
      categoryId: '1',
      readTime: 7,
      views: 0,
      publishedAt: new Date('2025-01-15').toISOString(),
      createdAt: new Date('2025-01-15').toISOString(),
      updatedAt: new Date('2025-01-15').toISOString(),
      author: { id: '1', name: 'Videbimus AI Team', email: 'consulting@videbimusai.com', image: null, role: 'ADMIN' },
      category: { id: '1', name: 'Case Studies', slug: 'case-studies', description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      postTags: [],
      tags: ['AI', 'Oil & Gas', 'Predictive Maintenance'],
      commentCount: 0,
    },
    {
      id: '2',
      title: 'AI-Powered Fraud Detection: Lessons from Insurance',
      slug: 'ai-fraud-detection-insurance',
      excerpt: 'INSURE360 achieved 98.5% fraud detection accuracy and 70% faster claims processing after deploying our custom NLP and machine learning pipeline. Here is how we did it.',
      content: '',
      status: 'PUBLISHED',
      published: true,
      featured: false,
      featuredImage: null,
      authorId: '1',
      categoryId: '2',
      readTime: 6,
      views: 0,
      publishedAt: new Date('2025-02-10').toISOString(),
      createdAt: new Date('2025-02-10').toISOString(),
      updatedAt: new Date('2025-02-10').toISOString(),
      author: { id: '1', name: 'Videbimus AI Team', email: 'consulting@videbimusai.com', image: null, role: 'ADMIN' },
      category: { id: '2', name: 'Industry Insights', slug: 'industry-insights', description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      postTags: [],
      tags: ['AI', 'Insurance', 'Fraud Detection', 'NLP'],
      commentCount: 0,
    },
    {
      id: '3',
      title: 'Building an AI Strategy That Actually Delivers ROI',
      slug: 'ai-strategy-roi',
      excerpt: 'Most AI projects fail not because of the technology but because of poor strategic alignment. Our discovery framework helps businesses identify high-impact use cases before writing a single line of code.',
      content: '',
      status: 'PUBLISHED',
      published: true,
      featured: false,
      featuredImage: null,
      authorId: '1',
      categoryId: '3',
      readTime: 8,
      views: 0,
      publishedAt: new Date('2025-03-05').toISOString(),
      createdAt: new Date('2025-03-05').toISOString(),
      updatedAt: new Date('2025-03-05').toISOString(),
      author: { id: '1', name: 'Videbimus AI Team', email: 'consulting@videbimusai.com', image: null, role: 'ADMIN' },
      category: { id: '3', name: 'Strategy', slug: 'strategy', description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      postTags: [],
      tags: ['Strategy', 'ROI', 'AI Readiness'],
      commentCount: 0,
    },
    {
      id: '4',
      title: 'Natural Language Processing for African Languages',
      slug: 'nlp-african-languages',
      excerpt: 'Building NLP models that understand Twi, Hausa, and Pidgin English presents unique challenges. We share our approach to low-resource language modelling for West African markets.',
      content: '',
      status: 'PUBLISHED',
      published: true,
      featured: false,
      featuredImage: null,
      authorId: '1',
      categoryId: '2',
      readTime: 9,
      views: 0,
      publishedAt: new Date('2025-03-20').toISOString(),
      createdAt: new Date('2025-03-20').toISOString(),
      updatedAt: new Date('2025-03-20').toISOString(),
      author: { id: '1', name: 'Videbimus AI Team', email: 'consulting@videbimusai.com', image: null, role: 'ADMIN' },
      category: { id: '2', name: 'Industry Insights', slug: 'industry-insights', description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      postTags: [],
      tags: ['NLP', 'Africa', 'Language Models'],
      commentCount: 0,
    },
    {
      id: '5',
      title: 'From Spreadsheets to AI: A Practical Guide for SMEs',
      slug: 'spreadsheets-to-ai-smes',
      excerpt: 'Small and medium enterprises do not need enterprise budgets to benefit from AI. Discover affordable entry points, from automated reporting to demand forecasting, that deliver real business value.',
      content: '',
      status: 'PUBLISHED',
      published: true,
      featured: false,
      featuredImage: null,
      authorId: '1',
      categoryId: '3',
      readTime: 5,
      views: 0,
      publishedAt: new Date('2025-04-01').toISOString(),
      createdAt: new Date('2025-04-01').toISOString(),
      updatedAt: new Date('2025-04-01').toISOString(),
      author: { id: '1', name: 'Videbimus AI Team', email: 'consulting@videbimusai.com', image: null, role: 'ADMIN' },
      category: { id: '3', name: 'Strategy', slug: 'strategy', description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      postTags: [],
      tags: ['SME', 'Data Analytics', 'Business Intelligence'],
      commentCount: 0,
    },
    {
      id: '6',
      title: 'The Ethics of AI in Healthcare: A Framework for Africa',
      slug: 'ai-ethics-healthcare-africa',
      excerpt: 'Deploying AI diagnostic tools in under-resourced healthcare settings requires careful attention to bias, consent, and data sovereignty. We outline a practical ethical framework for African health systems.',
      content: '',
      status: 'PUBLISHED',
      published: true,
      featured: false,
      featuredImage: null,
      authorId: '1',
      categoryId: '2',
      readTime: 10,
      views: 0,
      publishedAt: new Date('2025-04-18').toISOString(),
      createdAt: new Date('2025-04-18').toISOString(),
      updatedAt: new Date('2025-04-18').toISOString(),
      author: { id: '1', name: 'Videbimus AI Team', email: 'consulting@videbimusai.com', image: null, role: 'ADMIN' },
      category: { id: '2', name: 'Industry Insights', slug: 'industry-insights', description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      postTags: [],
      tags: ['Healthcare', 'AI Ethics', 'Africa'],
      commentCount: 0,
    },
  ],
  pagination: { page: 1, limit: 9, total: 6, pages: 1 },
  filters: {
    categories: [
      { id: '1', name: 'Case Studies', slug: 'case-studies', description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '2', name: 'Industry Insights', slug: 'industry-insights', description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: '3', name: 'Strategy', slug: 'strategy', description: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    tags: [],
    authors: [{ id: '1', name: 'Videbimus AI Team', email: 'consulting@videbimusai.com', image: null, role: 'ADMIN' }],
  },
}

// POST /api/blog/posts - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
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

    // Create the post with tags in a transaction
    const postData: any = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      status: data.status,
      published: data.status === 'PUBLISHED',
      featured: data.featured,
      authorId: session.user.id,
      readTime: Math.ceil(data.content.split(' ').length / 200)
    };

    // Add optional fields only if they are defined
    if (data.excerpt !== undefined) postData.excerpt = data.excerpt;
    if (data.publishedAt !== undefined) postData.publishedAt = data.publishedAt;
    if (data.categoryId !== undefined) postData.categoryId = data.categoryId;
    if (data.seoTitle !== undefined) postData.seoTitle = data.seoTitle;
    if (data.seoDescription !== undefined) postData.seoDescription = data.seoDescription;

    // Use transaction to ensure atomicity
    const post = await prisma.$transaction(async (tx) => {
      // Create the blog post
      const newPost = await tx.blogPost.create({
        data: postData,
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
          postTags: {
            include: {
              tag: true
            }
          }
        }
      });

      // Handle tag associations if tagIds were provided
      if (data.tagIds && data.tagIds.length > 0) {
        await tx.blogPostTag.createMany({
          data: data.tagIds.map(tagId => ({
            postId: newPost.id,
            tagId: tagId
          }))
        });
      }

      // Return the post with tags included
      return await tx.blogPost.findUnique({
        where: { id: newPost.id },
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
          postTags: {
            include: {
              tag: true
            }
          }
        }
      });
    })

    // Revision tracking not implemented yet
    // await prisma.blogRevision.create({
    //   data: {
    //     title: data.title,
    //     excerpt: data.excerpt,
    //     content: data.content,
    //     authorId: session.user.id,
    //     blogPostId: post.id,
    //     version: 1,
    //     changeNote: 'Initial version'
    //   }
    // })

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
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://videbimus.com'
    
    // Get published blog posts
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        status: 'PUBLISHED'
      },
      select: {
        slug: true,
        publishedAt: true,
        updatedAt: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })

    // Get categories
    const categories = await prisma.category.findMany({
      where: {
        blogPosts: {
          some: {
            published: true,
            status: 'PUBLISHED'
          }
        }
      },
      select: {
        slug: true,
        updatedAt: true
      }
    })

    // Get unique tags from blog posts (tags are String[] in BlogPost)
    const blogPostsWithTags = await prisma.blogPost.findMany({
      where: {
        published: true,
        status: 'PUBLISHED'
      },
      select: {
        tags: true,
        updatedAt: true
      }
    })

    // Extract unique tags with their most recent update
    const tagMap = new Map<string, Date>()
    blogPostsWithTags.forEach(post => {
      post.tags.forEach(tag => {
        const currentDate = tagMap.get(tag)
        if (!currentDate || post.updatedAt > currentDate) {
          tagMap.set(tag, post.updatedAt)
        }
      })
    })

    const tags = Array.from(tagMap.entries()).map(([tag, updatedAt]) => ({
      slug: tag.toLowerCase().replace(/\s+/g, '-'),
      updatedAt
    }))

    // Generate sitemap entries
    const staticPages = [
      {
        url: `${baseUrl}/`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        url: `${baseUrl}/about`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
      },
      {
        url: `${baseUrl}/services`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
      },
      {
        url: `${baseUrl}/blog`,
        lastmod: posts.length > 0 ? (posts[0].publishedAt || posts[0].updatedAt).toISOString() : new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.9'
      },
      {
        url: `${baseUrl}/contact`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        url: `${baseUrl}/case-studies`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.8'
      },
      {
        url: `${baseUrl}/ai`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.8'
      }
    ]

    const blogPosts = posts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastmod: (post.publishedAt || post.updatedAt).toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    }))

    const categoryPages = categories.map(category => ({
      url: `${baseUrl}/blog/category/${category.slug}`,
      lastmod: category.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.6'
    }))

    const tagPages = tags.map(tag => ({
      url: `${baseUrl}/blog/tag/${tag.slug}`,
      lastmod: tag.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.5'
    }))

    const allPages = [...staticPages, ...blogPosts, ...categoryPages, ...tagPages]

    // Generate XML
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`

    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 }
    )
  }
}
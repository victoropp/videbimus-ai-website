import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://vidibemus.com'
    
    // Get published blog posts
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        tags: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      take: 50 // Limit to last 50 posts
    })

    // Generate RSS XML
    const rssItems = posts.map(post => {
      const pubDate = post.publishedAt || post.createdAt
      const categories = [
        ...(post.category ? [post.category.name] : []),
        ...post.tags.map(tag => tag.name)
      ]

      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <description><![CDATA[${post.excerpt || post.content.substring(0, 200) + '...'}]]></description>
          <link>${baseUrl}/blog/${post.slug}</link>
          <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
          <pubDate>${pubDate.toUTCString()}</pubDate>
          <author>${post.author.email} (${post.author.name})</author>
          ${categories.map(cat => `<category><![CDATA[${cat}]]></category>`).join('')}
          ${post.featuredImage ? `<enclosure url="${baseUrl}${post.featuredImage}" type="image/jpeg" />` : ''}
        </item>
      `
    }).join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom/">
  <channel>
    <title>Vidibemus AI - Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Latest insights on AI, machine learning, and data science from Vidibemus AI experts</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>en-US</language>
    <sy:updatePeriod xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">hourly</sy:updatePeriod>
    <sy:updateFrequency xmlns:sy="http://purl.org/rss/1.0/modules/syndication/">1</sy:updateFrequency>
    <generator>Vidibemus AI Blog System</generator>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <title>Vidibemus AI</title>
      <url>${baseUrl}/logo.png</url>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
      <description>Vidibemus AI Logo</description>
    </image>
    ${rssItems}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error generating RSS feed:', error)
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    )
  }
}
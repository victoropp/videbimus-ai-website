import { MetadataRoute } from 'next'

/**
 * Dynamic Sitemap Generation
 * Automatically generates sitemap.xml with all public routes
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://videbimus.ai'

  // Static routes
  const routes = [
    '',
    '/about',
    '/services',
    '/ai',
    '/contact',
    '/blog',
    '/case-studies',
    '/consultation',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/blog' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/blog' ? 0.9 : 0.8,
  }))

  // Fetch blog posts for sitemap
  let blogPosts: any[] = []
  try {
    const response = await fetch(`${baseUrl}/api/blog/posts?limit=100&status=PUBLISHED`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    if (response.ok) {
      const data = await response.json()
      blogPosts = data.posts || []
    }
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
  }

  // Add blog post URLs
  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.createdAt),
    changeFrequency: 'monthly' as const,
    priority: post.featured ? 0.9 : 0.7,
  }))

  // Fetch case studies for sitemap
  let caseStudies: any[] = []
  try {
    const response = await fetch(`${baseUrl}/api/case-studies?limit=50`, {
      next: { revalidate: 3600 }
    })
    if (response.ok) {
      const data = await response.json()
      caseStudies = data.caseStudies || []
    }
  } catch (error) {
    console.error('Error fetching case studies for sitemap:', error)
  }

  // Add case study URLs
  const caseStudyUrls = caseStudies.map((study) => ({
    url: `${baseUrl}/case-studies/${study.slug}`,
    lastModified: new Date(study.updatedAt || study.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...routes, ...blogUrls, ...caseStudyUrls]
}

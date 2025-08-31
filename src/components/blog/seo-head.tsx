import Head from 'next/head'
import type { BlogPost, BlogCategory } from '@/types'

interface SEOHeadProps {
  post?: BlogPost
  category?: BlogCategory
  isHomePage?: boolean
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
}

export default function SEOHead({
  post,
  category,
  isHomePage = false,
  title,
  description,
  keywords = [],
  image,
  url
}: SEOHeadProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vidibemus.com'
  const siteName = 'Vidibemus AI'
  const defaultDescription = 'Latest insights on AI, machine learning, and data science from Vidibemus AI experts'
  const defaultImage = `${siteUrl}/og-image.jpg`

  // Generate page-specific metadata
  let pageTitle = siteName
  let pageDescription = defaultDescription
  let pageImage = image || defaultImage
  let pageUrl = url || siteUrl
  let pageKeywords = [...keywords, 'AI', 'Machine Learning', 'Data Science', 'Vidibemus']

  if (post) {
    pageTitle = post.seoTitle || `${post.title} | ${siteName}`
    pageDescription = post.seoDescription || post.excerpt || defaultDescription
    pageImage = post.featuredImage ? `${siteUrl}${post.featuredImage}` : defaultImage
    pageUrl = `${siteUrl}/blog/${post.slug}`
    pageKeywords = [...(post.seoKeywords || []), ...post.tags.map(tag => tag.name), ...pageKeywords]
  } else if (category) {
    pageTitle = category.seoTitle || `${category.name} | Blog | ${siteName}`
    pageDescription = category.seoDescription || category.description || `Latest ${category.name.toLowerCase()} articles from ${siteName}`
    pageUrl = `${siteUrl}/blog/category/${category.slug}`
  } else if (title) {
    pageTitle = `${title} | ${siteName}`
    pageDescription = description || defaultDescription
  } else if (isHomePage) {
    pageTitle = `Blog | ${siteName}`
    pageDescription = defaultDescription
    pageUrl = `${siteUrl}/blog`
  }

  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: siteName,
        description: 'AI and Machine Learning Consulting Services',
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: `${siteUrl}/blog/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        ]
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${siteUrl}/#logo`,
          url: `${siteUrl}/logo.png`,
          width: 400,
          height: 400,
          caption: siteName
        },
        sameAs: [
          'https://twitter.com/vidibemusai',
          'https://linkedin.com/company/vidibemus'
        ]
      }
    ]
  }

  if (post) {
    const articleStructuredData = {
      '@type': 'Article',
      '@id': `${pageUrl}/#article`,
      isPartOf: {
        '@id': `${siteUrl}/#website`
      },
      author: {
        '@type': 'Person',
        name: post.author.name,
        '@id': `${siteUrl}/authors/${post.author.id}`
      },
      headline: post.title,
      datePublished: post.publishedAt || post.createdAt,
      dateModified: post.updatedAt,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl
      },
      publisher: {
        '@id': `${siteUrl}/#organization`
      },
      image: {
        '@type': 'ImageObject',
        '@id': `${pageUrl}/#primaryimage`,
        url: pageImage,
        width: 1200,
        height: 630
      },
      articleSection: post.category?.name || 'Technology',
      keywords: pageKeywords.join(', '),
      description: pageDescription,
      wordCount: post.content.split(' ').length,
      timeRequired: `PT${post.readTime || Math.ceil(post.content.split(' ').length / 200)}M`
    }

    if (post.category) {
      articleStructuredData.articleSection = post.category.name
    }

    structuredData['@graph'].push(articleStructuredData)
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords.join(', ')} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={post ? 'article' : 'website'} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:locale" content="en_US" />

      {post && (
        <>
          <meta property="article:published_time" content={new Date(post.publishedAt || post.createdAt).toISOString()} />
          <meta property="article:modified_time" content={new Date(post.updatedAt).toISOString()} />
          <meta property="article:author" content={post.author.name} />
          {post.category && <meta property="article:section" content={post.category.name} />}
          {post.tags.map(tag => (
            <meta key={tag.id} property="article:tag" content={tag.name} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@vidibemusai" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content={post?.author.name || siteName} />

      {/* Favicon and App Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* RSS Feed */}
      <link rel="alternate" type="application/rss+xml" title={`${siteName} RSS Feed`} href="/rss.xml" />

      {/* Structured Data */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} 
      />

      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Additional Performance Hints */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    </Head>
  )
}
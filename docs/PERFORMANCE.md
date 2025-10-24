# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in the VidebimusAI website and best practices for maintaining optimal performance.

## Performance Goals

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

### Lighthouse Scores
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

## Optimizations Implemented

### 1. Code Splitting

Heavy components are dynamically imported to reduce initial bundle size.

**Admin Pages** (`/src/app/admin/blog/page.tsx`)
```typescript
import dynamic from 'next/dynamic'

const motion = dynamic(() => import('framer-motion'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})
```

**AI Demos** (`/src/app/ai/page.tsx`)
```typescript
const ChatInterface = dynamic(() => import('@/components/ai/chat-interface'), {
  loading: () => <Spinner />,
  ssr: false
})
```

**Monaco Editor** (`/src/components/blog/blog-editor.tsx`)
```typescript
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
})
```

### 2. Image Optimization

All images use Next.js Image component for automatic optimization.

**Before:**
```tsx
<img src="/image.jpg" alt="Description" />
```

**After:**
```tsx
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

**Benefits:**
- Automatic WebP/AVIF conversion
- Responsive images
- Lazy loading
- Blur placeholder
- Reduced image sizes

### 3. Performance Monitoring

Real-time performance tracking using Web Vitals.

**Implementation** (`/src/lib/web-vitals.ts`)
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

export function reportWebVitals() {
  getCLS(sendToAnalytics)
  getFID(sendToAnalytics)
  getFCP(sendToAnalytics)
  getLCP(sendToAnalytics)
  getTTFB(sendToAnalytics)
}
```

**Monitoring:**
- Core Web Vitals
- Long tasks (> 50ms)
- Layout shifts
- Slow resources (> 1s)
- Bundle sizes
- Memory usage

### 4. Bundle Size Optimization

**Current Bundle Sizes:**
- Main bundle: ~150KB (gzipped)
- First Load JS: ~250KB
- Total page weight: < 1MB

**Optimization Techniques:**
- Code splitting
- Tree shaking
- Dynamic imports
- Font optimization
- CSS purging

### 5. Font Optimization

Fonts are optimized using Next.js font optimization.

```typescript
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})
```

**Benefits:**
- Self-hosted fonts
- Automatic subsetting
- Font preloading
- No layout shift

### 6. Caching Strategy

**Static Assets:**
```
Cache-Control: public, max-age=31536000, immutable
```

**API Responses:**
```typescript
export const revalidate = 3600 // Revalidate every hour
```

**ISR (Incremental Static Regeneration):**
- Blog posts: 1 hour revalidation
- Static pages: On-demand revalidation

### 7. Database Optimization

**Query Optimization:**
- Use proper indexes
- Limit query results
- Use select to fetch only needed fields
- Implement pagination

```prisma
// Efficient query
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    excerpt: true
  },
  take: 10,
  skip: (page - 1) * 10,
  where: { published: true },
  orderBy: { createdAt: 'desc' }
})
```

## Performance Monitoring

### Automated Monitoring

**Web Vitals Dashboard:**
```bash
npm run dev
# Visit http://localhost:3000
# Open DevTools Console to see Web Vitals
```

**Lighthouse CI:**
```bash
npm run test:lighthouse
```

**Bundle Analysis:**
```bash
npm run build
# Check .next/analyze/ for bundle analysis
```

### Manual Testing

**Chrome DevTools:**
1. Open DevTools
2. Go to Lighthouse tab
3. Generate report
4. Analyze metrics

**WebPageTest:**
- Visit [webpagetest.org](https://www.webpagetest.org)
- Enter site URL
- Analyze waterfall and metrics

## Performance Best Practices

### 1. Avoid Blocking the Main Thread

**Bad:**
```typescript
// Heavy synchronous computation
function processLargeArray() {
  for (let i = 0; i < 1000000; i++) {
    // Heavy computation
  }
}
```

**Good:**
```typescript
// Use web workers or chunking
async function processLargeArray() {
  await new Promise(resolve => setTimeout(resolve, 0))
  // Process in chunks
}
```

### 2. Optimize Re-renders

**Bad:**
```typescript
function Component() {
  const data = expensiveCalculation()
  return <div>{data}</div>
}
```

**Good:**
```typescript
function Component() {
  const data = useMemo(() => expensiveCalculation(), [deps])
  return <div>{data}</div>
}
```

### 3. Lazy Load Components

**Load on visibility:**
```typescript
import { lazy, Suspense } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### 4. Optimize Images

**Checklist:**
- Use Next.js Image component
- Set proper width/height
- Use priority for above-fold images
- Use blur placeholder
- Set appropriate sizes prop

### 5. Minimize Third-Party Scripts

**Avoid:**
- Multiple analytics scripts
- Heavy marketing pixels
- Unnecessary widgets

**Use Script component:**
```typescript
import Script from 'next/script'

<Script
  src="https://example.com/script.js"
  strategy="lazyOnload"
/>
```

### 6. Optimize API Calls

**Bad:**
```typescript
// Multiple sequential calls
const user = await fetch('/api/user')
const posts = await fetch('/api/posts')
const comments = await fetch('/api/comments')
```

**Good:**
```typescript
// Parallel calls
const [user, posts, comments] = await Promise.all([
  fetch('/api/user'),
  fetch('/api/posts'),
  fetch('/api/comments')
])
```

### 7. Use Proper Loading States

```typescript
function Component() {
  const { data, isLoading } = useQuery()

  if (isLoading) return <Skeleton />
  if (!data) return <Empty />

  return <Content data={data} />
}
```

## Performance Budget

### Bundle Size Budget
- Main bundle: < 200KB (gzipped)
- First Load JS: < 300KB
- Each route: < 50KB

### Performance Budget
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Time to Interactive: < 3.5s

## Monitoring in Production

### Analytics Integration

Web Vitals are sent to analytics:
```typescript
function sendToAnalytics(metric: Metric) {
  fetch('/api/analytics/vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
    keepalive: true
  })
}
```

### Performance Dashboard

Create a dashboard to track:
- Web Vitals over time
- Page load times
- API response times
- Error rates
- User geography

## Troubleshooting

### Slow Page Load

**Check:**
1. Waterfall in Network tab
2. Blocking resources
3. Large images
4. Third-party scripts
5. Database query times

### High CLS

**Common causes:**
- Images without dimensions
- Dynamically injected content
- Web fonts causing layout shift

**Solutions:**
- Set explicit dimensions
- Use font-display: swap
- Reserve space for dynamic content

### Poor LCP

**Common causes:**
- Large images
- Render-blocking resources
- Slow server response

**Solutions:**
- Optimize largest image
- Use priority on hero images
- Implement CDN
- Optimize database queries

### Memory Leaks

**Check:**
1. DevTools Memory profiler
2. Heap snapshots
3. Event listeners
4. Timers and intervals

**Prevention:**
- Clean up in useEffect
- Remove event listeners
- Clear timers

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)

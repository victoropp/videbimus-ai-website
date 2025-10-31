# Quick Image Reference Guide

## Blog Images

```tsx
// Hero
/images/blog/hero-knowledge-sharing.jpg (1920x1080)

// Featured Article
/images/blog/featured-ai-future-business.jpg (1200x630)

// Articles
/images/blog/article-data-pipelines.jpg (800x400)
/images/blog/article-mlops-practices.jpg (800x400)
/images/blog/article-ai-ethics.jpg (800x400)
/images/blog/article-computer-vision-manufacturing.jpg (800x400)
/images/blog/article-nlp-customer-service.jpg (800x400)
/images/blog/article-ai-generic.jpg (800x400)

// Authors
/images/blog/author-1.jpg (200x200)
/images/blog/author-2.jpg (200x200)
/images/blog/author-3.jpg (200x200)
/images/blog/author-4.jpg (200x200)

// Categories
/images/blog/category-ai-ml.jpg (600x300)
/images/blog/category-data-science.jpg (600x300)
/images/blog/category-business-strategy.jpg (600x300)
/images/blog/category-case-studies.jpg (600x300)
/images/blog/category-industry-news.jpg (600x300)
/images/blog/category-tutorials.jpg (600x300)
/images/blog/category-best-practices.jpg (600x300)
/images/blog/category-company-updates.jpg (600x300)
```

## AI Playground Images

```tsx
// Hero
/images/ai-playground/hero-interactive-ai.jpg (1920x1080)

// Demos
/images/ai-playground/demo-question-answering.jpg (800x600)
/images/ai-playground/demo-sentiment-analysis.jpg (800x600)
/images/ai-playground/demo-text-summarization.jpg (800x600)
/images/ai-playground/demo-entity-recognition.jpg (800x600)

// Tech Stack
/images/ai-playground/tech-openai-models.jpg (600x400)
/images/ai-playground/tech-realtime-processing.jpg (600x400)
/images/ai-playground/tech-api-integration.jpg (600x400)
```

## Billing Images

```tsx
// Hero
/images/billing/hero-billing-dashboard.jpg (1200x800)

// Payment Methods
/images/billing/payment-credit-card.jpg (600x400)
/images/billing/payment-processing.jpg (600x400)
/images/billing/payment-automation.jpg (600x400)

// Tiers
/images/billing/tier-starter.jpg (600x400)
/images/billing/tier-professional.jpg (600x400)
/images/billing/tier-enterprise.jpg (600x400)
```

## Auth Images

```tsx
// Pages
/images/auth/signin-secure-login.jpg (1200x1600)
/images/auth/signup-welcome.jpg (1200x1600)
/images/auth/error-friendly.jpg (800x600)
/images/auth/success-verification.jpg (600x400)
```

## Consultation Images

```tsx
// Hero
/images/consultation/hero-consultation-hub.jpg (1920x1080)

// Booking
/images/consultation/book-calendar.jpg (800x600)
/images/consultation/book-video-prep.jpg (800x600)
/images/consultation/book-confirmation.jpg (800x600)

// Video Calls
/images/consultation/video-call-professional.jpg (1200x800)
/images/consultation/video-call-screen-sharing.jpg (1200x800)
/images/consultation/video-call-whiteboard.jpg (1200x800)

// Process
/images/consultation/process-preparation.jpg (600x400)
/images/consultation/process-active-consultation.jpg (600x400)
/images/consultation/process-followup.jpg (600x400)
```

## Usage Example

```tsx
import Image from 'next/image';

// Hero Image (priority loading)
<Image
  src="/images/blog/hero-knowledge-sharing.jpg"
  alt="Knowledge Sharing"
  width={1920}
  height={1080}
  priority
  className="w-full h-auto"
/>

// Regular Image (lazy loading)
<Image
  src="/images/billing/tier-enterprise.jpg"
  alt="Enterprise Tier"
  width={600}
  height={400}
  className="rounded-lg"
/>

// Avatar Image
<Image
  src="/images/blog/author-1.jpg"
  alt="Author Name"
  width={200}
  height={200}
  className="rounded-full"
/>
```

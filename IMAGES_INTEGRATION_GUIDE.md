# Quick Integration Guide - New Images

## Copy-Paste Ready Code Snippets

### BLOG PAGES

#### Blog Listing Page Hero
```tsx
<Image
  src="/images/blog/hero-knowledge-sharing.jpg"
  alt="AI Knowledge Sharing and Thought Leadership"
  width={1920}
  height={1080}
  priority
  className="w-full h-[500px] object-cover"
/>
```

#### Featured Article
```tsx
<Image
  src="/images/blog/featured-ai-future-business.jpg"
  alt="The Future of AI in Business Transformation"
  width={1200}
  height={630}
  className="w-full rounded-lg shadow-lg"
/>
```

#### Article Preview Card
```tsx
<Image
  src="/images/blog/article-data-pipelines.jpg"
  alt="Building Efficient Data Pipelines"
  width={800}
  height={400}
  className="w-full h-48 object-cover rounded-t-lg"
/>
```

#### Author Avatar
```tsx
<Image
  src="/images/blog/author-1.jpg"
  alt="Sarah Johnson - AI Solutions Architect"
  width={200}
  height={200}
  className="w-12 h-12 rounded-full border-2 border-white"
/>
```

#### Category Header
```tsx
<Image
  src="/images/blog/category-ai-ml.jpg"
  alt="AI & Machine Learning Articles"
  width={600}
  height={300}
  className="w-full h-32 object-cover rounded-lg"
/>
```

---

### AI PLAYGROUND

#### Playground Hero
```tsx
<Image
  src="/images/ai-playground/hero-interactive-ai.jpg"
  alt="Interactive AI Demonstrations"
  width={1920}
  height={1080}
  priority
  className="w-full h-[400px] object-cover"
/>
```

#### Demo Feature Card
```tsx
<Image
  src="/images/ai-playground/demo-question-answering.jpg"
  alt="AI Question Answering Demo"
  width={800}
  height={600}
  className="w-full h-64 object-cover rounded-lg mb-4"
/>
```

#### Technology Stack
```tsx
<Image
  src="/images/ai-playground/tech-openai-models.jpg"
  alt="OpenAI Models Integration"
  width={600}
  height={400}
  className="w-full h-48 object-cover rounded-lg"
/>
```

---

### BILLING PAGE

#### Billing Dashboard Hero
```tsx
<Image
  src="/images/billing/hero-billing-dashboard.jpg"
  alt="Subscription & Billing Management"
  width={1200}
  height={800}
  className="w-full h-[350px] object-cover rounded-t-lg"
/>
```

#### Payment Method Icon
```tsx
<Image
  src="/images/billing/payment-credit-card.jpg"
  alt="Credit Card Payment"
  width={600}
  height={400}
  className="w-full h-32 object-cover rounded-lg"
/>
```

#### Subscription Tier Card
```tsx
<Image
  src="/images/billing/tier-enterprise.jpg"
  alt="Enterprise Subscription Tier"
  width={600}
  height={400}
  className="w-full h-48 object-cover rounded-t-lg"
/>
```

---

### AUTH PAGES

#### Sign In Side Panel
```tsx
<div className="hidden lg:block lg:w-1/2 relative">
  <Image
    src="/images/auth/signin-secure-login.jpg"
    alt="Secure Authentication"
    width={1200}
    height={1600}
    className="w-full h-full object-cover"
    priority
  />
  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center justify-center">
    <div className="text-white text-center p-8">
      <h2 className="text-4xl font-bold mb-4">Welcome Back</h2>
      <p className="text-xl">Access your AI-powered dashboard</p>
    </div>
  </div>
</div>
```

#### Sign Up Side Panel
```tsx
<div className="hidden lg:block lg:w-1/2 relative">
  <Image
    src="/images/auth/signup-welcome.jpg"
    alt="Join Videbimus AI"
    width={1200}
    height={1600}
    className="w-full h-full object-cover"
    priority
  />
  <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 flex items-center justify-center">
    <div className="text-white text-center p-8">
      <h2 className="text-4xl font-bold mb-4">Start Your AI Journey</h2>
      <p className="text-xl">Join thousands of businesses leveraging AI</p>
    </div>
  </div>
</div>
```

#### Error State
```tsx
<Image
  src="/images/auth/error-friendly.jpg"
  alt="Something went wrong"
  width={800}
  height={600}
  className="w-64 h-48 object-cover rounded-lg mx-auto mb-6"
/>
```

#### Success State
```tsx
<Image
  src="/images/auth/success-verification.jpg"
  alt="Success! Account verified"
  width={600}
  height={400}
  className="w-48 h-32 object-cover rounded-lg mx-auto mb-4"
/>
```

---

### CONSULTATION PAGES

#### Consultation Hub Hero
```tsx
<Image
  src="/images/consultation/hero-consultation-hub.jpg"
  alt="Consultation Management Hub"
  width={1920}
  height={1080}
  priority
  className="w-full h-[400px] object-cover"
/>
```

#### Booking Calendar
```tsx
<Image
  src="/images/consultation/book-calendar.jpg"
  alt="Schedule Your Consultation"
  width={800}
  height={600}
  className="w-full h-64 object-cover rounded-lg mb-6"
/>
```

#### Video Call Room Background
```tsx
<div className="relative w-full h-[600px]">
  <Image
    src="/images/consultation/video-call-professional.jpg"
    alt="Professional Video Consultation"
    width={1200}
    height={800}
    className="w-full h-full object-cover rounded-lg"
  />
  {/* Video call interface overlays here */}
</div>
```

#### Process Step
```tsx
<Image
  src="/images/consultation/process-preparation.jpg"
  alt="Pre-Consultation Preparation"
  width={600}
  height={400}
  className="w-full h-40 object-cover rounded-lg mb-3"
/>
```

---

## Component Templates

### Blog Article Card Component
```tsx
interface ArticleCardProps {
  title: string;
  excerpt: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  date: string;
}

export function ArticleCard({ title, excerpt, image, author, category, date }: ArticleCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Article Image */}
      <Image
        src={image}
        alt={title}
        width={800}
        height={400}
        className="w-full h-48 object-cover"
      />

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-primary uppercase">{category}</span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>

        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{excerpt}</p>

        {/* Author */}
        <div className="flex items-center gap-3">
          <Image
            src={author.avatar}
            alt={author.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full"
          />
          <span className="text-sm font-medium">{author.name}</span>
        </div>
      </div>
    </div>
  );
}

// Usage:
<ArticleCard
  title="Building Efficient Data Pipelines"
  excerpt="Learn how to create scalable data pipelines that power AI applications..."
  image="/images/blog/article-data-pipelines.jpg"
  author={{
    name: "Sarah Johnson",
    avatar: "/images/blog/author-1.jpg"
  }}
  category="Data Science"
  date="Oct 25, 2025"
/>
```

### AI Playground Demo Card
```tsx
interface DemoCardProps {
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function DemoCard({ title, description, image, icon, onClick }: DemoCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <Image
        src={image}
        alt={title}
        width={800}
        height={600}
        className="w-full h-48 object-cover"
      />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
          <h3 className="text-lg font-bold">{title}</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <button className="w-full btn btn-primary">Try Demo</button>
      </div>
    </div>
  );
}

// Usage:
<DemoCard
  title="Question Answering"
  description="Ask questions and get intelligent AI-powered answers"
  image="/images/ai-playground/demo-question-answering.jpg"
  icon={<MessageSquare className="w-5 h-5" />}
  onClick={() => navigate('/playground/qa')}
/>
```

### Subscription Tier Card
```tsx
interface TierCardProps {
  name: string;
  price: string;
  features: string[];
  image: string;
  highlighted?: boolean;
}

export function TierCard({ name, price, features, image, highlighted }: TierCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${highlighted ? 'ring-2 ring-primary' : ''}`}>
      <Image
        src={image}
        alt={`${name} Tier`}
        width={600}
        height={400}
        className="w-full h-40 object-cover"
      />

      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-gray-600">/month</span>
        </div>

        <ul className="space-y-2 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <button className={`w-full btn ${highlighted ? 'btn-primary' : 'btn-outline'}`}>
          Get Started
        </button>
      </div>
    </div>
  );
}

// Usage:
<TierCard
  name="Enterprise"
  price="$999"
  features={[
    "Unlimited API requests",
    "Dedicated support",
    "Custom integrations",
    "SLA guarantee"
  ]}
  image="/images/billing/tier-enterprise.jpg"
  highlighted={true}
/>
```

---

## File Paths Reference

### Blog (20 images)
```
/images/blog/hero-knowledge-sharing.jpg
/images/blog/featured-ai-future-business.jpg
/images/blog/article-data-pipelines.jpg
/images/blog/article-mlops-practices.jpg
/images/blog/article-ai-ethics.jpg
/images/blog/article-computer-vision-manufacturing.jpg
/images/blog/article-nlp-customer-service.jpg
/images/blog/article-ai-generic.jpg
/images/blog/author-1.jpg
/images/blog/author-2.jpg
/images/blog/author-3.jpg
/images/blog/author-4.jpg
/images/blog/category-ai-ml.jpg
/images/blog/category-data-science.jpg
/images/blog/category-business-strategy.jpg
/images/blog/category-case-studies.jpg
/images/blog/category-industry-news.jpg
/images/blog/category-tutorials.jpg
/images/blog/category-best-practices.jpg
/images/blog/category-company-updates.jpg
```

### AI Playground (8 images)
```
/images/ai-playground/hero-interactive-ai.jpg
/images/ai-playground/demo-question-answering.jpg
/images/ai-playground/demo-sentiment-analysis.jpg
/images/ai-playground/demo-text-summarization.jpg
/images/ai-playground/demo-entity-recognition.jpg
/images/ai-playground/tech-openai-models.jpg
/images/ai-playground/tech-realtime-processing.jpg
/images/ai-playground/tech-api-integration.jpg
```

### Billing (7 images)
```
/images/billing/hero-billing-dashboard.jpg
/images/billing/payment-credit-card.jpg
/images/billing/payment-processing.jpg
/images/billing/payment-automation.jpg
/images/billing/tier-starter.jpg
/images/billing/tier-professional.jpg
/images/billing/tier-enterprise.jpg
```

### Auth (4 images)
```
/images/auth/signin-secure-login.jpg
/images/auth/signup-welcome.jpg
/images/auth/error-friendly.jpg
/images/auth/success-verification.jpg
```

### Consultation (10 images)
```
/images/consultation/hero-consultation-hub.jpg
/images/consultation/book-calendar.jpg
/images/consultation/book-video-prep.jpg
/images/consultation/book-confirmation.jpg
/images/consultation/video-call-professional.jpg
/images/consultation/video-call-screen-sharing.jpg
/images/consultation/video-call-whiteboard.jpg
/images/consultation/process-preparation.jpg
/images/consultation/process-active-consultation.jpg
/images/consultation/process-followup.jpg
```

---

## Next.js Image Configuration

Add to `next.config.js`:
```javascript
module.exports = {
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

---

## Accessibility Best Practices

### Always Include Alt Text
```tsx
// ✅ Good
<Image src="/images/blog/author-1.jpg" alt="Sarah Johnson, AI Solutions Architect" />

// ❌ Bad
<Image src="/images/blog/author-1.jpg" alt="" />
```

### Descriptive Alt Text Guidelines
- **Heroes:** Describe the scene and purpose
- **Authors:** Name and role
- **Articles:** Article topic or title
- **Demos:** What the demo does
- **Process:** What step it represents

---

**Ready to integrate!** All images are in place and these snippets are copy-paste ready.

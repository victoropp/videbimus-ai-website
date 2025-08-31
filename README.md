# Vidibemus AI - Enterprise AI Solutions Platform

![Vidibemus AI](public/icons/icon-192x192.png)

A comprehensive enterprise AI solutions platform providing cutting-edge artificial intelligence services, collaboration tools, and business automation. Built with Next.js 15.5, React 19, TypeScript, and enterprise-grade infrastructure.

## 🚀 Features

- **Enterprise AI Chat System**: Advanced conversational AI with multi-provider support (OpenAI, Anthropic, Hugging Face, Groq, Cohere, Together AI)
- **Real-time Collaboration**: Document editing, video conferencing, whiteboard, and project management
- **AI-Powered Analytics**: Business intelligence, predictive analytics, and performance metrics
- **Custom AI Solutions**: Tailored AI models for specific business needs with fine-tuning capabilities
- **Secure Payment Processing**: Stripe integration for subscriptions and one-time payments
- **Unlimited Email Addresses**: Full email server support for your domain
- **Knowledge Base System**: Pinecone vector database for intelligent content retrieval
- **Multi-tenant Architecture**: Secure isolation for enterprise clients
- **Advanced Monitoring**: Real-time health checks, error tracking, and performance monitoring
- **Auto-scaling**: PM2 cluster mode with load balancing

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15.5 with App Router
- **Language**: TypeScript 5.7+, React 19
- **Styling**: Tailwind CSS 3.4+
- **Animations**: Framer Motion 11
- **UI Components**: Radix UI, shadcn/ui
- **Forms**: React Hook Form with Zod validation

### Backend
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Caching**: Redis with ioredis
- **Real-time**: Socket.io
- **Authentication**: NextAuth.js v5
- **API**: tRPC for type-safe APIs

### AI & ML
- **Providers**: OpenAI, Anthropic, Hugging Face, Groq, Cohere, Together AI
- **Vector DB**: Pinecone
- **Embeddings**: OpenAI Ada-002, Cohere Embed
- **LangChain**: For AI orchestration

### Infrastructure
- **Deployment**: Docker, PM2, Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: Custom monitoring with alerts
- **CDN**: Cloudflare
- **Email**: Postfix/Dovecot

## 📦 Getting Started

### Prerequisites

- Node.js 20.0.0 or higher
- PostgreSQL 15+
- Redis Server
- npm 10+ or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/victoroppp/vidibemus-ai.git
cd vidibemus-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Design System

The website follows a comprehensive design system with:

- **Colors**: Custom color palette with cyan, purple, and neutral tones
- **Typography**: Three-tier font system (Display, Body, Mono)
- **Spacing**: Consistent 4px-based spacing scale
- **Components**: Reusable UI components with variant support
- **Animations**: Consistent animation timing and easing

## 📄 Pages

### Home Page
- Hero section with animated background
- Services overview with interactive cards
- Features showcase
- Client testimonials
- Team section
- Call-to-action sections

### Services Page
- Comprehensive service tier breakdown
- Detailed pricing and timelines
- Specialized service offerings
- Interactive service cards

### About Page
- Company mission and vision
- Core values
- Timeline of growth
- Team profiles with social links

### Case Studies Page
- Success story showcases
- Industry-specific examples
- Measurable results and ROI
- Filter and search functionality

### Contact Page
- Multi-method contact options
- Interactive contact form with validation
- Process overview
- FAQ section

### Blog Page
- Featured article highlight
- Article grid with search and filtering
- Author and reading time information
- Newsletter subscription

## 🔧 Customization

### Colors
Update the color scheme in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    // Your primary color scale
  },
  // Additional custom colors
}
```

### Fonts
Add custom fonts in `src/app/layout.tsx`:

```typescript
const customFont = NextFont({
  subsets: ['latin'],
  variable: '--font-custom',
})
```

### Components
All UI components are in `src/components/ui/` and can be customized via props or CSS classes.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with automatic builds

### Other Platforms

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📊 Performance

The website is optimized for:
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)
- **INP**: < 200ms (Interaction to Next Paint)

## 🔒 Security

- HTTPS enforcement
- Content Security Policy headers
- Input validation and sanitization
- Rate limiting on forms
- GDPR compliant data handling

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **UK**: +44 7442 852675 (Call or WhatsApp)
- **Ghana**: +233 248769377 (Call or WhatsApp)
- **Email**: support@vidibemus.ai
- **Website**: [https://vidibemus.ai](https://vidibemus.ai)
- **Documentation**: [docs.vidibemus.ai](https://docs.vidibemus.ai)

## 🔄 Updates

Stay updated with the latest features and improvements by watching this repository or subscribing to our newsletter.
# Deployment Guide

## Overview

This guide covers deployment strategies, environment setup, and best practices for deploying the VidebimusAI website.

## Deployment Options

### 1. Vercel (Recommended)

Vercel is the recommended platform for deploying Next.js applications.

**Prerequisites:**
- Vercel account
- GitHub repository connected

**Steps:**

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
# Development preview
vercel

# Production deployment
vercel --prod
```

**Environment Variables:**
Configure in Vercel Dashboard:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`
- API keys for third-party services

### 2. Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Build and Run:**
```bash
# Build image
docker build -t videbimus-ai .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  videbimus-ai
```

### 3. Traditional Server Deployment

**Build:**
```bash
npm run build
npm start
```

**PM2 Configuration:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'videbimus-ai',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

**Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Environment Configuration

### Environment Variables

**Required:**
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

**Optional:**
```env
# AI Services
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
HUGGINGFACE_API_KEY="hf_..."

# Analytics
NEXT_PUBLIC_GA_ID="G-..."
VERCEL_ANALYTICS_ID="..."

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-password"

# Stripe
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Redis
REDIS_URL="redis://..."

# Sentry
SENTRY_DSN="https://..."
```

### Environment Setup

**Development:**
```bash
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
```

**Production:**
Set environment variables in your hosting platform.

## Database Setup

### 1. Prisma Migrations

**Generate Prisma Client:**
```bash
npm run db:generate
```

**Run Migrations:**
```bash
# Development
npm run db:push

# Production
npm run db:migrate
```

**Seed Database:**
```bash
npm run db:seed
```

### 2. Database Backup

**Automated Backups:**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/backup_$DATE.sql
```

**Restore:**
```bash
psql $DATABASE_URL < backups/backup_YYYYMMDD_HHMMSS.sql
```

## CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:run

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions/deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup created

### Deployment

- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Verify critical paths

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check Web Vitals
- [ ] Verify database connections
- [ ] Test critical features
- [ ] Update documentation
- [ ] Notify team

## Monitoring

### Error Tracking

**Sentry:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### Performance Monitoring

**Vercel Analytics:**
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Uptime Monitoring

**Services:**
- UptimeRobot
- Pingdom
- StatusCake

**Health Check Endpoint:**
```typescript
// app/api/health/route.ts
export async function GET() {
  const dbHealthy = await checkDatabase()
  const redisHealthy = await checkRedis()

  if (dbHealthy && redisHealthy) {
    return Response.json({ status: 'ok' })
  }

  return Response.json(
    { status: 'error', details: { dbHealthy, redisHealthy } },
    { status: 503 }
  )
}
```

## Rollback Procedures

### Vercel

**Rollback to previous deployment:**
```bash
vercel rollback [deployment-url]
```

**Via Dashboard:**
1. Go to Vercel Dashboard
2. Select project
3. Go to Deployments
4. Find previous deployment
5. Click "Promote to Production"

### Docker

**Rollback to previous image:**
```bash
# Stop current container
docker stop videbimus-ai

# Start previous version
docker run -d --name videbimus-ai videbimus-ai:previous
```

### Database Rollback

**Revert migration:**
```bash
npm run db:migrate -- --rollback
```

**Restore from backup:**
```bash
psql $DATABASE_URL < backups/backup_YYYYMMDD_HHMMSS.sql
```

## Scaling

### Horizontal Scaling

**Vercel:**
- Automatically scales with traffic
- Configure in project settings

**Docker/Kubernetes:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: videbimus-ai
spec:
  replicas: 3
  selector:
    matchLabels:
      app: videbimus-ai
  template:
    spec:
      containers:
      - name: videbimus-ai
        image: videbimus-ai:latest
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### Database Scaling

**Read Replicas:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Connection Pooling:**
```env
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=10"
```

## Security

### HTTPS

**Force HTTPS:**
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  if (request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.url}`,
      301
    )
  }
}
```

### Security Headers

**next.config.js:**
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
        ],
      },
    ]
  },
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## Troubleshooting

### Common Issues

**Build Failures:**
- Check Node version
- Clear .next directory
- Verify environment variables
- Check for TypeScript errors

**Database Connection Issues:**
- Verify DATABASE_URL
- Check firewall rules
- Verify SSL settings
- Check connection limits

**Performance Issues:**
- Check bundle size
- Analyze Lighthouse report
- Review database queries
- Check third-party scripts

### Debugging Production

**Enable Debug Logs:**
```env
DEBUG=*
NODE_ENV=production
```

**Access Logs:**
```bash
# Vercel
vercel logs [deployment-url]

# Docker
docker logs videbimus-ai

# PM2
pm2 logs videbimus-ai
```

## Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Docker Documentation](https://docs.docker.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

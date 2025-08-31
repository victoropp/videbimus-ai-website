# Payment System Setup Guide

This guide walks you through setting up the complete payment processing system for production deployment.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database access
- Stripe account (can start with test mode)
- Domain name for webhooks (for production)

## Step-by-Step Setup

### 1. Stripe Account Setup

#### Create Stripe Account
1. Visit [stripe.com](https://stripe.com) and create an account
2. Complete business verification (for live mode)
3. Note your API keys from the dashboard

#### Create Products and Prices
```bash
# Install Stripe CLI
npm install -g stripe-cli

# Login to your Stripe account
stripe login

# Create Starter Plan
stripe products create \
  --name="Starter Plan" \
  --description="Basic AI features for small projects" \
  --metadata[plan]="starter"

# Create Starter Price (monthly)
stripe prices create \
  --product="prod_starter_id_here" \
  --unit-amount=2900 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="Starter Monthly"

# Create Professional Plan
stripe products create \
  --name="Professional Plan" \
  --description="Advanced AI + collaboration tools" \
  --metadata[plan]="professional"

# Create Professional Price (monthly)
stripe prices create \
  --product="prod_professional_id_here" \
  --unit-amount=9900 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="Professional Monthly"

# Create Enterprise Plan
stripe products create \
  --name="Enterprise Plan" \
  --description="Full suite + priority support" \
  --metadata[plan]="enterprise"

# Create Enterprise Price (monthly)
stripe prices create \
  --product="prod_enterprise_id_here" \
  --unit-amount=29900 \
  --currency=usd \
  --recurring[interval]=month \
  --nickname="Enterprise Monthly"
```

#### Configure Tax Settings
1. Go to Stripe Dashboard > Settings > Tax
2. Enable automatic tax collection
3. Set up tax rates for your jurisdictions

#### Set up Customer Portal
1. Go to Stripe Dashboard > Settings > Billing
2. Configure Customer Portal settings
3. Enable payment method management
4. Set cancellation policies

### 2. Environment Configuration

Create `.env.local` in your project root:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51...  # or sk_live_ for production
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...  # or pk_live_ for production
STRIPE_WEBHOOK_SECRET=whsec_...  # Get from webhook configuration

# Stripe Price IDs (from previous step)
STRIPE_STARTER_PRICE_ID=price_1...
STRIPE_PROFESSIONAL_PRICE_ID=price_1...  
STRIPE_ENTERPRISE_PRICE_ID=price_1...

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/vidibemus_ai?schema=public"

# Security
ENCRYPTION_KEY="your-32-character-encryption-key"  # Generate secure key
NEXTAUTH_SECRET="your-nextauth-secret"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Your domain in production
NEXTAUTH_URL=http://localhost:3000  # Your domain in production

# Email (for receipts and notifications)
EMAIL_FROM=billing@yourdomain.com
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Optional: Additional currencies
SUPPORTED_CURRENCIES=USD,EUR,GBP,CAD
```

### 3. Database Setup

#### Install Dependencies
```bash
npm install
```

#### Generate Encryption Key
```bash
# Generate a secure 32-character key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Apply database schema
npx prisma db push

# Verify schema
npx prisma db pull
```

#### Optional: Seed Data
```bash
# Create seed data for testing
npm run db:seed
```

### 4. Webhook Configuration

#### Local Development (using Stripe CLI)
```bash
# Forward webhooks to local development server
stripe listen --forward-to localhost:3000/api/payments/webhooks

# Copy the webhook signing secret to your .env.local
# Example: whsec_1234567890abcdef...
```

#### Production Setup
1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/api/payments/webhooks`
4. Select events:
   ```
   customer.created
   customer.updated
   customer.deleted
   customer.subscription.created
   customer.subscription.updated
   customer.subscription.deleted
   customer.subscription.trial_will_end
   invoice.created
   invoice.updated
   invoice.paid
   invoice.payment_failed
   invoice.payment_action_required
   payment_intent.succeeded
   payment_intent.payment_failed
   payment_intent.requires_action
   setup_intent.succeeded
   setup_intent.setup_failed
   payment_method.attached
   payment_method.detached
   charge.dispute.created
   ```
5. Copy webhook signing secret to your environment variables

### 5. Testing Setup

#### Test the System
```bash
# Start development server
npm run dev

# Test basic functionality
curl http://localhost:3000/api/health

# Test authentication (requires login)
# Navigate to http://localhost:3000/billing
```

#### Test Payment Flow
1. Register a new user
2. Navigate to `/billing`
3. Create billing account
4. Add test payment method using Stripe test cards:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`
   - 3D Secure: `4000002500003155`

#### Test Webhooks
```bash
# Using Stripe CLI
stripe trigger customer.created
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.created
```

### 6. Production Deployment

#### Environment Variables
Update all environment variables for production:
```bash
# Use live Stripe keys
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Production URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXTAUTH_URL=https://yourdomain.com

# Production database
DATABASE_URL="postgresql://..."
```

#### SSL Certificate
Ensure your domain has a valid SSL certificate for webhooks and payments.

#### Security Headers
Configure security headers in `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/payments/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}
```

#### Rate Limiting
Configure rate limiting for production:
```javascript
// In your API routes
import { PaymentSecurity } from '@/lib/payments/security'

export async function POST(request) {
  const rateLimit = await PaymentSecurity.checkRateLimit(
    userId,
    'payment_create',
    5,  // Max 5 requests
    60  // Per 60 minutes
  )
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
  
  // Continue with payment processing...
}
```

### 7. Monitoring and Alerts

#### Health Monitoring
Set up monitoring for:
- Database connectivity
- Stripe API availability
- Payment success rates
- Webhook processing

#### Error Tracking
Configure error tracking (e.g., Sentry):
```bash
npm install @sentry/nextjs

# Configure in sentry.client.config.js
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: "YOUR_DSN_HERE",
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  tracesSampleRate: 1.0,
})
```

#### Stripe Dashboard Alerts
Set up alerts in Stripe Dashboard for:
- Failed payments
- High chargeback rates
- Unusual transaction patterns

### 8. Backup and Recovery

#### Database Backups
```bash
# Automated daily backups
pg_dump -h localhost -U username vidibemus_ai > backup_$(date +%Y%m%d).sql

# Store securely (e.g., S3, encrypted)
```

#### Stripe Data Export
Configure regular exports of Stripe data for compliance and backup.

### 9. Compliance Checklist

#### PCI DSS Compliance
- [ ] No card data stored locally
- [ ] All communications use HTTPS
- [ ] Access controls implemented
- [ ] Regular security testing
- [ ] Vulnerability management

#### GDPR/Privacy Compliance
- [ ] Privacy policy updated
- [ ] Data retention policies
- [ ] Customer data export capability
- [ ] Right to deletion implemented

#### Tax Compliance
- [ ] Tax rates configured
- [ ] VAT handling for EU customers
- [ ] Sales tax for US states
- [ ] Regular tax reporting

### 10. Troubleshooting

#### Common Issues and Solutions

**1. Webhook Signature Verification Failed**
```bash
# Check webhook endpoint is accessible
curl -X POST https://yourdomain.com/api/payments/webhooks

# Verify webhook secret in environment
echo $STRIPE_WEBHOOK_SECRET
```

**2. Payment Method Attachment Failed**
```javascript
// Ensure customer exists before attaching payment method
const customer = await getCustomerByUserId(userId)
if (!customer) {
  await createCustomer({ userId, email, name })
}
```

**3. Database Connection Issues**
```bash
# Test database connection
npx prisma db pull

# Check connection string
echo $DATABASE_URL
```

#### Debug Mode
Enable debug logging:
```javascript
// In lib/stripe.ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 30000,
})

// Add request/response logging in development
if (process.env.NODE_ENV === 'development') {
  // Log all Stripe requests
}
```

### 11. Performance Optimization

#### Database Indexing
Ensure proper indexes for payment queries:
```sql
-- Add indexes for common queries
CREATE INDEX idx_payments_user_id_created_at ON payments(user_id, created_at);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_usage_logs_user_timestamp ON usage_logs(user_id, timestamp);
```

#### Caching
Implement Redis caching for frequently accessed data:
```javascript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

// Cache subscription data
const cacheKey = `subscription:${userId}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

// Cache for 5 minutes
await redis.setex(cacheKey, 300, JSON.stringify(subscription))
```

## Go-Live Checklist

Before going live with payments:

- [ ] All environment variables configured for production
- [ ] Stripe account fully verified and activated
- [ ] Webhooks tested and working
- [ ] Payment flows tested end-to-end
- [ ] Error handling and logging implemented
- [ ] Security measures in place
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerts configured
- [ ] Privacy policy and terms updated
- [ ] Customer support processes established

## Support

If you encounter issues during setup:

1. Check the troubleshooting section above
2. Review logs for specific error messages
3. Test with Stripe's test mode first
4. Use Stripe CLI for webhook testing
5. Consult Stripe documentation for specific features

## Maintenance

Regular maintenance tasks:

- Monitor payment success rates
- Review failed payment reasons
- Update webhook event handling
- Database maintenance and optimization
- Security updates and patches
- Compliance audits

---

Following this guide ensures a robust, secure, and compliant payment system ready for production use.
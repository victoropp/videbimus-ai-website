# Complete Payment Processing System Documentation

This documentation covers the comprehensive payment processing system implemented for the Vidibemus AI platform, featuring Stripe integration, subscription management, usage-based billing, and more.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Setup Instructions](#setup-instructions)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Security & Compliance](#security--compliance)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Overview

The payment system is a production-ready solution that handles:

- **Customer Management**: Stripe customer creation and management
- **Subscription Management**: 3-tier subscription model (Starter, Professional, Enterprise)
- **One-time Payments**: Payment intents for one-off transactions
- **Usage-based Billing**: Track and bill AI service usage
- **Invoice Management**: Automated invoice generation and management
- **Payment Methods**: Multiple payment method support
- **Billing Portal**: Self-service customer portal
- **Webhooks**: Real-time payment event processing
- **Financial Reporting**: Comprehensive billing analytics
- **Security**: PCI DSS compliance measures

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Stripe API    │
│   Components    │────│   Endpoints     │────│   Integration   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Webhooks      │    │   Usage         │
│   (PostgreSQL)  │────│   Processing    │────│   Tracking      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

1. **Database Models**: Comprehensive schema for payment data
2. **Stripe Integration**: Full Stripe API integration
3. **API Endpoints**: RESTful API for payment operations
4. **React Components**: Billing UI components
5. **Security Layer**: PCI DSS compliance and security measures
6. **Usage Tracking**: AI service usage monitoring
7. **Financial Reporting**: Analytics and reporting system

## Features

### 1. Customer Management
- Stripe customer creation and sync
- Customer profile management
- Billing address management
- Multi-currency support

### 2. Subscription Management
- **3-Tier Plans**:
  - **Starter**: Basic AI features, $29/month
  - **Professional**: Advanced AI + collaboration, $99/month  
  - **Enterprise**: Full suite + priority support, $299/month
- Subscription lifecycle management
- Plan upgrades/downgrades with prorations
- Trial periods and cancellations

### 3. Usage-based Billing
- Real-time AI service usage tracking
- Token-based billing for AI operations
- Usage limits enforcement
- Overage billing

### 4. Payment Methods
- Credit/debit cards via Stripe Elements
- Bank accounts and alternative payment methods
- Multiple payment methods per customer
- Default payment method management

### 5. Invoice Management
- Automated invoice generation
- Custom invoice creation
- PDF invoice generation
- Payment collection

### 6. Security & Compliance
- PCI DSS Level 1 compliance
- Data encryption for sensitive information
- Rate limiting and fraud detection
- Audit logging

### 7. Financial Reporting
- Revenue analytics
- Subscription metrics (MRR, churn, etc.)
- Usage analytics
- Customer lifetime value

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Database
DATABASE_URL="postgresql://..."

# Encryption (for PCI compliance)
ENCRYPTION_KEY="your-32-char-encryption-key-here"

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Stripe Setup

1. **Create Stripe Account**: Sign up at [stripe.com](https://stripe.com)

2. **Create Products and Prices**:
```bash
# Create products
stripe products create --name="Starter Plan" --description="Basic AI features"
stripe products create --name="Professional Plan" --description="Advanced AI + collaboration"
stripe products create --name="Enterprise Plan" --description="Full suite + priority support"

# Create recurring prices
stripe prices create --product=prod_xxx --unit-amount=2900 --currency=usd --recurring[interval]=month
stripe prices create --product=prod_xxx --unit-amount=9900 --currency=usd --recurring[interval]=month
stripe prices create --product=prod_xxx --unit-amount=29900 --currency=usd --recurring[interval]=month
```

3. **Configure Webhooks**:
   - Endpoint URL: `https://yourdomain.com/api/payments/webhooks`
   - Events to listen for:
     - `customer.created`
     - `customer.updated`
     - `customer.subscription.*`
     - `invoice.*`
     - `payment_intent.*`
     - `setup_intent.*`
     - `payment_method.*`

### 3. Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma db push

# Seed database (optional)
npm run db:seed
```

### 4. Install Dependencies

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

## API Endpoints

### Customer Management

#### Create Customer
```http
POST /api/payments/customers
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "metadata": {
    "source": "signup_flow"
  }
}
```

#### Get Customer
```http
GET /api/payments/customers
```

#### Update Customer
```http
PUT /api/payments/customers
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com"
}
```

### Subscription Management

#### Create Subscription
```http
POST /api/payments/subscriptions
Content-Type: application/json

{
  "plan": "PROFESSIONAL",
  "billingCycle": "MONTHLY",
  "trialDays": 14,
  "paymentMethodId": "pm_1234567890",
  "metadata": {
    "campaign": "spring_promotion"
  }
}
```

#### Get Active Subscription
```http
GET /api/payments/subscriptions?includeUsage=true
```

#### Update Subscription
```http
PUT /api/payments/subscriptions
Content-Type: application/json

{
  "plan": "ENTERPRISE",
  "prorationBehavior": "create_prorations"
}
```

#### Cancel Subscription
```http
DELETE /api/payments/subscriptions?cancelAtPeriodEnd=true
```

### Payment Methods

#### List Payment Methods
```http
GET /api/payments/payment-methods
```

#### Add Payment Method
```http
POST /api/payments/payment-methods
Content-Type: application/json

{
  "paymentMethodId": "pm_1234567890",
  "setAsDefault": true
}
```

#### Create Setup Intent
```http
POST /api/payments/payment-methods/setup-intent
Content-Type: application/json

{
  "paymentMethodTypes": ["card"]
}
```

### One-time Payments

#### Create Payment Intent
```http
POST /api/payments/payment-intents
Content-Type: application/json

{
  "amount": 5000,
  "currency": "usd",
  "description": "Custom AI model training",
  "receiptEmail": "customer@example.com"
}
```

#### Confirm Payment Intent
```http
POST /api/payments/payment-intents?action=confirm
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890",
  "paymentMethodId": "pm_1234567890"
}
```

## Frontend Components

### 1. Billing Page
Main billing dashboard with tabs for overview, payment methods, invoices, and usage.

```tsx
import BillingPage from '@/app/billing/page'

// Usage in route
export default BillingPage
```

### 2. Subscription Card
Displays current subscription status, usage, and management options.

```tsx
import { SubscriptionCard } from '@/components/billing/subscription-card'

<SubscriptionCard
  subscription={subscription}
  usage={usage}
  onManage={() => handleManage()}
  onUpgrade={() => handleUpgrade()}
  onCancel={() => handleCancel()}
/>
```

### 3. Payment Methods Management
Component for managing customer payment methods.

```tsx
import { PaymentMethods } from '@/components/billing/payment-methods'

<PaymentMethods
  paymentMethods={paymentMethods}
  onAdd={() => refetch()}
  onSetDefault={(id) => handleSetDefault(id)}
  onRemove={(id) => handleRemove(id)}
/>
```

### 4. Add Payment Method Form
Secure form for adding new payment methods using Stripe Elements.

```tsx
import { AddPaymentMethodForm } from '@/components/billing/add-payment-method-form'

<AddPaymentMethodForm
  onSuccess={() => handleSuccess()}
  onCancel={() => handleCancel()}
/>
```

### 5. Invoice History
Component for viewing and downloading invoices.

```tsx
import { InvoiceHistory } from '@/components/billing/invoice-history'

<InvoiceHistory
  invoices={invoices}
  onLoadMore={() => loadMore()}
  hasMore={hasMore}
/>
```

### 6. Usage Analytics
Detailed usage analytics and costs breakdown.

```tsx
import { UsageAnalytics } from '@/components/billing/usage-analytics'

<UsageAnalytics usage={usage} />
```

## Security & Compliance

### PCI DSS Compliance

The system implements several PCI DSS compliance measures:

1. **No Card Data Storage**: All sensitive payment data is handled by Stripe
2. **Encryption**: Sensitive data encrypted using AES-256-GCM
3. **Secure Communication**: All API calls use HTTPS/TLS
4. **Access Control**: Authentication required for all payment operations
5. **Audit Logging**: Comprehensive activity logging
6. **Rate Limiting**: Protection against abuse

### Security Features

```typescript
// Usage tracking with security
import { createUsageTrackingMiddleware } from '@/lib/payments/usage-tracking'
import { PaymentSecurity } from '@/lib/payments/security'

// Check rate limits
const rateLimit = await PaymentSecurity.checkRateLimit(
  userId, 
  'payment_create',
  10, // max requests
  60  // window minutes
)

// Log security events
await PaymentSecurity.logSecurityEvent(
  'payment_created',
  {
    userId,
    ipAddress,
    amount,
    currency: 'USD'
  }
)
```

### Data Encryption

```typescript
import { PCICompliance, DataEncryption } from '@/lib/payments/security'

// Encrypt sensitive billing data
const encryptedAddress = DataEncryption.encryptBillingData({
  line1: '123 Main St',
  city: 'New York',
  postalCode: '10001',
  country: 'US'
})

// Decrypt for display
const decryptedAddress = DataEncryption.decryptBillingData(encryptedAddress)
```

## Testing

### Test Credit Cards

Use these test cards for development:

```javascript
// Successful payments
const testCards = {
  visa: '4242424242424242',
  visaDebit: '4000056655665556',
  mastercard: '5555555555554444',
  amex: '378282246310005',
  
  // Declined cards
  declined: '4000000000000002',
  insufficientFunds: '4000000000009995',
  
  // 3D Secure
  require3DS: '4000002500003155'
}
```

### Usage Examples

```typescript
// Test customer creation
const customer = await createCustomer({
  userId: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User'
})

// Test subscription creation
const subscription = await createSubscription({
  customerId: customer.id,
  plan: 'PROFESSIONAL',
  billingCycle: 'MONTHLY',
  trialDays: 14
})

// Test usage tracking
await logUsage({
  userId: 'test-user-id',
  customerId: customer.id,
  service: 'CHAT_COMPLETION',
  endpoint: '/api/ai/chat',
  method: 'POST',
  totalTokens: 1000,
  duration: 500,
  success: true
})
```

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**
   - Ensure `STRIPE_WEBHOOK_SECRET` is correctly set
   - Check webhook endpoint URL is accessible
   - Verify webhook is configured for the correct events

2. **Payment Method Attachment Failed**
   - Ensure setup intent succeeded before attaching
   - Check customer exists in both Stripe and database
   - Verify payment method is not already attached

3. **Subscription Creation Failed**
   - Ensure customer has a default payment method
   - Check Stripe price IDs are correct
   - Verify customer is not already subscribed

4. **Database Sync Issues**
   - Run `npx prisma generate` after schema changes
   - Check database connection and permissions
   - Verify all required environment variables are set

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// In lib/stripe.ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
  telemetry: false, // Disable in production
  maxNetworkRetries: 3,
  timeout: 30000
})
```

### Health Checks

Monitor system health:

```http
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "database": "connected",
  "stripe": "connected",
  "services": {
    "payments": "operational",
    "subscriptions": "operational",
    "webhooks": "operational"
  }
}
```

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Stripe's documentation at [stripe.com/docs](https://stripe.com/docs)
3. Check server logs for detailed error information
4. Contact support with relevant error messages and request IDs

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
- [PCI DSS Compliance Guide](https://stripe.com/docs/security)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

---

This payment system provides a robust foundation for subscription and usage-based billing. All components are production-ready and follow industry best practices for security and compliance.
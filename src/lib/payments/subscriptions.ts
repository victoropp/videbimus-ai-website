import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { SubscriptionPlan, BillingCycle, SubscriptionStatus } from '@prisma/client'
import Stripe from 'stripe'

export interface CreateSubscriptionData {
  customerId: string
  priceId: string
  trialDays?: number
  couponId?: string
  metadata?: Record<string, string>
}

export interface UpdateSubscriptionData {
  subscriptionId: string
  priceId?: string
  quantity?: number
  prorate?: boolean
  couponId?: string
  metadata?: Record<string, string>
}

export interface SubscriptionDetails {
  id: string
  customerId: string
  status: SubscriptionStatus
  plan: SubscriptionPlan
  billingCycle: BillingCycle
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialEnd?: Date
  canceledAt?: Date
  cancelAtPeriodEnd: boolean
  metadata?: Record<string, string>
}

/**
 * Create a new subscription
 */
export async function createSubscription(data: CreateSubscriptionData): Promise<SubscriptionDetails> {
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const stripeSubscription = await stripe.subscriptions.create({
    customer: customer.stripeCustomerId,
    items: [{ price: data.priceId }],
    trial_period_days: data.trialDays,
    discounts: data.couponId ? [{ coupon: data.couponId }] : undefined,
    metadata: data.metadata || {}
  })

  const subscription = await prisma.subscription.create({
    data: {
      customerId: data.customerId,
      stripeSubscriptionId: stripeSubscription.id,
      status: stripeSubscription.status.toUpperCase() as SubscriptionStatus,
      plan: SubscriptionPlan.BASIC, // Would need to determine from price
      billingCycle: BillingCycle.MONTHLY, // Would need to determine from price
      amount: 2900, // Default amount in cents - would come from price
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      trialEnd: data.trialDays ? new Date(Date.now() + data.trialDays * 24 * 60 * 60 * 1000) : null,
      cancelAtPeriodEnd: false,
      metadata: data.metadata || {}
    },
    include: {
      customer: true
    }
  })

  return {
    id: subscription.id,
    customerId: subscription.customerId,
    status: subscription.status,
    plan: subscription.plan,
    billingCycle: subscription.billingCycle,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    trialEnd: subscription.trialEnd || undefined,
    canceledAt: subscription.canceledAt || undefined,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    metadata: subscription.metadata as Record<string, string>
  }
}

/**
 * Update an existing subscription
 */
export async function updateSubscription(data: UpdateSubscriptionData): Promise<SubscriptionDetails> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: data.subscriptionId },
    include: { customer: true }
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  const updateData: any = {}
  if (data.priceId) updateData.items = [{ id: subscription.stripeSubscriptionId, price: data.priceId }]
  if (data.quantity !== undefined) updateData.quantity = data.quantity
  if (data.couponId) updateData.coupon = data.couponId
  if (data.metadata) updateData.metadata = data.metadata
  if (data.prorate !== undefined) updateData.proration_behavior = data.prorate ? 'create_prorations' : 'none'

  const stripeSubscription = await stripe.subscriptions.update(
    subscription.stripeSubscriptionId,
    updateData
  )

  const updatedSubscription = await prisma.subscription.update({
    where: { id: data.subscriptionId },
    data: {
      status: stripeSubscription.status.toUpperCase() as SubscriptionStatus,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: data.metadata || subscription.metadata
    }
  })

  return {
    id: updatedSubscription.id,
    customerId: updatedSubscription.customerId,
    status: updatedSubscription.status,
    plan: updatedSubscription.plan,
    billingCycle: updatedSubscription.billingCycle,
    currentPeriodStart: updatedSubscription.currentPeriodStart,
    currentPeriodEnd: updatedSubscription.currentPeriodEnd,
    trialEnd: updatedSubscription.trialEnd || undefined,
    canceledAt: updatedSubscription.canceledAt || undefined,
    cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
    metadata: updatedSubscription.metadata as Record<string, string>
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean = true,
  reason?: string
): Promise<SubscriptionDetails> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId }
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  let stripeSubscription
  if (cancelAtPeriodEnd) {
    stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    )
  } else {
    stripeSubscription = await stripe.subscriptions.cancel(
      subscription.stripeSubscriptionId,
      { invoice_now: false, prorate: false }
    )
  }

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: stripeSubscription.status.toUpperCase() as SubscriptionStatus,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null
    }
  })

  return {
    id: updatedSubscription.id,
    customerId: updatedSubscription.customerId,
    status: updatedSubscription.status,
    plan: updatedSubscription.plan,
    billingCycle: updatedSubscription.billingCycle,
    currentPeriodStart: updatedSubscription.currentPeriodStart,
    currentPeriodEnd: updatedSubscription.currentPeriodEnd,
    trialEnd: updatedSubscription.trialEnd || undefined,
    canceledAt: updatedSubscription.canceledAt || undefined,
    cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
    metadata: updatedSubscription.metadata as Record<string, string>
  }
}

/**
 * Reactivate a cancelled subscription
 */
export async function reactivateSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId }
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  const stripeSubscription = await stripe.subscriptions.update(
    subscription.stripeSubscriptionId,
    { cancel_at_period_end: false }
  )

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: stripeSubscription.status.toUpperCase() as SubscriptionStatus,
      cancelAtPeriodEnd: false,
      canceledAt: null
    }
  })

  return {
    id: updatedSubscription.id,
    customerId: updatedSubscription.customerId,
    status: updatedSubscription.status,
    plan: updatedSubscription.plan,
    billingCycle: updatedSubscription.billingCycle,
    currentPeriodStart: updatedSubscription.currentPeriodStart,
    currentPeriodEnd: updatedSubscription.currentPeriodEnd,
    trialEnd: updatedSubscription.trialEnd || undefined,
    canceledAt: updatedSubscription.canceledAt || undefined,
    cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
    metadata: updatedSubscription.metadata as Record<string, string>
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<SubscriptionDetails | null> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      customer: true
    }
  })

  if (!subscription) {
    return null
  }

  return {
    id: subscription.id,
    customerId: subscription.customerId,
    status: subscription.status,
    plan: subscription.plan,
    billingCycle: subscription.billingCycle,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    trialEnd: subscription.trialEnd || undefined,
    canceledAt: subscription.canceledAt || undefined,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    metadata: subscription.metadata as Record<string, string>
  }
}

/**
 * List customer subscriptions
 */
export async function getCustomerSubscriptions(
  customerId: string,
  status?: SubscriptionStatus
): Promise<SubscriptionDetails[]> {
  const whereClause: any = { customerId }
  if (status) {
    whereClause.status = status
  }

  const subscriptions = await prisma.subscription.findMany({
    where: whereClause,
    include: {
      customer: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return subscriptions.map(subscription => ({
    id: subscription.id,
    customerId: subscription.customerId,
    status: subscription.status,
    plan: subscription.plan,
    billingCycle: subscription.billingCycle,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    trialEnd: subscription.trialEnd || undefined,
    canceledAt: subscription.canceledAt || undefined,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    metadata: subscription.metadata as Record<string, string>
  }))
}

/**
 * Get subscription usage and billing information
 */
export async function getSubscriptionUsage(subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      customer: true
    }
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  // Get usage from our Usage model  
  const usage = await prisma.usage.findMany({
    where: {
      userId: subscription.customer.userId,
      timestamp: {
        gte: subscription.currentPeriodStart,
        lte: subscription.currentPeriodEnd
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  })

  // Get usage limits
  const usageLimits = await prisma.usageLimit.findMany({
    where: { userId: subscription.customer.userId }
  })

  return {
    subscription,
    usage,
    usageLimits,
    totalRequests: usage.length,
    totalTokens: usage.reduce((sum, u) => sum + (u.unit === 'tokens' ? u.amount : 0), 0),
    totalCredits: usage.reduce((sum, u) => sum + Number(u.cost) * 100, 0)
  }
}

/**
 * Apply a coupon to a subscription
 */
export async function applyCoupon(subscriptionId: string, couponId: string): Promise<SubscriptionDetails> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId }
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  const stripeSubscription = await stripe.subscriptions.update(
    subscription.stripeSubscriptionId,
    { discounts: [{ coupon: couponId }] }
  )

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: stripeSubscription.status.toUpperCase() as SubscriptionStatus
    }
  })

  return {
    id: updatedSubscription.id,
    customerId: updatedSubscription.customerId,
    status: updatedSubscription.status,
    plan: updatedSubscription.plan,
    billingCycle: updatedSubscription.billingCycle,
    currentPeriodStart: updatedSubscription.currentPeriodStart,
    currentPeriodEnd: updatedSubscription.currentPeriodEnd,
    trialEnd: updatedSubscription.trialEnd || undefined,
    canceledAt: updatedSubscription.canceledAt || undefined,
    cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
    metadata: updatedSubscription.metadata as Record<string, string>
  }
}

/**
 * Get available subscription plans
 */
export async function getAvailablePlans(): Promise<any[]> {
  // Get plans from Stripe
  const prices = await stripe.prices.list({
    active: true,
    type: 'recurring'
  })

  return prices.data.map(price => ({
    id: price.id,
    plan: price.metadata.plan || 'BASIC',
    billingCycle: price.recurring?.interval === 'month' ? 'MONTHLY' : 'YEARLY',
    amount: price.unit_amount || 0,
    currency: price.currency,
    features: price.metadata.features ? JSON.parse(price.metadata.features) : [],
    metadata: price.metadata
  }))
}

/**
 * Handle subscription webhook events
 */
export async function handleSubscriptionWebhook(event: any): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        update: {
          status: subscription.status.toUpperCase() as SubscriptionStatus,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          trialEnd: null
        },
        create: {
          customerId: '', // Would need to look up by stripeCustomerId
          stripeSubscriptionId: subscription.id,
          status: subscription.status.toUpperCase() as SubscriptionStatus,
          plan: SubscriptionPlan.BASIC, // Would need to determine from price
          billingCycle: BillingCycle.MONTHLY, // Would need to determine from price
          amount: 2900, // Default amount
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          canceledAt: null,
          trialEnd: null
        }
      })
      break

    case 'customer.subscription.deleted':
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          canceledAt: new Date(),
          cancelAtPeriodEnd: false
        }
      })
      break

    default:
      console.log('Unhandled subscription webhook:', event.type)
  }
}

/**
 * Calculate proration amount for subscription changes
 */
export async function calculateProration(
  subscriptionId: string,
  newPriceId: string,
  changeDate?: Date
): Promise<{ amount: number; currency: string }> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { customer: true }
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  // Simple proration calculation
  // In a real implementation, this would use Stripe's proration calculation
  return {
    amount: 1000, // Simplified - would calculate based on remaining period and price difference
    currency: 'usd'
  }
}

/**
 * Generate subscription invoice
 */
export async function generateSubscriptionInvoice(subscriptionId: string): Promise<any> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { customer: true }
  })

  if (!subscription) {
    throw new Error('Subscription not found')
  }

  // Create and finalize invoice in Stripe
  const invoice = await stripe.invoices.create({
    customer: subscription.customer.stripeCustomerId,
    subscription: subscription.stripeSubscriptionId,
    auto_advance: true
  })

  const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id)

  // Store invoice in our database
  const dbInvoice = await prisma.invoice.create({
    data: {
      number: `INV-${Date.now()}-${subscription.id}`,
      clientId: subscription.customer.userId,
      subscriptionId: subscription.id,
      amount: finalizedInvoice.amount_due,
      total: finalizedInvoice.amount_due,
      currency: finalizedInvoice.currency.toUpperCase(),
      status: finalizedInvoice.status?.toUpperCase() as any,
      dueDate: finalizedInvoice.due_date ? new Date(finalizedInvoice.due_date * 1000) : new Date(),
      issuedDate: new Date(),
      paidDate: null
    }
  })

  return dbInvoice
}


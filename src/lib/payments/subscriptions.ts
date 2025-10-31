import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { BillingCycle as PrismaBillingCycle, SubscriptionStatus as PrismaSubscriptionStatus } from '@prisma/client'
import Stripe from 'stripe'

// Type aliases for use in function signatures
export type SubscriptionPlan = string
export type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING' | 'PAUSED' | 'INCOMPLETE' | 'INCOMPLETE_EXPIRED'

export interface CreateSubscriptionData {
  customerId: string
  plan: SubscriptionPlan
  billingCycle?: BillingCycle
  trialDays?: number
  paymentMethodId?: string
  coupon?: string
  metadata?: Record<string, string>
}

export interface UpdateSubscriptionData {
  plan?: SubscriptionPlan
  billingCycle?: BillingCycle
  quantity?: number
  prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice'
  metadata?: Record<string, string>
}

/**
 * Create a new subscription
 */
export async function createSubscription(data: CreateSubscriptionData) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
      include: { user: true }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    const planConfig = STRIPE_CONFIG.plans[data.plan]
    if (!planConfig) {
      throw new Error('Invalid subscription plan')
    }

    // Create subscription in Stripe
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customer.stripeCustomerId,
      items: [
        {
          price: planConfig.priceId,
          quantity: 1
        }
      ],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent', 'customer'],
      metadata: {
        userId: customer.userId,
        plan: data.plan,
        ...data.metadata
      }
    }

    // Add trial period if specified
    if (data.trialDays && data.trialDays > 0) {
      subscriptionParams.trial_period_days = data.trialDays
    }

    // Add default payment method if specified
    if (data.paymentMethodId) {
      subscriptionParams.default_payment_method = data.paymentMethodId
    }

    // Add coupon if specified (using any cast as coupon is deprecated in newer Stripe API)
    if (data.coupon) {
      (subscriptionParams as any).coupon = data.coupon
    }

    const stripeSubscription = await stripe.subscriptions.create(subscriptionParams)

    // Store subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        customerId: data.customerId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: planConfig.priceId,
        status: mapStripeStatus(stripeSubscription.status),
        plan: data.plan,
        billingCycle: data.billingCycle || PrismaBillingCycle.MONTHLY,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        trialStart: (stripeSubscription as any).trial_start ? new Date((stripeSubscription as any).trial_start * 1000) : null,
        trialEnd: (stripeSubscription as any).trial_end ? new Date((stripeSubscription as any).trial_end * 1000) : null,
        quantity: (stripeSubscription as any).items.data[0]?.quantity || 1,
        unitAmount: (stripeSubscription as any).items.data[0]?.price?.unit_amount || 0,
        currency: (stripeSubscription as any).currency,
        metadata: (stripeSubscription as any).metadata || {}
      },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        subscriptionItems: true
      }
    })

    // Create subscription items in database
    for (const item of stripeSubscription.items.data) {
      await prisma.subscriptionItem.create({
        data: {
          subscriptionId: subscription.id,
          stripeItemId: item.id,
          stripePriceId: item.price.id,
          quantity: item.quantity || 1,
          unitAmount: item.price.unit_amount || 0,
          currency: item.price.currency
        }
      })
    }

    return {
      subscription,
      stripeSubscription,
      clientSecret: (stripeSubscription.latest_invoice as any)?.payment_intent
        ? ((stripeSubscription.latest_invoice as any).payment_intent as Stripe.PaymentIntent).client_secret
        : null
    }
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        subscriptionItems: true,
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    return subscription
  } catch (error) {
    console.error('Error getting subscription:', error)
    throw error
  }
}

/**
 * Get active subscription for user
 */
export async function getActiveSubscription(userId: string) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        customer: {
          userId
        },
        status: { in: ['ACTIVE', 'TRIALING'] }
      },
      include: {
        customer: true,
        subscriptionItems: true
      }
    })

    return subscription
  } catch (error) {
    console.error('Error getting active subscription:', error)
    throw error
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(subscriptionId: string, data: UpdateSubscriptionData) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Update in Stripe
    const updateParams: Stripe.SubscriptionUpdateParams = {
      metadata: data.metadata,
      proration_behavior: data.prorationBehavior || 'create_prorations'
    }

    // Update plan if changed
    if (data.plan && data.plan !== subscription.plan) {
      const newPlanConfig = STRIPE_CONFIG.plans[data.plan]
      if (!newPlanConfig) {
        throw new Error('Invalid subscription plan')
      }

      updateParams.items = [
        {
          id: subscription.stripeSubscriptionId,
          price: newPlanConfig.priceId,
          quantity: data.quantity || 1
        }
      ]
    }

    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      updateParams
    )

    // Update in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        plan: data.plan || subscription.plan,
        quantity: data.quantity || subscription.quantity,
        status: mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        metadata: (stripeSubscription as any).metadata || {}
      },
      include: {
        customer: {
          include: {
            user: true
          }
        },
        subscriptionItems: true
      }
    })

    return { subscription: updatedSubscription, stripeSubscription }
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    let stripeSubscription: Stripe.Subscription

    if (cancelAtPeriodEnd) {
      // Cancel at period end
      stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
        metadata: {
          ...(subscription.metadata as object),
          canceledAt: new Date().toISOString()
        }
      })
    } else {
      // Cancel immediately
      stripeSubscription = await stripe.subscriptions.cancel(subscription.stripeSubscriptionId)
    }

    // Update in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: mapStripeStatus(stripeSubscription.status),
        canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : new Date(),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end || false,
        metadata: stripeSubscription.metadata || {}
      }
    })

    return { subscription: updatedSubscription, stripeSubscription }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    if (subscription.status === 'ACTIVE') {
      throw new Error('Subscription is already active')
    }

    // Remove cancellation
    const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    })

    // Update in database
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: mapStripeStatus(stripeSubscription.status),
        canceledAt: null,
        cancelAtPeriodEnd: false
      }
    })

    return { subscription: updatedSubscription, stripeSubscription }
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    throw error
  }
}

/**
 * Get subscription usage for current period
 */
export async function getSubscriptionUsage(subscriptionId: string) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // Fetch usage records for current period
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        subscriptionId,
        timestamp: {
          gte: subscription.currentPeriodStart,
          lte: subscription.currentPeriodEnd
        }
      }
    })

    // Aggregate usage by service
    const usageByService = usageRecords.reduce((acc, record) => {
      if (!acc[record.service]) {
        acc[record.service] = {
          totalTokens: 0,
          totalRequests: 0,
          totalCost: 0
        }
      }

      acc[record.service].totalTokens += record.totalTokens || 0
      acc[record.service].totalRequests += 1

      // Calculate cost based on service rates
      const rate = STRIPE_CONFIG.usageRates[record.service] || 0
      acc[record.service].totalCost += (record.totalTokens || 0) * rate / 1000

      return acc
    }, {} as Record<string, { totalTokens: number; totalRequests: number; totalCost: number }>)

    return {
      subscription,
      usageByService,
      totalUsage: {
        totalTokens: Object.values(usageByService).reduce((sum, usage) => sum + usage.totalTokens, 0),
        totalRequests: Object.values(usageByService).reduce((sum, usage) => sum + usage.totalRequests, 0),
        totalCost: Object.values(usageByService).reduce((sum, usage) => sum + usage.totalCost, 0)
      }
    }
  } catch (error) {
    console.error('Error getting subscription usage:', error)
    throw error
  }
}

/**
 * Sync subscription from Stripe
 */
export async function syncSubscriptionFromStripe(stripeSubscriptionId: string) {
  try {
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['items.data.price']
    })

    const subscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId }
    })

    if (!subscription) {
      throw new Error('Subscription not found in database')
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: mapStripeStatus(stripeSubscription.status),
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        trialStart: (stripeSubscription as any).trial_start ? new Date((stripeSubscription as any).trial_start * 1000) : null,
        trialEnd: (stripeSubscription as any).trial_end ? new Date((stripeSubscription as any).trial_end * 1000) : null,
        canceledAt: (stripeSubscription as any).canceled_at ? new Date((stripeSubscription as any).canceled_at * 1000) : null,
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end || false,
        metadata: (stripeSubscription as any).metadata || {}
      }
    })

    return updatedSubscription
  } catch (error) {
    console.error('Error syncing subscription from Stripe:', error)
    throw error
  }
}

/**
 * Map Stripe subscription status to database enum
 */
function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    'active': 'ACTIVE',
    'past_due': 'PAST_DUE',
    'unpaid': 'UNPAID',
    'canceled': 'CANCELED',
    'incomplete': 'INCOMPLETE',
    'incomplete_expired': 'INCOMPLETE_EXPIRED',
    'trialing': 'TRIALING',
    'paused': 'PAUSED'
  }

  return statusMap[stripeStatus] || 'ACTIVE'
}
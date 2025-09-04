import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'

import { 
  createSubscription, 
  getActiveSubscription, 
  updateSubscription, 
  cancelSubscription,
  getSubscriptionUsage
} from '@/lib/payments/subscriptions'
import { getCustomerByUserId } from '@/lib/payments/customer'
import { SubscriptionPlan, BillingCycle } from '@prisma/client'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  trialDays: z.number().min(0).max(30).optional(),
  paymentMethodId: z.string().optional(),
  coupon: z.string().optional(),
  metadata: z.record(z.string()).optional()
})

const updateSubscriptionSchema = z.object({
  plan: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional(),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']).optional(),
  quantity: z.number().min(1).optional(),
  prorationBehavior: z.enum(['create_prorations', 'none', 'always_invoice']).optional(),
  metadata: z.record(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeUsage = searchParams.get('includeUsage') === 'true'

    const subscription = await getActiveSubscription(session.user.id)
    
    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    let usage = null
    if (includeUsage) {
      usage = await getSubscriptionUsage(subscription.id)
    }

    return NextResponse.json({ subscription, usage })
  } catch (error) {
    console.error('Error getting subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSubscriptionSchema.parse(body)

    // Check if customer exists
    const customer = await getCustomerByUserId(session.user.id)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found. Please create a customer first.' }, { status: 404 })
    }

    // Check if user already has an active subscription
    const existingSubscription = await getActiveSubscription(session.user.id)
    if (existingSubscription) {
      return NextResponse.json({ error: 'User already has an active subscription' }, { status: 409 })
    }

    const result = await createSubscription({
      customerId: customer.id,
      plan: validatedData.plan as SubscriptionPlan,
      billingCycle: validatedData.billingCycle as BillingCycle,
      trialDays: validatedData.trialDays,
      paymentMethodId: validatedData.paymentMethodId,
      coupon: validatedData.coupon,
      metadata: validatedData.metadata
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating subscription:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSubscriptionSchema.parse(body)

    const subscription = await getActiveSubscription(session.user.id)
    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const result = await updateSubscription(subscription.id, {
      plan: validatedData.plan as SubscriptionPlan,
      billingCycle: validatedData.billingCycle as BillingCycle,
      quantity: validatedData.quantity,
      prorationBehavior: validatedData.prorationBehavior,
      metadata: validatedData.metadata
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating subscription:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const cancelAtPeriodEnd = searchParams.get('cancelAtPeriodEnd') !== 'false'

    const subscription = await getActiveSubscription(session.user.id)
    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    const result = await cancelSubscription(subscription.id, cancelAtPeriodEnd)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
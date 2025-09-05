import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'
import Stripe from 'stripe'

export interface CreatePaymentIntentData {
  customerId: string
  amount: number
  currency: string
  description?: string
  metadata?: Record<string, string>
  paymentMethodTypes?: string[]
  automaticPaymentMethods?: boolean
  returnUrl?: string
}

export interface ConfirmPaymentData {
  paymentIntentId: string
  paymentMethod: string
  returnUrl?: string
}

export interface ProcessRefundData {
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  metadata?: Record<string, string>
}

/**
 * Create a new payment intent for one-time payments
 */
export async function createPaymentIntent(data: CreatePaymentIntentData) {
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const paymentIntent = await stripe.paymentIntents.create({
    customer: customer.stripeCustomerId,
    amount: data.amount,
    currency: data.currency,
    description: data.description,
    metadata: data.metadata || {},
    payment_method_types: data.paymentMethodTypes || ['card'],
    automatic_payment_methods: data.automaticPaymentMethods ? {
      enabled: true
    } : undefined
  })

  // Create a temporary invoice for one-time payments
  const invoice = await prisma.invoice.create({
    data: {
      number: `INV-${Date.now()}`,
      clientId: customer.userId,
      amount: data.amount,
      total: data.amount,
      currency: data.currency.toUpperCase(),
      status: 'DRAFT',
      dueDate: new Date(),
      issuedDate: new Date(),
      description: data.description || 'One-time payment'
    }
  })

  // Store payment in our database
  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      status: paymentIntent.status.toUpperCase() as PaymentStatus,
      method: 'CARD',
      transactionId: paymentIntent.id,
      reference: data.description || ''
    }
  })

  return {
    id: paymentIntent.id,
    client_secret: paymentIntent.client_secret,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    payment: payment
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmPayment(data: ConfirmPaymentData) {
  const paymentIntent = await stripe.paymentIntents.confirm(
    data.paymentIntentId,
    {
      payment_method: data.paymentMethod,
      return_url: data.returnUrl
    }
  )

  // Update payment status in our database
  await prisma.payment.updateMany({
    where: { transactionId: data.paymentIntentId },
    data: { 
      status: paymentIntent.status.toUpperCase() as PaymentStatus,
      processedAt: paymentIntent.status === 'succeeded' ? new Date() : null
    }
  })

  return {
    id: paymentIntent.id,
    status: paymentIntent.status,
    client_secret: paymentIntent.client_secret,
    next_action: paymentIntent.next_action
  }
}

/**
 * Get payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string) {
  const [paymentIntent, payment] = await Promise.all([
    stripe.paymentIntents.retrieve(paymentIntentId),
    prisma.payment.findFirst({
      where: { transactionId: paymentIntentId },
      include: { invoice: { include: { client: true } } }
    })
  ])

  return {
    stripe: paymentIntent,
    payment: payment
  }
}

/**
 * List customer payment intents
 */
export async function getCustomerPaymentIntents(
  customerId: string, 
  limit: number = 10, 
  startingAfter?: string
) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const [stripePaymentIntents, dbPayments] = await Promise.all([
    stripe.paymentIntents.list({
      customer: customer.stripeCustomerId,
      limit,
      starting_after: startingAfter
    }),
    prisma.payment.findMany({
      where: { 
        invoice: { 
          client: { 
            customer: { 
              id: customerId 
            } 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  ])

  return {
    stripe: stripePaymentIntents,
    payments: dbPayments
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)

  // Update payment status in our database
  await prisma.payment.updateMany({
    where: { transactionId: paymentIntentId },
    data: { 
      status: PaymentStatus.CANCELLED
    }
  })

  return {
    id: paymentIntent.id,
    status: paymentIntent.status
  }
}

/**
 * Process a refund for a payment
 */
export async function processRefund(data: ProcessRefundData) {
  const payment = await prisma.payment.findFirst({
    where: { transactionId: data.paymentIntentId },
    include: { invoice: { include: { client: true } } }
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  const refund = await stripe.refunds.create({
    payment_intent: data.paymentIntentId,
    amount: data.amount,
    reason: data.reason,
    metadata: data.metadata || {}
  })

  // Store refund in our database
  const dbRefund = await prisma.refund.create({
    data: {
      paymentId: payment.id,
      stripeId: refund.id,
      amount: refund.amount,
      currency: refund.currency.toUpperCase(),
      status: (refund.status || 'pending').toUpperCase() as any,
      reason: data.reason || 'requested_by_customer'
    }
  })

  return {
    stripe: refund,
    refund: dbRefund
  }
}

/**
 * Update payment intent
 */
export async function updatePaymentIntent(
  paymentIntentId: string, 
  updates: Partial<CreatePaymentIntentData>
) {
  const updateData: any = {}
  if (updates.amount !== undefined) updateData.amount = updates.amount
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata

  const paymentIntent = await stripe.paymentIntents.update(
    paymentIntentId,
    updateData
  )

  // Update payment in our database
  const dbUpdates: any = {}
  if (updates.amount !== undefined) dbUpdates.amount = updates.amount
  if (updates.description !== undefined) dbUpdates.description = updates.description

  if (Object.keys(dbUpdates).length > 0) {
    await prisma.payment.updateMany({
      where: { transactionId: paymentIntentId },
      data: dbUpdates
    })
  }

  return {
    id: paymentIntent.id,
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    description: paymentIntent.description
  }
}

/**
 * Handle Stripe webhook for payment events
 */
export async function handlePaymentWebhook(
  event: any, // Stripe.Event type
  signature: string
) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  switch (event.type) {
    case 'payment_intent.succeeded':
      await prisma.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: {
          status: PaymentStatus.COMPLETED,
          processedAt: new Date()
        }
      })
      break

    case 'payment_intent.payment_failed':
      await prisma.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: {
          status: PaymentStatus.FAILED,
          notes: paymentIntent.last_payment_error?.message || 'Payment failed'
        }
      })
      break

    case 'payment_intent.canceled':
      await prisma.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: {
          status: PaymentStatus.CANCELLED
        }
      })
      break

    case 'payment_intent.requires_action':
      await prisma.payment.updateMany({
        where: { transactionId: paymentIntent.id },
        data: {
          status: PaymentStatus.PROCESSING
        }
      })
      break

    default:
      console.log('Unhandled payment webhook:', event.type)
  }

  return { processed: true, event: event.type }
}


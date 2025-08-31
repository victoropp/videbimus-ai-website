import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'
import Stripe from 'stripe'

export interface CreatePaymentIntentData {
  customerId: string
  amount: number // in cents
  currency?: string
  description?: string
  paymentMethodId?: string
  confirmPayment?: boolean
  receiptEmail?: string
  metadata?: Record<string, string>
}

export interface CreateOneTimeInvoiceData {
  customerId: string
  description: string
  items: Array<{
    description: string
    quantity: number
    unitAmount: number // in cents
  }>
  dueDate?: Date
  currency?: string
  metadata?: Record<string, string>
}

/**
 * Create a payment intent for one-time payments
 */
export async function createPaymentIntent(data: CreatePaymentIntentData) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      customer: customer.stripeCustomerId,
      amount: data.amount,
      currency: data.currency || 'usd',
      description: data.description,
      receipt_email: data.receiptEmail,
      metadata: {
        customerId: data.customerId,
        ...data.metadata
      }
    }

    // If payment method is specified and we want to confirm immediately
    if (data.paymentMethodId) {
      paymentIntentParams.payment_method = data.paymentMethodId
      if (data.confirmPayment) {
        paymentIntentParams.confirm = true
        paymentIntentParams.return_url = process.env.NEXT_PUBLIC_APP_URL + '/billing/payment-result'
      }
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    // Store payment in database
    const payment = await prisma.payment.create({
      data: {
        userId: customer.userId,
        customerId: data.customerId,
        stripePaymentIntentId: paymentIntent.id,
        amount: data.amount,
        currency: data.currency || 'USD',
        status: mapPaymentIntentStatus(paymentIntent.status),
        description: data.description,
        receiptEmail: data.receiptEmail,
        metadata: paymentIntent.metadata || {}
      }
    })

    return {
      payment,
      paymentIntent,
      clientSecret: paymentIntent.client_secret
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

/**
 * Confirm a payment intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string, 
  paymentMethodId?: string
) {
  try {
    const confirmParams: Stripe.PaymentIntentConfirmParams = {
      return_url: process.env.NEXT_PUBLIC_APP_URL + '/billing/payment-result'
    }

    if (paymentMethodId) {
      confirmParams.payment_method = paymentMethodId
    }

    const paymentIntent = await stripe.paymentIntents.confirm(
      paymentIntentId,
      confirmParams
    )

    // Update payment in database
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntentId },
      data: {
        status: mapPaymentIntentStatus(paymentIntent.status),
        processedAt: paymentIntent.status === 'succeeded' ? new Date() : null,
        failureCode: paymentIntent.last_payment_error?.code,
        failureMessage: paymentIntent.last_payment_error?.message
      }
    })

    return paymentIntent
  } catch (error) {
    console.error('Error confirming payment intent:', error)
    throw error
  }
}

/**
 * Get payment intent status
 */
export async function getPaymentIntentStatus(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Update payment in database
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntentId },
      data: {
        status: mapPaymentIntentStatus(paymentIntent.status),
        amountReceived: paymentIntent.amount_received,
        processedAt: paymentIntent.status === 'succeeded' ? new Date() : null,
        failureCode: paymentIntent.last_payment_error?.code,
        failureMessage: paymentIntent.last_payment_error?.message
      }
    })

    return paymentIntent
  } catch (error) {
    console.error('Error getting payment intent status:', error)
    throw error
  }
}

/**
 * Create one-time invoice
 */
export async function createOneTimeInvoice(data: CreateOneTimeInvoiceData) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Create invoice items in Stripe
    const invoiceItems = []
    for (const item of data.items) {
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customer.stripeCustomerId,
        amount: item.unitAmount * item.quantity,
        currency: data.currency || 'usd',
        description: item.description,
        metadata: {
          quantity: item.quantity.toString(),
          unitAmount: item.unitAmount.toString()
        }
      })
      invoiceItems.push(invoiceItem)
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.stripeCustomerId,
      description: data.description,
      due_date: data.dueDate ? Math.floor(data.dueDate.getTime() / 1000) : undefined,
      auto_advance: false, // Don't automatically finalize
      metadata: {
        customerId: data.customerId,
        ...data.metadata
      }
    })

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.unitAmount * item.quantity), 0)

    // Store invoice in database
    const dbInvoice = await prisma.invoice.create({
      data: {
        customerId: data.customerId,
        stripeInvoiceId: invoice.id,
        number: invoice.number!,
        status: 'DRAFT',
        description: data.description,
        currency: data.currency || 'USD',
        subtotal: subtotal,
        total: subtotal, // Will be updated when finalized
        amountDue: subtotal,
        amountRemaining: subtotal,
        dueDate: data.dueDate,
        periodStart: new Date(),
        periodEnd: new Date(),
        metadata: invoice.metadata || {}
      }
    })

    // Store invoice items
    for (let i = 0; i < data.items.length; i++) {
      await prisma.invoiceItem.create({
        data: {
          invoiceId: dbInvoice.id,
          description: data.items[i].description,
          quantity: data.items[i].quantity,
          unitAmount: data.items[i].unitAmount,
          amount: data.items[i].unitAmount * data.items[i].quantity,
          currency: data.currency || 'USD'
        }
      })
    }

    return {
      invoice: dbInvoice,
      stripeInvoice: invoice,
      invoiceItems
    }
  } catch (error) {
    console.error('Error creating one-time invoice:', error)
    throw error
  }
}

/**
 * Finalize and send invoice
 */
export async function finalizeAndSendInvoice(invoiceId: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    // Finalize invoice in Stripe
    const stripeInvoice = await stripe.invoices.finalizeInvoice(invoice.stripeInvoiceId)

    // Send invoice
    await stripe.invoices.sendInvoice(invoice.stripeInvoiceId)

    // Update invoice in database
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'OPEN',
        total: stripeInvoice.total,
        tax: stripeInvoice.tax || 0,
        amountDue: stripeInvoice.amount_due,
        hostedInvoiceUrl: stripeInvoice.hosted_invoice_url,
        invoicePdf: stripeInvoice.invoice_pdf
      }
    })

    return {
      invoice: updatedInvoice,
      stripeInvoice
    }
  } catch (error) {
    console.error('Error finalizing and sending invoice:', error)
    throw error
  }
}

/**
 * Cancel payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId)

    // Update payment in database
    await prisma.payment.update({
      where: { stripePaymentIntentId: paymentIntentId },
      data: {
        status: 'CANCELED'
      }
    })

    return paymentIntent
  } catch (error) {
    console.error('Error canceling payment intent:', error)
    throw error
  }
}

/**
 * Get payment by payment intent ID
 */
export async function getPaymentByIntentId(paymentIntentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        customer: {
          include: {
            user: true
          }
        }
      }
    })

    return payment
  } catch (error) {
    console.error('Error getting payment by intent ID:', error)
    throw error
  }
}

/**
 * Process refund
 */
export async function processRefund(
  paymentId: string, 
  amount?: number, 
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    })

    if (!payment) {
      throw new Error('Payment not found')
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new Error('Can only refund successful payments')
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: amount, // If not specified, refunds full amount
      reason: reason,
      metadata: {
        paymentId: paymentId
      }
    })

    // Store refund in database
    const dbRefund = await prisma.refund.create({
      data: {
        userId: payment.userId,
        paymentId: paymentId,
        stripeRefundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        reason: reason ? mapRefundReason(reason) : null,
        status: 'PENDING',
        receiptNumber: refund.receipt_number,
        metadata: refund.metadata || {}
      }
    })

    return {
      refund: dbRefund,
      stripeRefund: refund
    }
  } catch (error) {
    console.error('Error processing refund:', error)
    throw error
  }
}

/**
 * Get customer's payment history
 */
export async function getCustomerPayments(
  customerId: string, 
  limit: number = 20,
  offset: number = 0
) {
  try {
    const payments = await prisma.payment.findMany({
      where: { customerId },
      include: {
        paymentMethod: true,
        refunds: true
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    const total = await prisma.payment.count({
      where: { customerId }
    })

    return {
      payments,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }
  } catch (error) {
    console.error('Error getting customer payments:', error)
    throw error
  }
}

// Utility functions
function mapPaymentIntentStatus(status: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    'requires_payment_method': 'REQUIRES_PAYMENT_METHOD',
    'requires_confirmation': 'REQUIRES_CONFIRMATION',
    'requires_action': 'REQUIRES_ACTION',
    'processing': 'PROCESSING',
    'requires_capture': 'REQUIRES_CAPTURE',
    'canceled': 'CANCELED',
    'succeeded': 'SUCCEEDED',
    'failed': 'FAILED'
  }
  return statusMap[status] || 'PENDING'
}

function mapRefundReason(reason: string) {
  const reasonMap: Record<string, any> = {
    'duplicate': 'DUPLICATE',
    'fraudulent': 'FRAUDULENT',
    'requested_by_customer': 'REQUESTED_BY_CUSTOMER'
  }
  return reasonMap[reason] || 'REQUESTED_BY_CUSTOMER'
}
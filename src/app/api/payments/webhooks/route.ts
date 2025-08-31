import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { syncCustomerFromStripe } from '@/lib/payments/customer'
import { syncSubscriptionFromStripe } from '@/lib/payments/subscriptions'
import { syncPaymentMethodFromStripe } from '@/lib/payments/payment-methods'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret)
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Log webhook event
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        data: event.data as any,
        processed: false
      }
    })

    // Process the event
    await processWebhookEvent(event)

    // Mark event as processed
    await prisma.webhookEvent.update({
      where: { stripeEventId: event.id },
      data: { 
        processed: true,
        processedAt: new Date()
      }
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    // Update webhook event with error
    if (error instanceof Error) {
      try {
        await prisma.webhookEvent.updateMany({
          where: { 
            processed: false,
            retryCount: { lt: 3 }
          },
          data: {
            processingError: error.message,
            retryCount: { increment: 1 }
          }
        })
      } catch (dbError) {
        console.error('Error updating webhook event:', dbError)
      }
    }

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function processWebhookEvent(event: Stripe.Event) {
  console.log(`Processing webhook event: ${event.type}`)

  try {
    switch (event.type) {
      // Customer events
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerEvent(event)
        break

      // Subscription events
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.trial_will_end':
        await handleSubscriptionEvent(event)
        break

      // Payment method events
      case 'payment_method.attached':
      case 'payment_method.detached':
      case 'payment_method.updated':
        await handlePaymentMethodEvent(event)
        break

      // Invoice events
      case 'invoice.created':
      case 'invoice.updated':
      case 'invoice.paid':
      case 'invoice.payment_failed':
      case 'invoice.payment_action_required':
        await handleInvoiceEvent(event)
        break

      // Payment events
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.requires_action':
        await handlePaymentIntentEvent(event)
        break

      // Charge events
      case 'charge.succeeded':
      case 'charge.failed':
      case 'charge.dispute.created':
        await handleChargeEvent(event)
        break

      // Setup intent events
      case 'setup_intent.succeeded':
      case 'setup_intent.setup_failed':
        await handleSetupIntentEvent(event)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error(`Error processing ${event.type}:`, error)
    throw error
  }
}

async function handleCustomerEvent(event: Stripe.Event) {
  const customer = event.data.object as Stripe.Customer

  try {
    await syncCustomerFromStripe(customer.id)
    console.log(`Customer ${customer.id} synced successfully`)
  } catch (error) {
    console.error(`Error syncing customer ${customer.id}:`, error)
    throw error
  }
}

async function handleSubscriptionEvent(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await syncSubscriptionFromStripe(subscription.id)
        console.log(`Subscription ${subscription.id} synced successfully`)
        break

      case 'customer.subscription.deleted':
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELED',
            canceledAt: new Date(subscription.canceled_at! * 1000)
          }
        })
        console.log(`Subscription ${subscription.id} canceled`)
        break

      case 'customer.subscription.trial_will_end':
        // Send notification to user about trial ending
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
          include: { user: true }
        })

        if (sub) {
          await prisma.notification.create({
            data: {
              title: 'Trial Ending Soon',
              content: 'Your trial period will end soon. Please update your payment method to continue using our services.',
              type: 'SYSTEM',
              userId: sub.userId
            }
          })
        }
        break
    }
  } catch (error) {
    console.error(`Error handling subscription event ${event.type}:`, error)
    throw error
  }
}

async function handlePaymentMethodEvent(event: Stripe.Event) {
  const paymentMethod = event.data.object as Stripe.PaymentMethod

  try {
    switch (event.type) {
      case 'payment_method.attached':
        await syncPaymentMethodFromStripe(paymentMethod.id)
        console.log(`Payment method ${paymentMethod.id} attached and synced`)
        break

      case 'payment_method.detached':
        await prisma.paymentMethod.updateMany({
          where: { stripePaymentMethodId: paymentMethod.id },
          data: { isActive: false }
        })
        console.log(`Payment method ${paymentMethod.id} detached`)
        break

      case 'payment_method.updated':
        await syncPaymentMethodFromStripe(paymentMethod.id)
        console.log(`Payment method ${paymentMethod.id} updated and synced`)
        break
    }
  } catch (error) {
    console.error(`Error handling payment method event ${event.type}:`, error)
    throw error
  }
}

async function handleInvoiceEvent(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice

  try {
    const customer = await prisma.customer.findUnique({
      where: { stripeCustomerId: invoice.customer as string },
      include: { user: true }
    })

    if (!customer) {
      console.warn(`Customer not found for invoice ${invoice.id}`)
      return
    }

    switch (event.type) {
      case 'invoice.created':
      case 'invoice.updated':
        await syncInvoiceFromStripe(invoice, customer.id)
        break

      case 'invoice.paid':
        await syncInvoiceFromStripe(invoice, customer.id)
        
        // Create notification
        await prisma.notification.create({
          data: {
            title: 'Payment Received',
            content: `Your payment of ${invoice.amount_paid ? (invoice.amount_paid / 100).toFixed(2) : '0.00'} ${invoice.currency?.toUpperCase()} has been successfully processed.`,
            type: 'SYSTEM',
            userId: customer.userId
          }
        })
        break

      case 'invoice.payment_failed':
        await syncInvoiceFromStripe(invoice, customer.id)
        
        // Create notification
        await prisma.notification.create({
          data: {
            title: 'Payment Failed',
            content: 'We were unable to process your payment. Please update your payment method or contact support.',
            type: 'SYSTEM',
            userId: customer.userId
          }
        })
        break

      case 'invoice.payment_action_required':
        // Create notification
        await prisma.notification.create({
          data: {
            title: 'Payment Action Required',
            content: 'Your payment requires additional authentication. Please complete the payment process.',
            type: 'SYSTEM',
            userId: customer.userId
          }
        })
        break
    }
  } catch (error) {
    console.error(`Error handling invoice event ${event.type}:`, error)
    throw error
  }
}

async function handlePaymentIntentEvent(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent

  try {
    const customer = await prisma.customer.findUnique({
      where: { stripeCustomerId: paymentIntent.customer as string }
    })

    if (!customer) {
      console.warn(`Customer not found for payment intent ${paymentIntent.id}`)
      return
    }

    // Update or create payment record
    await prisma.payment.upsert({
      where: { stripePaymentIntentId: paymentIntent.id },
      update: {
        status: mapPaymentIntentStatus(paymentIntent.status),
        amountReceived: paymentIntent.amount_received,
        processedAt: paymentIntent.status === 'succeeded' ? new Date() : null,
        failureCode: paymentIntent.last_payment_error?.code,
        failureMessage: paymentIntent.last_payment_error?.message
      },
      create: {
        userId: customer.userId,
        customerId: customer.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        amountReceived: paymentIntent.amount_received,
        currency: paymentIntent.currency,
        status: mapPaymentIntentStatus(paymentIntent.status),
        description: paymentIntent.description,
        receiptEmail: paymentIntent.receipt_email,
        processedAt: paymentIntent.status === 'succeeded' ? new Date() : null,
        failureCode: paymentIntent.last_payment_error?.code,
        failureMessage: paymentIntent.last_payment_error?.message,
        metadata: paymentIntent.metadata || {}
      }
    })

    console.log(`Payment intent ${paymentIntent.id} processed: ${paymentIntent.status}`)
  } catch (error) {
    console.error(`Error handling payment intent event ${event.type}:`, error)
    throw error
  }
}

async function handleChargeEvent(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge

  try {
    switch (event.type) {
      case 'charge.dispute.created':
        const dispute = charge.dispute as Stripe.Dispute
        const customer = await prisma.customer.findUnique({
          where: { stripeCustomerId: charge.customer as string }
        })

        if (customer) {
          await prisma.dispute.create({
            data: {
              userId: customer.userId,
              stripeDisputeId: dispute.id,
              amount: dispute.amount,
              currency: dispute.currency,
              reason: mapDisputeReason(dispute.reason),
              status: mapDisputeStatus(dispute.status),
              evidence: dispute.evidence || {},
              evidenceDetails: dispute.evidence_details || {},
              isChargeRefundable: dispute.is_charge_refundable,
              metadata: dispute.metadata || {}
            }
          })

          // Create notification
          await prisma.notification.create({
            data: {
              title: 'Payment Dispute',
              content: `A dispute has been created for a charge of ${(dispute.amount / 100).toFixed(2)} ${dispute.currency.toUpperCase()}. We will review and respond accordingly.`,
              type: 'SYSTEM',
              userId: customer.userId
            }
          })
        }
        break
    }
  } catch (error) {
    console.error(`Error handling charge event ${event.type}:`, error)
    throw error
  }
}

async function handleSetupIntentEvent(event: Stripe.Event) {
  const setupIntent = event.data.object as Stripe.SetupIntent

  try {
    if (event.type === 'setup_intent.succeeded' && setupIntent.payment_method) {
      // Payment method was successfully set up
      await syncPaymentMethodFromStripe(setupIntent.payment_method as string)
    }
  } catch (error) {
    console.error(`Error handling setup intent event ${event.type}:`, error)
    throw error
  }
}

async function syncInvoiceFromStripe(invoice: Stripe.Invoice, customerId: string) {
  // Implementation would sync invoice data from Stripe to database
  // This is a simplified version
  try {
    await prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      update: {
        status: mapInvoiceStatus(invoice.status!),
        total: invoice.total,
        amountPaid: invoice.amount_paid,
        amountDue: invoice.amount_due,
        amountRemaining: invoice.amount_remaining,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null
      },
      create: {
        customerId,
        stripeInvoiceId: invoice.id,
        number: invoice.number!,
        status: mapInvoiceStatus(invoice.status!),
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        total: invoice.total,
        amountPaid: invoice.amount_paid,
        amountDue: invoice.amount_due,
        amountRemaining: invoice.amount_remaining,
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000),
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : null,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf
      }
    })
  } catch (error) {
    console.error('Error syncing invoice:', error)
    throw error
  }
}

// Utility functions to map Stripe enums to database enums
function mapPaymentIntentStatus(status: string) {
  const statusMap: Record<string, any> = {
    'requires_payment_method': 'REQUIRES_PAYMENT_METHOD',
    'requires_confirmation': 'REQUIRES_CONFIRMATION',
    'requires_action': 'REQUIRES_ACTION',
    'processing': 'PROCESSING',
    'requires_capture': 'REQUIRES_CAPTURE',
    'canceled': 'CANCELED',
    'succeeded': 'SUCCEEDED'
  }
  return statusMap[status] || 'PENDING'
}

function mapInvoiceStatus(status: string) {
  const statusMap: Record<string, any> = {
    'draft': 'DRAFT',
    'open': 'OPEN',
    'paid': 'PAID',
    'void': 'VOID',
    'uncollectible': 'UNCOLLECTIBLE'
  }
  return statusMap[status] || 'DRAFT'
}

function mapDisputeReason(reason: string) {
  // Map Stripe dispute reasons to database enum
  const reasonMap: Record<string, any> = {
    'credit_not_processed': 'CREDIT_NOT_PROCESSED',
    'duplicate': 'DUPLICATE',
    'fraudulent': 'FRAUDULENT',
    'general': 'GENERAL',
    'incorrect_account_details': 'INCORRECT_ACCOUNT_DETAILS',
    'insufficient_funds': 'INSUFFICIENT_FUNDS',
    'product_not_received': 'PRODUCT_NOT_RECEIVED',
    'product_unacceptable': 'PRODUCT_UNACCEPTABLE',
    'subscription_canceled': 'SUBSCRIPTION_CANCELED',
    'unrecognized': 'UNRECOGNIZED'
  }
  return reasonMap[reason] || 'GENERAL'
}

function mapDisputeStatus(status: string) {
  const statusMap: Record<string, any> = {
    'warning_needs_response': 'WARNING_NEEDS_RESPONSE',
    'warning_under_review': 'WARNING_UNDER_REVIEW',
    'warning_closed': 'WARNING_CLOSED',
    'needs_response': 'NEEDS_RESPONSE',
    'under_review': 'UNDER_REVIEW',
    'charge_refunded': 'CHARGE_REFUNDED',
    'won': 'WON',
    'lost': 'LOST'
  }
  return statusMap[status] || 'NEEDS_RESPONSE'
}
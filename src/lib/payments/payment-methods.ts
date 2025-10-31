import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { PaymentMethod_Type } from '@prisma/client'
import Stripe from 'stripe'

export interface AttachPaymentMethodData {
  customerId: string
  paymentMethodId: string
  setAsDefault?: boolean
}

/**
 * Attach a payment method to a customer
 */
export async function attachPaymentMethod(data: AttachPaymentMethodData) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Attach payment method to customer in Stripe
    await stripe.paymentMethods.attach(data.paymentMethodId, {
      customer: customer.stripeCustomerId
    })

    // Retrieve payment method details
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(data.paymentMethodId)

    // Store payment method in database
    const paymentMethod = await prisma.stripePaymentMethod.create({
      data: {
        customerId: data.customerId,
        stripePaymentMethodId: data.paymentMethodId,
        type: mapPaymentMethodType(stripePaymentMethod.type),
        cardBrand: stripePaymentMethod.card?.brand?.toUpperCase(),
        cardLast4: stripePaymentMethod.card?.last4,
        cardExpMonth: stripePaymentMethod.card?.exp_month,
        cardExpYear: stripePaymentMethod.card?.exp_year,
        bankName: stripePaymentMethod.us_bank_account?.bank_name,
        bankLast4: stripePaymentMethod.us_bank_account?.last4,
        isDefault: data.setAsDefault || false,
        billingDetails: (stripePaymentMethod.billing_details as any) || {},
        metadata: stripePaymentMethod.metadata || {}
      }
    })

    // Set as default if requested
    if (data.setAsDefault) {
      await setDefaultPaymentMethod(data.customerId, paymentMethod.id)
    }

    return { paymentMethod, stripePaymentMethod }
  } catch (error) {
    console.error('Error attaching payment method:', error)
    throw error
  }
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await prisma.stripePaymentMethod.findMany({
      where: {
        customerId,
        isActive: true
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return paymentMethods
  } catch (error) {
    console.error('Error getting payment methods:', error)
    throw error
  }
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    const paymentMethod = await prisma.stripePaymentMethod.findUnique({
      where: { id: paymentMethodId }
    })

    if (!paymentMethod || paymentMethod.customerId !== customerId) {
      throw new Error('Payment method not found or does not belong to customer')
    }

    // Remove default flag from all payment methods
    await prisma.stripePaymentMethod.updateMany({
      where: { customerId },
      data: { isDefault: false }
    })

    // Set new default
    const updatedPaymentMethod = await prisma.stripePaymentMethod.update({
      where: { id: paymentMethodId },
      data: { isDefault: true }
    })

    // Update default in Stripe
    await stripe.customers.update(customer.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.stripePaymentMethodId
      }
    })

    // Update customer record
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        defaultPaymentMethodId: paymentMethod.stripePaymentMethodId
      }
    })

    return updatedPaymentMethod
  } catch (error) {
    console.error('Error setting default payment method:', error)
    throw error
  }
}

/**
 * Detach payment method from customer
 */
export async function detachPaymentMethod(paymentMethodId: string) {
  try {
    const paymentMethod = await prisma.stripePaymentMethod.findUnique({
      where: { id: paymentMethodId },
      include: { customer: true }
    })

    if (!paymentMethod) {
      throw new Error('Payment method not found')
    }

    // Check if it's the default payment method
    if (paymentMethod.isDefault) {
      // Check if there are other payment methods
      const otherPaymentMethods = await prisma.stripePaymentMethod.findMany({
        where: {
          customerId: paymentMethod.customerId,
          id: { not: paymentMethodId },
          isActive: true
        }
      })

      if (otherPaymentMethods.length > 0) {
        // Set the first other payment method as default
        await setDefaultPaymentMethod(paymentMethod.customerId, otherPaymentMethods[0].id)
      }
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethod.stripePaymentMethodId)

    // Deactivate in database (soft delete)
    const updatedPaymentMethod = await prisma.stripePaymentMethod.update({
      where: { id: paymentMethodId },
      data: {
        isActive: false,
        isDefault: false
      }
    })

    return updatedPaymentMethod
  } catch (error) {
    console.error('Error detaching payment method:', error)
    throw error
  }
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(paymentMethodId: string, updateData: {
  billingDetails?: Stripe.PaymentMethodUpdateParams.BillingDetails
  metadata?: Record<string, string>
}) {
  try {
    const paymentMethod = await prisma.stripePaymentMethod.findUnique({
      where: { id: paymentMethodId }
    })

    if (!paymentMethod) {
      throw new Error('Payment method not found')
    }

    // Update in Stripe
    const stripePaymentMethod = await stripe.paymentMethods.update(
      paymentMethod.stripePaymentMethodId,
      {
        billing_details: updateData.billingDetails,
        metadata: updateData.metadata
      }
    )

    // Update in database
    const updatedPaymentMethod = await prisma.stripePaymentMethod.update({
      where: { id: paymentMethodId },
      data: {
        billingDetails: (stripePaymentMethod.billing_details as any) || {},
        metadata: stripePaymentMethod.metadata || {}
      }
    })

    return { paymentMethod: updatedPaymentMethod, stripePaymentMethod }
  } catch (error) {
    console.error('Error updating payment method:', error)
    throw error
  }
}

/**
 * Create Setup Intent for adding new payment method
 */
export async function createSetupIntent(customerId: string, paymentMethodTypes: string[] = ['card']) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: customer.stripeCustomerId,
      payment_method_types: paymentMethodTypes,
      usage: 'off_session',
      metadata: {
        customerId: customerId
      }
    })

    return setupIntent
  } catch (error) {
    console.error('Error creating setup intent:', error)
    throw error
  }
}

/**
 * Get payment method from Stripe and sync to database
 */
export async function syncPaymentMethodFromStripe(stripePaymentMethodId: string) {
  try {
    const stripePaymentMethod = await stripe.paymentMethods.retrieve(stripePaymentMethodId)

    if (!stripePaymentMethod.customer) {
      throw new Error('Payment method is not attached to a customer')
    }

    const customer = await prisma.customer.findUnique({
      where: { stripeCustomerId: stripePaymentMethod.customer as string }
    })

    if (!customer) {
      throw new Error('Customer not found in database')
    }

    // Check if payment method already exists
    let paymentMethod = await prisma.stripePaymentMethod.findUnique({
      where: { stripePaymentMethodId }
    })

    if (paymentMethod) {
      // Update existing payment method
      paymentMethod = await prisma.stripePaymentMethod.update({
        where: { id: paymentMethod.id },
        data: {
          type: mapPaymentMethodType(stripePaymentMethod.type),
          cardBrand: stripePaymentMethod.card?.brand?.toUpperCase(),
          cardLast4: stripePaymentMethod.card?.last4,
          cardExpMonth: stripePaymentMethod.card?.exp_month,
          cardExpYear: stripePaymentMethod.card?.exp_year,
          bankName: stripePaymentMethod.us_bank_account?.bank_name,
          bankLast4: stripePaymentMethod.us_bank_account?.last4,
          billingDetails: (stripePaymentMethod.billing_details as any) || {},
          metadata: stripePaymentMethod.metadata || {}
        }
      })
    } else {
      // Create new payment method
      paymentMethod = await prisma.stripePaymentMethod.create({
        data: {
          customerId: customer.id,
          stripePaymentMethodId,
          type: mapPaymentMethodType(stripePaymentMethod.type),
          cardBrand: stripePaymentMethod.card?.brand?.toUpperCase(),
          cardLast4: stripePaymentMethod.card?.last4,
          cardExpMonth: stripePaymentMethod.card?.exp_month,
          cardExpYear: stripePaymentMethod.card?.exp_year,
          bankName: stripePaymentMethod.us_bank_account?.bank_name,
          bankLast4: stripePaymentMethod.us_bank_account?.last4,
          billingDetails: (stripePaymentMethod.billing_details as any) || {},
          metadata: stripePaymentMethod.metadata || {}
        }
      })
    }

    return { paymentMethod, stripePaymentMethod }
  } catch (error) {
    console.error('Error syncing payment method from Stripe:', error)
    throw error
  }
}

/**
 * Map Stripe payment method type to database enum
 * Schema enum: CARD, BANK_ACCOUNT, SEPA_DEBIT
 */
function mapPaymentMethodType(stripeType: string): PaymentMethod_Type {
  const typeMap: Record<string, PaymentMethod_Type> = {
    'card': 'CARD',
    'us_bank_account': 'BANK_ACCOUNT',
    'sepa_debit': 'SEPA_DEBIT',
    'ach_debit': 'BANK_ACCOUNT',
    'au_becs_debit': 'BANK_ACCOUNT',
    'bacs_debit': 'BANK_ACCOUNT',
    'ideal': 'BANK_ACCOUNT',
    'sofort': 'BANK_ACCOUNT',
    'giropay': 'BANK_ACCOUNT',
    'eps': 'BANK_ACCOUNT',
    'bancontact': 'BANK_ACCOUNT',
    'alipay': 'CARD',
    'wechat_pay': 'CARD',
    'paypal': 'CARD',
    'wire': 'BANK_ACCOUNT',
    'check': 'BANK_ACCOUNT',
    'cash': 'CARD'
  }

  return typeMap[stripeType] || 'CARD'
}
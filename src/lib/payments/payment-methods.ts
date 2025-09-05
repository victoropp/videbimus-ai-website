import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export interface AttachPaymentMethodData {
  customerId: string
  paymentMethodId: string
  setAsDefault?: boolean
}

export interface CreateSetupIntentData {
  customerId: string
  paymentMethodTypes?: string[]
  usage?: 'on_session' | 'off_session'
  returnUrl?: string
}

export interface PaymentMethodDetails {
  id: string
  type: string
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  billingDetails?: {
    name?: string
    email?: string
    address?: any
  }
}

/**
 * Attach a payment method to a customer
 */
export async function attachPaymentMethod(data: AttachPaymentMethodData) {
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  // Attach payment method to customer in Stripe
  const paymentMethod = await stripe.paymentMethods.attach(
    data.paymentMethodId,
    { customer: customer.stripeCustomerId }
  )

  // Store payment method in our database
  const paymentMethodData = await prisma.paymentMethodData.create({
    data: {
      customerId: data.customerId,
      stripeId: paymentMethod.id,
      type: paymentMethod.type,
      cardBrand: paymentMethod.card?.brand,
      cardLast4: paymentMethod.card?.last4,
      cardExpMonth: paymentMethod.card?.exp_month,
      cardExpYear: paymentMethod.card?.exp_year,
      isDefault: data.setAsDefault || false,
      billingName: paymentMethod.billing_details?.name,
      billingEmail: paymentMethod.billing_details?.email
    }
  })

  if (data.setAsDefault) {
    // Update customer's default payment method
    await prisma.customer.update({
      where: { id: data.customerId },
      data: { defaultPaymentMethodId: paymentMethodData.id }
    })

    // Update other payment methods to not be default
    await prisma.paymentMethodData.updateMany({
      where: {
        customerId: data.customerId,
        id: { not: paymentMethodData.id }
      },
      data: { isDefault: false }
    })
  }

  return paymentMethodData
}

/**
 * Detach a payment method from a customer
 */
export async function detachPaymentMethod(
  customerId: string,
  paymentMethodId: string
) {
  const paymentMethodData = await prisma.paymentMethodData.findFirst({
    where: {
      customerId,
      id: paymentMethodId
    },
    include: { customer: true }
  })

  if (!paymentMethodData) {
    throw new Error('Payment method not found')
  }

  // Detach from Stripe
  await stripe.paymentMethods.detach(paymentMethodData.stripeId)

  // Remove from our database
  await prisma.paymentMethodData.delete({
    where: { id: paymentMethodId }
  })

  // If this was the default payment method, clear it from customer
  if (paymentMethodData.isDefault) {
    await prisma.customer.update({
      where: { id: customerId },
      data: { defaultPaymentMethodId: null }
    })
  }

  return { success: true }
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(
  customerId: string,
  type?: string
): Promise<PaymentMethodDetails[]> {
  const whereClause: any = { customerId }
  if (type) {
    whereClause.type = type
  }

  const paymentMethods = await prisma.paymentMethodData.findMany({
    where: whereClause,
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  })

  return paymentMethods.map(pm => ({
    id: pm.id,
    type: pm.type,
    card: pm.cardBrand ? {
      brand: pm.cardBrand,
      last4: pm.cardLast4 || '',
      expMonth: pm.cardExpMonth || 0,
      expYear: pm.cardExpYear || 0
    } : undefined,
    billingDetails: {
      name: pm.billingName || undefined,
      email: pm.billingEmail || undefined
    }
  }))
}

/**
 * Set default payment method for customer
 */
export async function setDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
) {
  const paymentMethod = await prisma.paymentMethodData.findFirst({
    where: {
      customerId,
      id: paymentMethodId
    }
  })

  if (!paymentMethod) {
    throw new Error('Payment method not found')
  }

  // Update all payment methods for this customer to not be default
  await prisma.paymentMethodData.updateMany({
    where: { customerId },
    data: { isDefault: false }
  })

  // Set the selected payment method as default
  await prisma.paymentMethodData.update({
    where: { id: paymentMethodId },
    data: { isDefault: true }
  })

  // Update customer record
  await prisma.customer.update({
    where: { id: customerId },
    data: { defaultPaymentMethodId: paymentMethodId }
  })

  return { success: true }
}

/**
 * Create setup intent for saving payment methods
 */
export async function createSetupIntent(data: CreateSetupIntentData) {
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customer.stripeCustomerId,
    payment_method_types: data.paymentMethodTypes || ['card'],
    usage: data.usage || 'off_session'
  })

  return {
    id: setupIntent.id,
    client_secret: setupIntent.client_secret,
    status: setupIntent.status
  }
}

/**
 * Confirm setup intent
 */
export async function confirmSetupIntent(
  setupIntentId: string,
  paymentMethod: string,
  returnUrl?: string
) {
  const setupIntent = await stripe.setupIntents.confirm(setupIntentId, {
    payment_method: paymentMethod,
    return_url: returnUrl
  })

  return {
    id: setupIntent.id,
    status: setupIntent.status,
    payment_method: setupIntent.payment_method
  }
}

/**
 * Get payment method details
 */
export async function getPaymentMethodDetails(
  paymentMethodId: string
): Promise<PaymentMethodDetails> {
  const paymentMethod = await prisma.paymentMethodData.findUnique({
    where: { id: paymentMethodId }
  })

  if (!paymentMethod) {
    throw new Error('Payment method not found')
  }

  return {
    id: paymentMethod.id,
    type: paymentMethod.type,
    card: paymentMethod.cardBrand ? {
      brand: paymentMethod.cardBrand,
      last4: paymentMethod.cardLast4 || '',
      expMonth: paymentMethod.cardExpMonth || 0,
      expYear: paymentMethod.cardExpYear || 0
    } : undefined,
    billingDetails: {
      name: paymentMethod.billingName || undefined,
      email: paymentMethod.billingEmail || undefined
    }
  }
}

/**
 * Update payment method billing details
 */
export async function updatePaymentMethodBillingDetails(
  paymentMethodId: string,
  billingDetails: any
) {
  const paymentMethodData = await prisma.paymentMethodData.findUnique({
    where: { id: paymentMethodId }
  })

  if (!paymentMethodData) {
    throw new Error('Payment method not found')
  }

  // Update in Stripe
  await stripe.paymentMethods.update(
    paymentMethodData.stripeId,
    { billing_details: billingDetails }
  )

  // Update in our database
  const updatedPaymentMethod = await prisma.paymentMethodData.update({
    where: { id: paymentMethodId },
    data: { 
      billingName: billingDetails.name,
      billingEmail: billingDetails.email
    }
  })

  return updatedPaymentMethod
}


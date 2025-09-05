import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export interface CreateCustomerData {
  userId: string
  email: string
  name?: string
  phone?: string
  metadata?: Record<string, string>
}

export interface UpdateCustomerData {
  name?: string
  email?: string
  phone?: string
  defaultPaymentMethod?: string
  metadata?: Record<string, string>
}

/**
 * Create a new Stripe customer and store in database
 */
export async function createCustomer(data: CreateCustomerData) {
  const stripeCustomer = await stripe.customers.create({
    email: data.email,
    name: data.name,
    phone: data.phone,
    metadata: data.metadata || {}
  })

  const customer = await prisma.customer.create({
    data: {
      userId: data.userId,
      stripeCustomerId: stripeCustomer.id,
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata || {}
    },
    include: {
      user: true
    }
  })

  return customer
}

/**
 * Get customer by user ID
 */
export async function getCustomerByUserId(userId: string) {
  return await prisma.customer.findUnique({
    where: { userId },
    include: {
      user: true,
      subscriptions: true,
      paymentMethods: true,
      billingAddress: true,
      credits: true
    }
  })
}

/**
 * Get customer by Stripe customer ID
 */
export async function getCustomerByStripeId(stripeCustomerId: string) {
  return await prisma.customer.findUnique({
    where: { stripeCustomerId },
    include: {
      user: true,
      subscriptions: true,
      paymentMethods: true,
      billingAddress: true,
      credits: true
    }
  })
}

/**
 * Update customer information
 */
export async function updateCustomer(customerId: string, data: UpdateCustomerData) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.defaultPaymentMethod !== undefined) updateData.defaultPaymentMethodId = data.defaultPaymentMethod
  if (data.metadata !== undefined) updateData.metadata = data.metadata

  // Update Stripe customer if needed
  const stripeUpdateData: Stripe.CustomerUpdateParams = {}
  if (data.name !== undefined) stripeUpdateData.name = data.name
  if (data.email !== undefined) stripeUpdateData.email = data.email
  if (data.phone !== undefined) stripeUpdateData.phone = data.phone
  if (data.metadata !== undefined) stripeUpdateData.metadata = data.metadata

  if (Object.keys(stripeUpdateData).length > 0) {
    await stripe.customers.update(customer.stripeCustomerId, stripeUpdateData)
  }

  return await prisma.customer.update({
    where: { id: customerId },
    data: updateData,
    include: {
      user: true,
      subscriptions: true,
      paymentMethods: true,
      billingAddress: true,
      credits: true
    }
  })
}

/**
 * Delete customer (soft delete - deactivate)
 */
export async function deleteCustomer(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  // Delete in Stripe (this deactivates the customer)
  await stripe.customers.del(customer.stripeCustomerId)

  // Delete from our database (cascade will handle relations)
  await prisma.customer.delete({
    where: { id: customerId }
  })

  return { success: true }
}

/**
 * Get customer portal URL for self-service billing
 */
export async function getCustomerPortalUrl(customerId: string, returnUrl?: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId }
  })

  if (!customer) {
    throw new Error('Customer not found')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripeCustomerId,
    return_url: returnUrl || process.env.NEXT_PUBLIC_SITE_URL
  })

  return session.url
}

/**
 * Sync customer data from Stripe
 */
export async function syncCustomerFromStripe(stripeCustomerId: string) {
  const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId)
  
  if (stripeCustomer.deleted) {
    // If customer was deleted in Stripe, delete from our DB too
    const existingCustomer = await prisma.customer.findUnique({
      where: { stripeCustomerId }
    })
    
    if (existingCustomer) {
      await prisma.customer.delete({
        where: { id: existingCustomer.id }
      })
    }
    
    return null
  }

  // Type guard to ensure we have a valid customer
  if ('email' in stripeCustomer) {
    const customer = await prisma.customer.upsert({
      where: { stripeCustomerId },
      update: {
        email: stripeCustomer.email || '',
        name: stripeCustomer.name,
        phone: stripeCustomer.phone,
        metadata: stripeCustomer.metadata || {}
      },
      create: {
        userId: '', // This would need to be handled separately
        stripeCustomerId: stripeCustomer.id,
        email: stripeCustomer.email || '',
        name: stripeCustomer.name,
        phone: stripeCustomer.phone,
        metadata: stripeCustomer.metadata || {}
      },
      include: {
        user: true,
        subscriptions: true,
        paymentMethods: true
      }
    })

    return customer
  }

  return null
}


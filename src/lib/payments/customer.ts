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
  try {
    // Check if customer already exists
    // Note: Customer model needs to be added to schema.prisma
    const existingCustomer = await prisma.customer.findFirst({
      where: { userId: data.userId }
    })

    if (existingCustomer) {
      throw new Error('Customer already exists for this user')
    }

    // Create customer in Stripe
    const stripeCustomer = await stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: {
        userId: data.userId,
        ...data.metadata
      }
    })

    // Store customer in database
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
        user: true,
        billingAddress: true,
        paymentMethods: true
      }
    })

    // Update user with Stripe customer ID
    // Note: stripeCustomerId field needs to be added to User model
    await (prisma as any).user.update({
      where: { id: data.userId },
      data: { stripeCustomerId: stripeCustomer.id }
    })

    return { customer, stripeCustomer }
  } catch (error) {
    console.error('Error creating customer:', error)
    throw error
  }
}

/**
 * Get customer by user ID
 */
export async function getCustomerByUserId(userId: string) {
  try {
    const customer = await prisma.customer.findFirst({
      where: { userId },
      include: {
        user: true,
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'TRIALING'] } },
          include: {
            subscriptionItems: true
          }
        },
        paymentMethods: {
          where: { isActive: true },
          orderBy: { isDefault: 'desc' }
        },
        billingAddress: true,
        credits: {
          where: { balance: { gt: 0 } },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    return customer
  } catch (error) {
    console.error('Error getting customer:', error)
    throw error
  }
}

/**
 * Get customer by Stripe customer ID
 */
export async function getCustomerByStripeId(stripeCustomerId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { stripeCustomerId },
      include: {
        user: true,
        subscriptions: {
          include: {
            subscriptionItems: true
          }
        },
        paymentMethods: true,
        billingAddress: true
      }
    })

    return customer
  } catch (error) {
    console.error('Error getting customer by Stripe ID:', error)
    throw error
  }
}

/**
 * Update customer information
 */
export async function updateCustomer(customerId: string, data: UpdateCustomerData) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Update in Stripe
    const stripeCustomer = await stripe.customers.update(customer.stripeCustomerId, {
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: data.metadata
    })

    // Update in database
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        defaultPaymentMethodId: data.defaultPaymentMethod,
        metadata: data.metadata || {}
      },
      include: {
        user: true,
        subscriptions: true,
        paymentMethods: true,
        billingAddress: true
      }
    })

    return { customer: updatedCustomer, stripeCustomer }
  } catch (error) {
    console.error('Error updating customer:', error)
    throw error
  }
}

/**
 * Delete customer (soft delete - deactivate)
 */
export async function deleteCustomer(customerId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'TRIALING'] } }
        }
      }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Check for active subscriptions
    if (customer.subscriptions.length > 0) {
      throw new Error('Cannot delete customer with active subscriptions')
    }

    // Delete from Stripe (this will also cancel any active subscriptions)
    await stripe.customers.del(customer.stripeCustomerId)

    // Soft delete in database by updating metadata
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        metadata: {
          ...(customer.metadata as object),
          deleted: true,
          deletedAt: new Date().toISOString()
        }
      }
    })

    return true
  } catch (error) {
    console.error('Error deleting customer:', error)
    throw error
  }
}

/**
 * Get customer portal URL for self-service billing
 */
export async function getCustomerPortalUrl(customerId: string, returnUrl?: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId,
      return_url: returnUrl || process.env.NEXT_PUBLIC_APP_URL + '/billing'
    })

    return portalSession.url
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    throw error
  }
}

/**
 * Sync customer data from Stripe
 */
export async function syncCustomerFromStripe(stripeCustomerId: string) {
  try {
    // Get customer from Stripe
    const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId) as Stripe.Customer

    // Find customer in database
    const customer = await prisma.customer.findUnique({
      where: { stripeCustomerId }
    })

    if (!customer) {
      throw new Error('Customer not found in database')
    }

    // Update customer with Stripe data
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        email: stripeCustomer.email!,
        name: stripeCustomer.name,
        phone: stripeCustomer.phone,
        defaultPaymentMethodId: stripeCustomer.invoice_settings?.default_payment_method as string,
        metadata: stripeCustomer.metadata || {}
      }
    })

    return updatedCustomer
  } catch (error) {
    console.error('Error syncing customer from Stripe:', error)
    throw error
  }
}
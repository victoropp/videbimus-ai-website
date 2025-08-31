import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/auth'
import { 
  attachPaymentMethod, 
  getCustomerPaymentMethods, 
  setDefaultPaymentMethod,
  detachPaymentMethod,
  updatePaymentMethod,
  createSetupIntent
} from '@/lib/payments/payment-methods'
import { getCustomerByUserId } from '@/lib/payments/customer'
import { z } from 'zod'

const attachPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(1),
  setAsDefault: z.boolean().optional()
})

const updatePaymentMethodSchema = z.object({
  billingDetails: z.object({
    address: z.object({
      city: z.string().optional(),
      country: z.string().optional(),
      line1: z.string().optional(),
      line2: z.string().optional(),
      postal_code: z.string().optional(),
      state: z.string().optional()
    }).optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    phone: z.string().optional()
  }).optional(),
  metadata: z.record(z.string()).optional()
})

const createSetupIntentSchema = z.object({
  paymentMethodTypes: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customer = await getCustomerByUserId(session.user.id)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const paymentMethods = await getCustomerPaymentMethods(customer.id)

    return NextResponse.json({ paymentMethods })
  } catch (error) {
    console.error('Error getting payment methods:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = attachPaymentMethodSchema.parse(body)

    const customer = await getCustomerByUserId(session.user.id)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const result = await attachPaymentMethod({
      customerId: customer.id,
      paymentMethodId: validatedData.paymentMethodId,
      setAsDefault: validatedData.setAsDefault
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error attaching payment method:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentMethodId, ...updateData } = body
    
    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 })
    }

    const validatedData = updatePaymentMethodSchema.parse(updateData)

    // Verify payment method belongs to user
    const customer = await getCustomerByUserId(session.user.id)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const paymentMethods = await getCustomerPaymentMethods(customer.id)
    const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId)
    
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found or does not belong to user' }, { status: 404 })
    }

    const result = await updatePaymentMethod(paymentMethodId, validatedData)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating payment method:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentMethodId = searchParams.get('paymentMethodId')
    
    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 })
    }

    // Verify payment method belongs to user
    const customer = await getCustomerByUserId(session.user.id)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const paymentMethods = await getCustomerPaymentMethods(customer.id)
    const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId)
    
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Payment method not found or does not belong to user' }, { status: 404 })
    }

    const result = await detachPaymentMethod(paymentMethodId)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error detaching payment method:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
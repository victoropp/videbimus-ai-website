import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'

import { createCustomer, getCustomerByUserId, updateCustomer } from '@/lib/payments/customer'
import { z } from 'zod'

const createCustomerSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  metadata: z.record(z.string()).optional()
})

const updateCustomerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  defaultPaymentMethod: z.string().optional(),
  metadata: z.record(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customer = await getCustomerByUserId(session.user.id)
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error('Error getting customer:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCustomerSchema.parse(body)

    // Check if customer already exists
    const existingCustomer = await getCustomerByUserId(session.user.id)
    if (existingCustomer) {
      return NextResponse.json({ error: 'Customer already exists' }, { status: 409 })
    }

    const { customer, stripeCustomer } = await createCustomer({
      userId: session.user.id,
      email: session.user.email,
      name: validatedData.name || session.user.name || undefined,
      phone: validatedData.phone,
      metadata: validatedData.metadata
    })

    return NextResponse.json({ customer, stripeCustomer })
  } catch (error) {
    console.error('Error creating customer:', error)
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
    const validatedData = updateCustomerSchema.parse(body)

    const customer = await getCustomerByUserId(session.user.id)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const { customer: updatedCustomer, stripeCustomer } = await updateCustomer(
      customer.id,
      validatedData
    )

    return NextResponse.json({ customer: updatedCustomer, stripeCustomer })
  } catch (error) {
    console.error('Error updating customer:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
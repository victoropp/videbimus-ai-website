import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/auth'
import { 
  createPaymentIntent,
  confirmPaymentIntent,
  getPaymentIntentStatus,
  cancelPaymentIntent
} from '@/lib/payments/one-time-payments'
import { getCustomerByUserId } from '@/lib/payments/customer'
import { z } from 'zod'

const createPaymentIntentSchema = z.object({
  amount: z.number().min(50), // Minimum $0.50
  currency: z.string().optional(),
  description: z.string().optional(),
  paymentMethodId: z.string().optional(),
  confirmPayment: z.boolean().optional(),
  receiptEmail: z.string().email().optional(),
  metadata: z.record(z.string()).optional()
})

const confirmPaymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1),
  paymentMethodId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'confirm') {
      return await handleConfirmPaymentIntent(request, session.user.id)
    } else if (action === 'cancel') {
      return await handleCancelPaymentIntent(request, session.user.id)
    } else {
      return await handleCreatePaymentIntent(request, session.user.id)
    }
  } catch (error) {
    console.error('Error in payment intent API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentIntentId = searchParams.get('paymentIntentId')

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 })
    }

    const paymentIntent = await getPaymentIntentStatus(paymentIntentId)

    return NextResponse.json({ paymentIntent })
  } catch (error) {
    console.error('Error getting payment intent status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleCreatePaymentIntent(request: NextRequest, userId: string) {
  const body = await request.json()
  const validatedData = createPaymentIntentSchema.parse(body)

  const customer = await getCustomerByUserId(userId)
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found. Please create a customer profile first.' }, { status: 404 })
  }

  const result = await createPaymentIntent({
    customerId: customer.id,
    amount: validatedData.amount,
    currency: validatedData.currency,
    description: validatedData.description,
    paymentMethodId: validatedData.paymentMethodId,
    confirmPayment: validatedData.confirmPayment,
    receiptEmail: validatedData.receiptEmail,
    metadata: validatedData.metadata
  })

  return NextResponse.json(result)
}

async function handleConfirmPaymentIntent(request: NextRequest, userId: string) {
  const body = await request.json()
  const validatedData = confirmPaymentIntentSchema.parse(body)

  // Verify the payment intent belongs to this user
  const customer = await getCustomerByUserId(userId)
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  const paymentIntent = await confirmPaymentIntent(
    validatedData.paymentIntentId,
    validatedData.paymentMethodId
  )

  return NextResponse.json({ paymentIntent })
}

async function handleCancelPaymentIntent(request: NextRequest, userId: string) {
  const body = await request.json()
  const { paymentIntentId } = body

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Payment intent ID is required' }, { status: 400 })
  }

  // Verify the payment intent belongs to this user
  const customer = await getCustomerByUserId(userId)
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  const paymentIntent = await cancelPaymentIntent(paymentIntentId)

  return NextResponse.json({ paymentIntent })
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/auth'

import { createSetupIntent } from '@/lib/payments/payment-methods'
import { getCustomerByUserId } from '@/lib/payments/customer'
import { z } from 'zod'

const createSetupIntentSchema = z.object({
  paymentMethodTypes: z.array(z.string()).optional()
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSetupIntentSchema.parse(body)

    const customer = await getCustomerByUserId(session.user.id)
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const setupIntent = await createSetupIntent(
      customer.id, 
      validatedData.paymentMethodTypes || ['card']
    )

    return NextResponse.json({ setupIntent })
  } catch (error) {
    console.error('Error creating setup intent:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
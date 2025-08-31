import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  tags: z.array(z.string()).default([]),
  preferences: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
    categories: z.array(z.string()).default([])
  }).optional()
})

// POST /api/newsletter/subscribe - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const data = subscribeSchema.parse(json)

    // Check if email is already subscribed
    const existingSubscription = await prisma.emailSubscription.findUnique({
      where: { email: data.email }
    })

    if (existingSubscription) {
      if (existingSubscription.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'Email is already subscribed' },
          { status: 400 }
        )
      } else {
        // Reactivate subscription
        const subscription = await prisma.emailSubscription.update({
          where: { email: data.email },
          data: {
            status: 'ACTIVE',
            tags: data.tags,
            preferences: data.preferences,
            unsubscribedAt: null,
            verifiedAt: new Date()
          }
        })

        // Send welcome email
        try {
          await resend.emails.send({
            from: process.env.FROM_EMAIL || 'noreply@vidibemus.com',
            to: [data.email],
            subject: 'Welcome back to Vidibemus AI Newsletter',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1f2937; text-align: center;">Welcome back!</h1>
                <p>Thank you for resubscribing to the Vidibemus AI Newsletter.</p>
                <p>You'll receive the latest insights on AI, machine learning, and data science directly to your inbox.</p>
                <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                  <h3 style="color: #374151; margin-top: 0;">Your Preferences:</h3>
                  <p><strong>Frequency:</strong> ${data.preferences?.frequency || 'Weekly'}</p>
                  <p><strong>Topics:</strong> ${data.tags.length > 0 ? data.tags.join(', ') : 'All topics'}</p>
                </div>
                <p style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXTAUTH_URL}/newsletter/unsubscribe?email=${encodeURIComponent(data.email)}" 
                     style="color: #6b7280; text-decoration: none; font-size: 12px;">
                    Unsubscribe from this newsletter
                  </a>
                </p>
              </div>
            `
          })
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError)
          // Don't fail the subscription if email fails
        }

        return NextResponse.json({
          message: 'Successfully resubscribed to newsletter',
          subscription
        })
      }
    }

    // Create new subscription
    const subscription = await prisma.emailSubscription.create({
      data: {
        email: data.email,
        status: 'ACTIVE',
        tags: data.tags,
        preferences: data.preferences,
        verifiedAt: new Date()
      }
    })

    // Send welcome email
    try {
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@vidibemus.com',
        to: [data.email],
        subject: 'Welcome to Vidibemus AI Newsletter',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1f2937; text-align: center;">Welcome to Vidibemus AI!</h1>
            <p>Thank you for subscribing to our newsletter. You've taken the first step to stay updated with the latest in AI and data science.</p>
            
            <div style="margin: 20px 0; padding: 20px; background-color: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
              <h3 style="color: #0c4a6e; margin-top: 0;">What to expect:</h3>
              <ul style="color: #374151;">
                <li>Latest AI trends and insights</li>
                <li>Expert analysis and case studies</li>
                <li>Practical implementation guides</li>
                <li>Industry news and updates</li>
              </ul>
            </div>

            ${data.preferences ? `
              <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                <h3 style="color: #374151; margin-top: 0;">Your Preferences:</h3>
                <p><strong>Frequency:</strong> ${data.preferences.frequency || 'Weekly'}</p>
                <p><strong>Topics:</strong> ${data.tags.length > 0 ? data.tags.join(', ') : 'All topics'}</p>
              </div>
            ` : ''}
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}" 
                 style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Visit Our Blog
              </a>
            </p>
            
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL}/newsletter/unsubscribe?email=${encodeURIComponent(data.email)}" 
                 style="color: #6b7280; text-decoration: none; font-size: 12px;">
                Unsubscribe from this newsletter
              </a>
            </p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      subscription
    }, { status: 201 })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}

// GET /api/newsletter/subscribe - Get subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const subscription = await prisma.emailSubscription.findUnique({
      where: { email }
    })

    if (!subscription) {
      return NextResponse.json({
        subscribed: false,
        status: null
      })
    }

    return NextResponse.json({
      subscribed: subscription.status === 'ACTIVE',
      status: subscription.status,
      preferences: subscription.preferences,
      tags: subscription.tags,
      subscribedAt: subscription.createdAt
    })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to check subscription status' },
      { status: 500 }
    )
  }
}
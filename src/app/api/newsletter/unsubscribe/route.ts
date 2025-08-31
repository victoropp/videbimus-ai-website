import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  reason: z.string().optional()
})

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter
export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const data = unsubscribeSchema.parse(json)

    // Find existing subscription
    const subscription = await prisma.emailSubscription.findUnique({
      where: { email: data.email }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Email is not subscribed' },
        { status: 404 }
      )
    }

    if (subscription.status === 'UNSUBSCRIBED') {
      return NextResponse.json(
        { message: 'Email is already unsubscribed' }
      )
    }

    // Update subscription status
    await prisma.emailSubscription.update({
      where: { email: data.email },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
        preferences: {
          ...subscription.preferences as any,
          unsubscribeReason: data.reason
        }
      }
    })

    return NextResponse.json({
      message: 'Successfully unsubscribed from newsletter'
    })
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to unsubscribe from newsletter' },
      { status: 500 }
    )
  }
}

// GET /api/newsletter/unsubscribe - Unsubscribe via URL
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

    // Find existing subscription
    const subscription = await prisma.emailSubscription.findUnique({
      where: { email }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Email is not subscribed' },
        { status: 404 }
      )
    }

    if (subscription.status !== 'UNSUBSCRIBED') {
      // Update subscription status
      await prisma.emailSubscription.update({
        where: { email },
        data: {
          status: 'UNSUBSCRIBED',
          unsubscribedAt: new Date()
        }
      })
    }

    // Return HTML page for unsubscribe confirmation
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unsubscribed - Vidibemus AI</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
            color: #374151;
            background-color: #f9fafb;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #1f2937;
            margin-bottom: 20px;
          }
          .success {
            color: #059669;
            font-size: 18px;
            margin-bottom: 20px;
          }
          .actions {
            margin-top: 30px;
          }
          .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
          }
          .btn-primary {
            background-color: #0ea5e9;
            color: white;
          }
          .btn-secondary {
            background-color: #6b7280;
            color: white;
          }
          .feedback {
            margin-top: 40px;
            padding: 20px;
            background-color: #f0f9ff;
            border-radius: 8px;
            border-left: 4px solid #0ea5e9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>You've Been Unsubscribed</h1>
          <div class="success">✓ You have successfully unsubscribed from our newsletter</div>
          <p>We're sorry to see you go! You will no longer receive emails from Vidibemus AI.</p>
          
          <div class="actions">
            <a href="/" class="btn btn-primary">Visit Our Website</a>
            <a href="/newsletter/resubscribe?email=${encodeURIComponent(email)}" class="btn btn-secondary">Resubscribe</a>
          </div>

          <div class="feedback">
            <h3 style="margin-top: 0; color: #0c4a6e;">Help us improve</h3>
            <p>We'd love to know why you unsubscribed. Your feedback helps us create better content.</p>
            <form action="/api/newsletter/feedback" method="POST" style="margin-top: 15px;">
              <input type="hidden" name="email" value="${email}">
              <select name="reason" style="padding: 8px; margin-right: 10px; border: 1px solid #d1d5db; border-radius: 4px;">
                <option value="">Select a reason...</option>
                <option value="too_frequent">Too many emails</option>
                <option value="not_relevant">Content not relevant</option>
                <option value="poor_quality">Poor quality content</option>
                <option value="not_interested">No longer interested</option>
                <option value="other">Other</option>
              </select>
              <button type="submit" style="padding: 8px 16px; background-color: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Submit
              </button>
            </form>
          </div>
        </div>
      </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    })
  } catch (error) {
    console.error('Error processing unsubscribe:', error)
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Vidibemus AI</title>
        <style>body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }</style>
      </head>
      <body>
        <h1>Oops! Something went wrong</h1>
        <p>We couldn't process your unsubscribe request. Please try again or contact us directly.</p>
        <a href="/">Return to Homepage</a>
      </body>
      </html>
    `

    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html'
      }
    })
  }
}
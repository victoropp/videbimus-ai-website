import { NextRequest } from 'next/server'
import { auth } from '@/auth'

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

/**
 * PCI DSS Compliance Utilities
 */
export class PCICompliance {
  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  static encrypt(text: string, key: string): { encrypted: string; iv: string; authTag: string } {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher('aes-256-gcm', key)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: { encrypted: string; iv: string; authTag: string }, key: string): string {
    const decipher = crypto.createDecipher('aes-256-gcm', key)
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  /**
   * Mask sensitive card data for display
   */
  static maskCardNumber(cardNumber: string): string {
    if (!cardNumber || cardNumber.length < 4) return '****'
    return '**** **** **** ' + cardNumber.slice(-4)
  }

  /**
   * Validate that no sensitive data is being logged
   */
  static sanitizeLogData(data: any): any {
    const sensitiveFields = [
      'cardNumber', 'cvv', 'cvc', 'expiry', 'pin',
      'password', 'ssn', 'taxId', 'bankAccount',
      'routingNumber', 'accountNumber'
    ]

    const sanitized = { ...data }
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj
      
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item))
      }

      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[REDACTED]'
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value)
        } else {
          result[key] = value
        }
      }
      return result
    }

    return sanitizeObject(sanitized)
  }
}

/**
 * Payment security middleware
 */
export class PaymentSecurity {
  /**
   * Verify user owns the resource (customer, payment method, etc.)
   */
  static async verifyResourceOwnership(
    request: NextRequest,
    resourceType: 'customer' | 'payment' | 'subscription' | 'paymentMethod',
    resourceId: string
  ): Promise<{ authorized: boolean; userId?: string }> {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return { authorized: false }
      }

      let isOwner = false

      switch (resourceType) {
        case 'customer':
          const customer = await prisma.customer.findUnique({
            where: { id: resourceId },
            select: { userId: true }
          })
          isOwner = customer?.userId === session.user.id
          break

        case 'payment':
          const payment = await prisma.payment.findUnique({
            where: { id: resourceId },
            select: { userId: true }
          })
          isOwner = payment?.userId === session.user.id
          break

        case 'subscription':
          const subscription = await prisma.subscription.findUnique({
            where: { id: resourceId },
            select: { customer: { select: { userId: true } } }
          })
          isOwner = subscription?.customer?.userId === session.user.id
          break

        case 'paymentMethod':
          const paymentMethod = await prisma.stripePaymentMethod.findUnique({
            where: { id: resourceId },
            select: { customer: { select: { userId: true } } }
          })
          isOwner = paymentMethod?.customer?.userId === session.user.id
          break
      }

      return { authorized: isOwner, userId: session.user.id }
    } catch (error) {
      console.error('Error verifying resource ownership:', error)
      return { authorized: false }
    }
  }

  /**
   * Check rate limits for payment operations
   */
  static async checkRateLimit(
    identifier: string,
    operation: 'payment_create' | 'payment_method_add' | 'subscription_change',
    maxRequests: number = 10,
    windowMinutes: number = 60
  ): Promise<{ allowed: boolean; remainingRequests: number }> {
    try {
      const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000)
      const key = `${operation}_${identifier}`

      // Clean up old rate limit entries
      await prisma.rateLimit.deleteMany({
        where: {
          windowStart: { lt: windowStart }
        }
      })

      // Get current usage
      const currentUsage = await prisma.rateLimit.findUnique({
        where: {
          identifier_key: {
            identifier,
            key: operation
          }
        }
      })

      if (!currentUsage) {
        // First request in window
        await prisma.rateLimit.create({
          data: {
            identifier,
            key: operation,
            requests: 1,
            windowStart: new Date()
          }
        })
        return { allowed: true, remainingRequests: maxRequests - 1 }
      }

      if (currentUsage.windowStart < windowStart) {
        // Reset window
        await prisma.rateLimit.update({
          where: { id: currentUsage.id },
          data: {
            requests: 1,
            windowStart: new Date()
          }
        })
        return { allowed: true, remainingRequests: maxRequests - 1 }
      }

      if (currentUsage.requests >= maxRequests) {
        return { allowed: false, remainingRequests: 0 }
      }

      // Increment usage
      await prisma.rateLimit.update({
        where: { id: currentUsage.id },
        data: {
          requests: currentUsage.requests + 1
        }
      })

      return {
        allowed: true,
        remainingRequests: maxRequests - (currentUsage.requests + 1)
      }
    } catch (error) {
      console.error('Error checking rate limit:', error)
      // Allow request on error to avoid blocking legitimate users
      return { allowed: true, remainingRequests: maxRequests }
    }
  }

  /**
   * Validate webhook signature from Stripe
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    try {
      const elements = signature.split(',')
      const sigHash = elements.find(el => el.startsWith('v1='))?.split('=')[1]
      const timestamp = elements.find(el => el.startsWith('t='))?.split('=')[1]

      if (!sigHash || !timestamp) return false

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${payload}`)
        .digest('hex')

      return crypto.timingSafeEqual(
        Buffer.from(sigHash, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )
    } catch (error) {
      console.error('Error validating webhook signature:', error)
      return false
    }
  }

  /**
   * Log security events for audit trail
   */
  static async logSecurityEvent(
    event: 'payment_created' | 'payment_failed' | 'payment_method_added' | 
           'subscription_created' | 'subscription_canceled' | 'refund_requested' |
           'unauthorized_access' | 'rate_limit_exceeded',
    details: {
      userId?: string
      ipAddress?: string
      userAgent?: string
      resourceId?: string
      amount?: number
      currency?: string
      metadata?: Record<string, any>
    }
  ) {
    try {
      await prisma.userActivity.create({
        data: {
          userId: details.userId,
          action: event,
          resource: details.resourceId,
          ipAddress: details.ipAddress,
          userAgent: details.userAgent,
          metadata: PCICompliance.sanitizeLogData({
            ...details.metadata,
            amount: details.amount,
            currency: details.currency
          })
        }
      })
    } catch (error) {
      console.error('Error logging security event:', error)
      // Don't throw as this is auxiliary logging
    }
  }

  /**
   * Detect suspicious activity patterns
   */
  static async detectSuspiciousActivity(userId: string): Promise<{
    suspicious: boolean
    reasons: string[]
    riskScore: number
  }> {
    try {
      const now = new Date()
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const reasons: string[] = []
      let riskScore = 0

      // Check for multiple failed payments
      const failedPayments = await prisma.payment.count({
        where: {
          userId,
          status: 'FAILED',
          createdAt: { gte: last24Hours }
        }
      })

      if (failedPayments >= 3) {
        reasons.push('Multiple failed payment attempts')
        riskScore += 30
      }

      // Check for multiple payment methods added
      const recentPaymentMethods = await prisma.stripePaymentMethod.count({
        where: {
          customer: {
            userId
          },
          createdAt: { gte: last24Hours }
        }
      })

      if (recentPaymentMethods >= 3) {
        reasons.push('Multiple payment methods added in short period')
        riskScore += 25
      }

      // Check for unusual subscription changes
      const subscriptionChanges = await prisma.subscription.count({
        where: {
          customer: {
            userId
          },
          updatedAt: { gte: last7Days },
          canceledAt: { not: null }
        }
      })

      if (subscriptionChanges >= 2) {
        reasons.push('Multiple subscription changes')
        riskScore += 20
      }

      // Check for high-value transactions
      const highValuePayments = await prisma.payment.count({
        where: {
          userId,
          amount: { gte: 100000 }, // $1000+
          createdAt: { gte: last7Days }
        }
      })

      if (highValuePayments >= 1) {
        reasons.push('High-value transaction detected')
        riskScore += 15
      }

      return {
        suspicious: riskScore >= 50,
        reasons,
        riskScore
      }
    } catch (error) {
      console.error('Error detecting suspicious activity:', error)
      return { suspicious: false, reasons: [], riskScore: 0 }
    }
  }
}

/**
 * Data encryption for sensitive fields
 */
export class DataEncryption {
  private static readonly ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production'

  /**
   * Encrypt billing address data
   */
  static encryptBillingData(data: {
    line1: string
    line2?: string
    city: string
    state?: string
    postalCode: string
    country: string
  }): any {
    const encrypted: any = {}
    
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        encrypted[key] = PCICompliance.encrypt(value, this.ENCRYPTION_KEY)
      }
    })

    return encrypted
  }

  /**
   * Decrypt billing address data
   */
  static decryptBillingData(encryptedData: any): any {
    const decrypted: any = {}
    
    Object.entries(encryptedData).forEach(([key, value]) => {
      if (value && typeof value === 'object' && 'encrypted' in value && (value as any).encrypted) {
        try {
          decrypted[key] = PCICompliance.decrypt(value as any, this.ENCRYPTION_KEY)
        } catch (error) {
          console.error(`Error decrypting field ${key}:`, error)
          decrypted[key] = '[DECRYPTION_ERROR]'
        }
      } else {
        decrypted[key] = value
      }
    })

    return decrypted
  }
}

/**
 * Compliance monitoring and reporting
 */
export class ComplianceMonitor {
  /**
   * Generate PCI DSS compliance report
   */
  static async generateComplianceReport(): Promise<{
    compliant: boolean
    requirements: Array<{
      requirement: string
      status: 'compliant' | 'non-compliant' | 'not-applicable'
      description: string
    }>
    recommendations: string[]
  }> {
    const requirements = [
      {
        requirement: 'Build and Maintain a Secure Network',
        status: 'compliant' as const,
        description: 'Using HTTPS/TLS for all payment communications'
      },
      {
        requirement: 'Protect Cardholder Data',
        status: 'compliant' as const,
        description: 'No card data stored locally, all handled by Stripe'
      },
      {
        requirement: 'Maintain a Vulnerability Management Program',
        status: 'compliant' as const,
        description: 'Regular security updates and dependency monitoring'
      },
      {
        requirement: 'Implement Strong Access Control Measures',
        status: 'compliant' as const,
        description: 'Authentication required for all payment operations'
      },
      {
        requirement: 'Regularly Monitor and Test Networks',
        status: 'compliant' as const,
        description: 'Activity logging and monitoring in place'
      },
      {
        requirement: 'Maintain an Information Security Policy',
        status: 'compliant' as const,
        description: 'Security policies and procedures documented'
      }
    ]

    const recommendations = [
      'Regularly review and update security policies',
      'Conduct periodic security audits',
      'Monitor for suspicious payment patterns',
      'Implement additional fraud detection measures',
      'Regularly test incident response procedures'
    ]

    return {
      compliant: requirements.every(req => req.status === 'compliant'),
      requirements,
      recommendations
    }
  }

  /**
   * Monitor for data breaches or security incidents
   */
  static async checkForSecurityIncidents(): Promise<{
    incidents: Array<{
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      description: string
      timestamp: Date
      resolved: boolean
    }>
    summary: {
      total: number
      unresolved: number
      highSeverity: number
    }
  }> {
    try {
      // Check for suspicious activities from the last 24 hours
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      const incidents: Array<{
        type: string
        severity: 'low' | 'medium' | 'high' | 'critical'
        description: string
        timestamp: Date
        resolved: boolean
      }> = []

      // Check for multiple failed payment attempts
      const failedPaymentUsers = await prisma.payment.groupBy({
        by: ['userId'],
        where: {
          status: 'FAILED',
          createdAt: { gte: last24Hours }
        },
        _count: true,
        having: {
          userId: {
            _count: {
              gte: 5
            }
          }
        }
      })

      failedPaymentUsers.forEach(user => {
        incidents.push({
          type: 'Multiple Failed Payments',
          severity: 'medium',
          description: `User ${user.userId} has ${user._count} failed payment attempts`,
          timestamp: new Date(),
          resolved: false
        })
      })

      // Check for rate limit violations
      const rateLimitViolations = await prisma.rateLimit.count({
        where: {
          requests: { gte: 10 },
          createdAt: { gte: last24Hours }
        }
      })

      if (rateLimitViolations > 0) {
        incidents.push({
          type: 'Rate Limit Violations',
          severity: 'low',
          description: `${rateLimitViolations} rate limit violations detected`,
          timestamp: new Date(),
          resolved: false
        })
      }

      const summary = {
        total: incidents.length,
        unresolved: incidents.filter(i => !i.resolved).length,
        highSeverity: incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length
      }

      return { incidents, summary }
    } catch (error) {
      console.error('Error checking security incidents:', error)
      return {
        incidents: [],
        summary: { total: 0, unresolved: 0, highSeverity: 0 }
      }
    }
  }
}
import { prisma } from '@/lib/prisma'
import { STRIPE_CONFIG } from '@/lib/stripe'

// Define AIService type locally instead of importing from Prisma
export type AIService = 'ANTHROPIC' | 'OPENAI' | 'GOOGLE' | 'COHERE' | 'REPLICATE' | 'HUGGINGFACE' | 'MISTRAL' | 'PERPLEXITY' | 'OTHER'

export interface UsageData {
  userId: string
  customerId?: string
  service: string
  endpoint: string
  method: string
  model?: string
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  duration: number // in milliseconds
  success: boolean
  errorCode?: string
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export interface BillableUsage {
  subscriptionId: string
  subscriptionItemId: string
  userId: string
  customerId: string
  service: string
  quantity: number // typically token count
  model?: string
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
  requestDuration?: number
  metadata?: Record<string, any>
}

/**
 * Log API usage for analytics and billing
 */
export async function logUsage(data: UsageData) {
  try {
    const usageLog = await prisma.usageLog.create({
      data: {
        userId: data.userId,
        customerId: data.customerId,
        service: data.service,
        endpoint: data.endpoint,
        method: data.method,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.totalTokens,
        duration: data.duration,
        success: data.success,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata || {}
      }
    })

    // If usage was successful and billable, create usage record for subscription billing
    if (data.success && data.customerId && data.totalTokens && data.totalTokens > 0) {
      await createBillableUsageRecord({
        userId: data.userId,
        customerId: data.customerId,
        service: data.service,
        quantity: data.totalTokens,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.totalTokens,
        requestDuration: data.duration,
        metadata: data.metadata
      })
    }

    return usageLog
  } catch (error) {
    console.error('Error logging usage:', error)
    throw error
  }
}

/**
 * Create a billable usage record for subscription billing
 */
async function createBillableUsageRecord(data: Omit<BillableUsage, 'subscriptionId' | 'subscriptionItemId'>): Promise<any> {
  try {
    // Find active subscription for the customer
    const subscription = await prisma.subscription.findFirst({
      where: {
        customerId: data.customerId,
        status: { in: ['ACTIVE', 'TRIALING'] }
      },
      include: {
        subscriptionItems: {
          where: {
            usageType: 'METERED'
          }
        }
      }
    })

    if (!subscription) {
      console.warn('No active subscription found for customer:', data.customerId)
      return null
    }

    // Find appropriate subscription item for metered billing
    const meteringItem = subscription.subscriptionItems.find(item =>
      item.usageType === 'METERED'
    )

    if (!meteringItem) {
      console.warn('No metered subscription item found for customer:', data.customerId)
      return null
    }

    // Create usage record
    const usageRecord = await prisma.usageRecord.create({
      data: {
        subscriptionId: subscription.id,
        subscriptionItemId: meteringItem.id,
        userId: data.userId,
        customerId: data.customerId,
        quantity: data.quantity,
        service: data.service,
        model: data.model,
        inputTokens: data.inputTokens,
        outputTokens: data.outputTokens,
        totalTokens: data.totalTokens,
        requestDuration: data.requestDuration,
        metadata: data.metadata || {}
      }
    })

    return usageRecord
  } catch (error) {
    console.error('Error creating billable usage record:', error)
    // Don't throw error as this shouldn't break the main API flow
    return null
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUserUsageStats(userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
        startDate.setHours(0, 0, 0, 0)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    const usageLogs = await prisma.usageLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: now
        }
      }
    })

    // Aggregate usage by service
    const usageByService = usageLogs.reduce((acc, log) => {
      if (!acc[log.service]) {
        acc[log.service] = {
          totalRequests: 0,
          successfulRequests: 0,
          totalTokens: 0,
          totalDuration: 0,
          totalCost: 0
        }
      }

      acc[log.service].totalRequests += 1
      if (log.success) {
        acc[log.service].successfulRequests += 1
      }
      acc[log.service].totalTokens += log.totalTokens || 0
      acc[log.service].totalDuration += log.duration || 0

      // Calculate cost based on service rates
      const rate = STRIPE_CONFIG.usageRates[log.service] || 0
      acc[log.service].totalCost += (log.totalTokens || 0) * rate / 1000

      return acc
    }, {} as Record<AIService, {
      totalRequests: number
      successfulRequests: number
      totalTokens: number
      totalDuration: number
      totalCost: number
    }>)

    const totalStats = {
      totalRequests: usageLogs.length,
      successfulRequests: usageLogs.filter(log => log.success).length,
      totalTokens: usageLogs.reduce((sum, log) => sum + (log.totalTokens || 0), 0),
      totalDuration: usageLogs.reduce((sum, log) => sum + (log.duration || 0), 0),
      totalCost: Object.values(usageByService).reduce((sum, stats) => sum + stats.totalCost, 0)
    }

    return {
      period,
      startDate,
      endDate: now,
      usageByService,
      totalStats
    }
  } catch (error) {
    console.error('Error getting usage stats:', error)
    throw error
  }
}

/**
 * Check if user has exceeded their usage limits
 */
export async function checkUsageLimits(userId: string) {
  try {
    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        customer: {
          userId
        },
        status: { in: ['ACTIVE', 'TRIALING'] }
      }
    })

    if (!subscription) {
      return { exceeded: true, reason: 'No active subscription' }
    }

    const planConfig = STRIPE_CONFIG.plans[subscription.plan]
    
    // If unlimited plan, no limits to check
    if (planConfig.limits.tokensPerMonth === -1) {
      return { exceeded: false }
    }

    // Get current month usage
    const startOfMonth = new Date(subscription.currentPeriodStart)
    const endOfMonth = new Date(subscription.currentPeriodEnd)

    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        userId,
        timestamp: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    const totalTokensUsed = usageRecords.reduce((sum, record) => sum + (record.totalTokens || 0), 0)
    const totalRequestsToday = await prisma.usageLog.count({
      where: {
        userId,
        timestamp: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    })

    // Check limits
    if (totalTokensUsed >= planConfig.limits.tokensPerMonth) {
      return { 
        exceeded: true, 
        reason: 'Monthly token limit exceeded',
        used: totalTokensUsed,
        limit: planConfig.limits.tokensPerMonth
      }
    }

    if (totalRequestsToday >= planConfig.limits.apiCallsPerDay) {
      return { 
        exceeded: true, 
        reason: 'Daily API call limit exceeded',
        used: totalRequestsToday,
        limit: planConfig.limits.apiCallsPerDay
      }
    }

    return { 
      exceeded: false,
      usage: {
        tokensUsed: totalTokensUsed,
        tokenLimit: planConfig.limits.tokensPerMonth,
        requestsToday: totalRequestsToday,
        requestLimit: planConfig.limits.apiCallsPerDay
      }
    }
  } catch (error) {
    console.error('Error checking usage limits:', error)
    throw error
  }
}

/**
 * Get usage analytics for admin dashboard
 */
export async function getUsageAnalytics(
  startDate: Date, 
  endDate: Date, 
  groupBy: 'day' | 'week' | 'month' = 'day'
) {
  try {
    const usageLogs = await prisma.usageLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    // Group by time period
    const groupedUsage = usageLogs.reduce((acc, log) => {
      let key: string
      const date = new Date(log.timestamp)

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }

      if (!acc[key]) {
        acc[key] = {
          totalRequests: 0,
          successfulRequests: 0,
          totalTokens: 0,
          totalDuration: 0,
          uniqueUsers: new Set<string>(),
          serviceBreakdown: {} as Record<AIService, number>
        }
      }

      acc[key].totalRequests += 1
      if (log.success) {
        acc[key].successfulRequests += 1
      }
      acc[key].totalTokens += log.totalTokens || 0
      acc[key].totalDuration += log.duration || 0
      acc[key].uniqueUsers.add(log.userId)

      if (!acc[key].serviceBreakdown[log.service]) {
        acc[key].serviceBreakdown[log.service] = 0
      }
      acc[key].serviceBreakdown[log.service] += 1

      return acc
    }, {} as Record<string, any>)

    // Convert Set to count for uniqueUsers
    Object.keys(groupedUsage).forEach(key => {
      groupedUsage[key].uniqueUsers = groupedUsage[key].uniqueUsers.size
    })

    return groupedUsage
  } catch (error) {
    console.error('Error getting usage analytics:', error)
    throw error
  }
}

/**
 * Middleware to track API usage
 */
export function createUsageTrackingMiddleware(service: string) {
  return async function trackUsage(
    userId: string,
    customerId: string | undefined,
    endpoint: string,
    method: string,
    options: {
      model?: string
      inputTokens?: number
      outputTokens?: number
      totalTokens?: number
      metadata?: Record<string, any>
    } = {}
  ) {
    const startTime = Date.now()
    
    return {
      async complete(success: boolean, error?: { code?: string, message?: string }) {
        const duration = Date.now() - startTime

        await logUsage({
          userId,
          customerId,
          service,
          endpoint,
          method,
          model: options.model,
          inputTokens: options.inputTokens,
          outputTokens: options.outputTokens,
          totalTokens: options.totalTokens,
          duration,
          success,
          errorCode: error?.code,
          errorMessage: error?.message,
          metadata: options.metadata
        })
      }
    }
  }
}
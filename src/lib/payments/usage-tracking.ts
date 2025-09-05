import { prisma } from '@/lib/prisma'
import { AIService } from '@prisma/client'
import { STRIPE_CONFIG } from '@/lib/stripe'

export interface UsageData {
  userId: string
  service: AIService
  amount: number
  unit: string
  cost?: number
  metadata?: Record<string, any>
}

export interface UsageSummary {
  userId: string
  period: {
    start: Date
    end: Date
  }
  totalUsage: number
  totalCost: number
  serviceBreakdown: {
    service: AIService
    usage: number
    cost: number
  }[]
}

export interface BillingPeriod {
  start: Date
  end: Date
  status: 'CURRENT' | 'PAST' | 'FUTURE'
}

/**
 * Track usage for AI services
 */
export async function trackUsage(data: UsageData): Promise<void> {
  const cost = data.cost || calculateUsageCost(data.service, data.amount, data.unit)

  await prisma.usage.create({
    data: {
      userId: data.userId,
      service: data.service,
      amount: data.amount,
      unit: data.unit,
      cost,
      billingPeriodStart: new Date(),
      billingPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: data.metadata || {}
    }
  })
}

/**
 * Get usage summary for a user in a billing period
 */
export async function getUsageSummary(
  userId: string,
  period: BillingPeriod
): Promise<UsageSummary> {
  const usage = await prisma.usage.findMany({
    where: {
      userId: userId,
      timestamp: {
        gte: period.start,
        lte: period.end
      }
    }
  })

  const totalUsage = usage.reduce((sum, u) => sum + u.amount, 0)
  const totalCost = usage.reduce((sum, u) => sum + Number(u.cost), 0)

  // Group by service
  const serviceBreakdown = Object.values(AIService).map(service => {
    const serviceUsage = usage.filter(u => u.service === service)
    return {
      service,
      usage: serviceUsage.reduce((sum, u) => sum + u.amount, 0),
      cost: serviceUsage.reduce((sum, u) => sum + Number(u.cost), 0)
    }
  }).filter(sb => sb.usage > 0)

  return {
    userId,
    period: { start: period.start, end: period.end },
    totalUsage,
    totalCost,
    serviceBreakdown
  }
}

/**
 * Get current billing period for a user
 */
export async function getCurrentBillingPeriod(userId: string): Promise<BillingPeriod> {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  })

  if (customer && customer.subscriptions.length > 0) {
    const subscription = customer.subscriptions[0]
    return {
      start: subscription.currentPeriodStart,
      end: subscription.currentPeriodEnd,
      status: 'CURRENT'
    }
  }

  // Fallback to current month if no active subscription
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  return {
    start,
    end,
    status: 'CURRENT'
  }
}

/**
 * Check if user has exceeded usage limits
 */
export async function checkUsageLimits(
  userId: string,
  service: AIService
): Promise<{
  withinLimits: boolean
  currentUsage: number
  limit: number
  resetDate: Date
}> {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        take: 1
      }
    }
  })

  const billingPeriod = await getCurrentBillingPeriod(userId)
  
  // Get usage limits for the active subscription
  let limit = 1000 // Default limit
  if (customer && customer.subscriptions.length > 0) {
    const subscription = customer.subscriptions[0]
    const usageLimit = await prisma.usageLimit.findFirst({
      where: {
        userId: customer.userId,
        service
      }
    })
    if (usageLimit) {
      limit = usageLimit.limitAmount
    }
  }

  // Get current usage in this period  
  const usage = await prisma.usage.findMany({
    where: {
      userId: userId,
      service,
      timestamp: {
        gte: billingPeriod.start,
        lte: billingPeriod.end
      }
    }
  })
  const currentUsage = usage.reduce((sum, u) => sum + u.amount, 0)
  
  return {
    withinLimits: currentUsage < limit,
    currentUsage,
    limit,
    resetDate: billingPeriod.end
  }
}

/**
 * Calculate usage cost based on service and amount
 */
export function calculateUsageCost(
  service: AIService,
  amount: number,
  unit: string
): number {
  // Simplified pricing - in real implementation, this would come from config
  const pricing: Record<AIService, Record<string, number>> = {
    [AIService.CHAT]: { 'tokens': 0.002 },
    [AIService.ANALYSIS]: { 'requests': 0.10 },
    [AIService.GENERATION]: { 'tokens': 0.005 },
    [AIService.TRANSCRIPTION]: { 'minutes': 0.20 },
    [AIService.TRANSLATION]: { 'characters': 0.001 },
    [AIService.SUMMARIZATION]: { 'tokens': 0.003 },
    [AIService.CLASSIFICATION]: { 'requests': 0.05 }
  }
  
  const rate = pricing[service]?.[unit] || 0
  return amount * rate
}

/**
 * Get usage history for a user
 */
export async function getUsageHistory(
  userId: string,
  limit: number = 100,
  offset: number = 0
): Promise<{
  usage: any[]
  total: number
  hasMore: boolean
}> {
  const customer = await prisma.customer.findUnique({
    where: { userId }
  })

  if (!customer) {
    return {
      usage: [],
      total: 0,
      hasMore: false
    }
  }

  const [usage, total] = await Promise.all([
    prisma.usage.findMany({
      where: { userId: customer.userId },
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit
    }),
    prisma.usage.count({
      where: { userId: customer.userId }
    })
  ])

  return {
    usage,
    total,
    hasMore: offset + limit < total
  }
}

/**
 * Generate usage report for billing
 */
export async function generateUsageReport(
  userId: string,
  period: BillingPeriod
): Promise<{
  summary: UsageSummary
  details: any[]
  totalBillableAmount: number
}> {
  const customer = await prisma.customer.findUnique({
    where: { userId }
  })

  if (!customer) {
    const summary = await getUsageSummary(userId, period)
    return {
      summary,
      details: [],
      totalBillableAmount: 0
    }
  }

  const usage = await prisma.usage.findMany({
    where: {
      userId: userId,
      timestamp: {
        gte: period.start,
        lte: period.end
      }
    },
    orderBy: { timestamp: 'desc' }
  })

  const summary = await getUsageSummary(userId, period)
  const totalBillableAmount = usage.reduce((sum, u) => sum + Number(u.cost), 0)
  
  return {
    summary,
    details: usage,
    totalBillableAmount
  }
}

/**
 * Reset usage counters (typically called at billing period start)
 */
export async function resetUsageCounters(userId: string): Promise<void> {
  const customer = await prisma.customer.findUnique({
    where: { userId }
  })

  if (!customer) {
    console.warn('Customer not found for user:', userId)
    return
  }

  // Archive old usage data (optional)
  const currentPeriod = await getCurrentBillingPeriod(userId)
  
  // In most billing systems, you don't actually delete usage data
  // Instead, you start a new billing period
  console.log(`Usage period reset for user: ${userId}, new period starts: ${currentPeriod.start}`)
}

/**
 * Get aggregated usage statistics
 */
export async function getUsageStatistics(
  startDate: Date,
  endDate: Date,
  groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<{
  totalUsers: number
  totalUsage: number
  totalCost: number
  serviceBreakdown: any[]
  timeSeriesData: any[]
}> {
  const usage = await prisma.usage.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      user: true
    }
  })

  const uniqueUsers = new Set(usage.map(u => u.userId)).size
  const totalUsage = usage.reduce((sum, u) => sum + u.amount, 0)
  const totalCost = usage.reduce((sum, u) => sum + Number(u.cost), 0)

  // Service breakdown
  const serviceBreakdown = Object.values(AIService).map(service => {
    const serviceUsage = usage.filter(u => u.service === service)
    return {
      service,
      usage: serviceUsage.reduce((sum, u) => sum + u.amount, 0),
      cost: serviceUsage.reduce((sum, u) => sum + Number(u.cost), 0),
      requests: serviceUsage.length
    }
  }).filter(sb => sb.usage > 0)

  // Time series data (simplified - would need more complex grouping in real implementation)
  const timeSeriesData = usage.reduce((acc, u) => {
    const date = u.timestamp.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = { date, usage: 0, cost: 0, requests: 0 }
    }
    acc[date].usage += u.amount
    acc[date].cost += Number(u.cost)
    acc[date].requests += 1
    return acc
  }, {} as Record<string, any>)

  return {
    totalUsers: uniqueUsers,
    totalUsage,
    totalCost,
    serviceBreakdown,
    timeSeriesData: Object.values(timeSeriesData)
  }
}

/**
 * Apply usage-based billing adjustments
 */
export async function applyUsageBilling(userId: string, period: BillingPeriod): Promise<{
  baseAmount: number
  usageAmount: number
  totalAmount: number
  adjustments: any[]
}> {
  const customer = await prisma.customer.findUnique({
    where: { userId },
    include: {
      subscriptions: {
        where: { status: 'ACTIVE' },
        take: 1
      }
    }
  })

  if (!customer || customer.subscriptions.length === 0) {
    return {
      baseAmount: 0,
      usageAmount: 0,
      totalAmount: 0,
      adjustments: []
    }
  }

  const subscription = customer.subscriptions[0]
  const usageReport = await generateUsageReport(userId, period)
  
  // Get base subscription amount (would come from subscription plan)
  const baseAmount = 2900 // $29.00 in cents - would come from subscription plan
  const usageAmount = Math.round(usageReport.totalBillableAmount * 100) // Convert to cents
  const totalAmount = baseAmount + usageAmount

  const adjustments = []
  
  // Apply any credits
  const customerForCredits = await prisma.customer.findUnique({
    where: { userId: userId }
  })
  
  const credits = customerForCredits ? await prisma.credit.findMany({
    where: {
      customerId: customerForCredits.id,
      expiresAt: {
        gte: new Date()
      }
    }
  }) : []

  let totalCredits = 0
  for (const credit of credits) {
    adjustments.push({
      type: 'CREDIT',
      amount: -Number(credit.amount),
      description: credit.description
    })
    totalCredits += Number(credit.amount)
  }

  return {
    baseAmount,
    usageAmount,
    totalAmount: totalAmount - totalCredits,
    adjustments
  }
}


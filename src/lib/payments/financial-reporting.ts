import { prisma } from '@/lib/prisma'

// Note: These types should be added to schema.prisma as enums
export enum ReportType {
  REVENUE = 'REVENUE',
  SUBSCRIPTION_METRICS = 'SUBSCRIPTION_METRICS',
  USAGE_ANALYTICS = 'USAGE_ANALYTICS',
  CUSTOMER_LIFETIME_VALUE = 'CUSTOMER_LIFETIME_VALUE'
}

export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export interface RevenueMetrics {
  totalRevenue: number
  recurringRevenue: number
  oneTimeRevenue: number
  refunds: number
  netRevenue: number
  currency: string
}

export interface SubscriptionMetrics {
  activeSubscriptions: number
  newSubscriptions: number
  canceledSubscriptions: number
  churnRate: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  lifetimeValue: number
}

export interface UsageMetrics {
  totalTokens: number
  totalRequests: number
  uniqueUsers: number
  averageTokensPerUser: number
  averageRequestsPerUser: number
  usageGrowthRate: number
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  activeCustomers: number
  customerRetentionRate: number
  customerAcquisitionCost: number
}

/**
 * Generate revenue report for a given period
 */
export async function generateRevenueReport(
  startDate: Date,
  endDate: Date,
  currency: string = 'USD'
): Promise<RevenueMetrics> {
  try {
    // Get all payments in period
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED',
        currency: currency.toLowerCase()
      },
      include: {
        invoice: true
      }
    })

    // Get refunds in period
    // Note: Refund model needs to be added to schema.prisma
    const refunds = await prisma.refund.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED',
        currency: currency.toLowerCase()
      }
    })

    // Calculate metrics
    const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0)
    // Note: subscriptionId field needs to be added to Invoice model
    const recurringRevenue = payments
      .filter(payment => (payment.invoice as any)?.subscriptionId)
      .reduce((sum, payment) => sum + Number(payment.amount), 0)
    const oneTimeRevenue = totalRevenue - recurringRevenue
    const totalRefunds = refunds.reduce((sum, refund: any) => sum + Number(refund.amount), 0)

    return {
      totalRevenue: totalRevenue / 100, // Convert from cents
      recurringRevenue: recurringRevenue / 100,
      oneTimeRevenue: oneTimeRevenue / 100,
      refunds: totalRefunds / 100,
      netRevenue: (totalRevenue - totalRefunds) / 100,
      currency: currency.toUpperCase()
    }
  } catch (error) {
    console.error('Error generating revenue report:', error)
    throw error
  }
}

/**
 * Generate subscription metrics report
 */
export async function generateSubscriptionReport(
  startDate: Date,
  endDate: Date
): Promise<SubscriptionMetrics> {
  try {
    // Current active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] }
      }
    })

    // New subscriptions in period
    const newSubscriptions = await prisma.subscription.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Canceled subscriptions in period
    const canceledSubscriptions = await prisma.subscription.count({
      where: {
        canceledAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Calculate MRR from active subscriptions
    const activeSubsWithAmount = await prisma.subscription.findMany({
      where: {
        status: { in: ['ACTIVE', 'TRIALING'] }
      },
      select: {
        unitAmount: true,
        billingCycle: true,
        quantity: true
      }
    })

    const monthlyRecurringRevenue = activeSubsWithAmount.reduce((sum, sub) => {
      let monthlyAmount = Number(sub.unitAmount) * sub.quantity

      // Convert to monthly based on billing cycle
      if (sub.billingCycle === 'YEARLY') {
        monthlyAmount = monthlyAmount / 12
      } else if (sub.billingCycle === 'QUARTERLY') {
        monthlyAmount = monthlyAmount / 3
      }

      return sum + monthlyAmount
    }, 0) / 100 // Convert from cents

    // Get previous period data for churn calculation
    const previousPeriod = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
    const previousActiveCount = await prisma.subscription.count({
      where: {
        createdAt: { lte: startDate },
        OR: [
          { canceledAt: null },
          { canceledAt: { gt: startDate } }
        ]
      }
    })

    const churnRate = previousActiveCount > 0 ? (canceledSubscriptions / previousActiveCount) * 100 : 0
    const averageRevenuePerUser = activeSubscriptions > 0 ? monthlyRecurringRevenue / activeSubscriptions : 0
    const lifetimeValue = churnRate > 0 ? averageRevenuePerUser / (churnRate / 100) : 0

    return {
      activeSubscriptions,
      newSubscriptions,
      canceledSubscriptions,
      churnRate,
      monthlyRecurringRevenue,
      averageRevenuePerUser,
      lifetimeValue
    }
  } catch (error) {
    console.error('Error generating subscription report:', error)
    throw error
  }
}

/**
 * Generate usage analytics report
 */
export async function generateUsageReport(
  startDate: Date,
  endDate: Date
): Promise<UsageMetrics> {
  try {
    // Get usage logs for period
    const usageLogs = await prisma.usageLog.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const totalTokens = usageLogs.reduce((sum, log) => sum + (log.totalTokens || 0), 0)
    const totalRequests = usageLogs.length
    const uniqueUsers = new Set(usageLogs.map(log => log.userId)).size

    // Get previous period for growth rate
    const previousPeriod = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
    const previousPeriodStart = new Date(previousPeriod.getTime())
    const previousPeriodEnd = startDate

    const previousUsageLogs = await prisma.usageLog.findMany({
      where: {
        timestamp: {
          gte: previousPeriodStart,
          lte: previousPeriodEnd
        }
      }
    })

    const previousTokens = previousUsageLogs.reduce((sum, log) => sum + (log.totalTokens || 0), 0)
    const usageGrowthRate = previousTokens > 0 ? ((totalTokens - previousTokens) / previousTokens) * 100 : 0

    return {
      totalTokens,
      totalRequests,
      uniqueUsers,
      averageTokensPerUser: uniqueUsers > 0 ? totalTokens / uniqueUsers : 0,
      averageRequestsPerUser: uniqueUsers > 0 ? totalRequests / uniqueUsers : 0,
      usageGrowthRate
    }
  } catch (error) {
    console.error('Error generating usage report:', error)
    throw error
  }
}

/**
 * Generate customer metrics report
 */
export async function generateCustomerReport(
  startDate: Date,
  endDate: Date
): Promise<CustomerMetrics> {
  try {
    const totalCustomers = await prisma.customer.count()
    
    const newCustomers = await prisma.customer.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // Active customers (have made payments or have active subscriptions)
    const activeCustomers = await prisma.customer.count({
      where: {
        OR: [
          {
            payments: {
              some: {
                createdAt: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          },
          {
            subscriptions: {
              some: {
                status: { in: ['ACTIVE', 'TRIALING'] }
              }
            }
          }
        ]
      }
    })

    // Calculate retention rate (simplified)
    const previousPeriod = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()))
    const previousActiveCustomers = await prisma.customer.count({
      where: {
        createdAt: { lte: startDate },
        payments: {
          some: {
            createdAt: {
              gte: previousPeriod,
              lte: startDate
            }
          }
        }
      }
    })

    const customerRetentionRate = previousActiveCustomers > 0 
      ? (activeCustomers / previousActiveCustomers) * 100 
      : 0

    // Simplified CAC calculation (would need marketing spend data for accurate calculation)
    const customerAcquisitionCost = 0 // Placeholder

    return {
      totalCustomers,
      newCustomers,
      activeCustomers,
      customerRetentionRate,
      customerAcquisitionCost
    }
  } catch (error) {
    console.error('Error generating customer report:', error)
    throw error
  }
}

/**
 * Generate comprehensive financial report
 */
export async function generateFinancialReport(
  type: ReportType,
  period: ReportPeriod,
  startDate?: Date,
  endDate?: Date
) {
  try {
    // Calculate date range based on period
    const now = new Date()
    let reportStartDate: Date
    let reportEndDate: Date = endDate || now

    if (startDate && endDate) {
      reportStartDate = startDate
      reportEndDate = endDate
    } else {
      switch (period) {
        case 'DAILY':
          reportStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'WEEKLY':
          reportStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'MONTHLY':
          reportStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'QUARTERLY':
          const currentQuarter = Math.floor(now.getMonth() / 3)
          reportStartDate = new Date(now.getFullYear(), currentQuarter * 3, 1)
          break
        case 'YEARLY':
          reportStartDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          reportStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }
    }

    let reportData: any

    switch (type) {
      case 'REVENUE':
        reportData = await generateRevenueReport(reportStartDate, reportEndDate)
        break
      case 'SUBSCRIPTION_METRICS':
        reportData = await generateSubscriptionReport(reportStartDate, reportEndDate)
        break
      case 'USAGE_ANALYTICS':
        reportData = await generateUsageReport(reportStartDate, reportEndDate)
        break
      case 'CUSTOMER_LIFETIME_VALUE':
        reportData = await generateCustomerReport(reportStartDate, reportEndDate)
        break
      default:
        // Generate a comprehensive report with all metrics
        const [revenue, subscriptions, usage, customers] = await Promise.all([
          generateRevenueReport(reportStartDate, reportEndDate),
          generateSubscriptionReport(reportStartDate, reportEndDate),
          generateUsageReport(reportStartDate, reportEndDate),
          generateCustomerReport(reportStartDate, reportEndDate)
        ])
        reportData = { revenue, subscriptions, usage, customers }
    }

    // Store report in database
    // Note: FinancialReport model needs to be added to schema.prisma
    const report = await prisma.financialReport.create({
      data: {
        type,
        period,
        startDate: reportStartDate,
        endDate: reportEndDate,
        data: reportData,
        status: 'COMPLETED'
      }
    })

    return report
  } catch (error) {
    console.error('Error generating financial report:', error)
    
    // Store failed report
    if (startDate && endDate) {
      await prisma.financialReport.create({
        data: {
          type,
          period,
          startDate,
          endDate,
          data: {},
          status: 'FAILED',
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })
    }
    
    throw error
  }
}

/**
 * Get dashboard metrics for admin
 */
export async function getDashboardMetrics() {
  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const previousMonth = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    const [
      currentRevenue,
      previousRevenue,
      subscriptionMetrics,
      usageMetrics,
      customerMetrics
    ] = await Promise.all([
      generateRevenueReport(thirtyDaysAgo, now),
      generateRevenueReport(previousMonth, thirtyDaysAgo),
      generateSubscriptionReport(thirtyDaysAgo, now),
      generateUsageReport(thirtyDaysAgo, now),
      generateCustomerReport(thirtyDaysAgo, now)
    ])

    // Calculate growth rates
    const revenueGrowth = previousRevenue.totalRevenue > 0 
      ? ((currentRevenue.totalRevenue - previousRevenue.totalRevenue) / previousRevenue.totalRevenue) * 100
      : 0

    return {
      revenue: {
        ...currentRevenue,
        growth: revenueGrowth
      },
      subscriptions: subscriptionMetrics,
      usage: usageMetrics,
      customers: customerMetrics,
      period: {
        startDate: thirtyDaysAgo,
        endDate: now
      }
    }
  } catch (error) {
    console.error('Error getting dashboard metrics:', error)
    throw error
  }
}
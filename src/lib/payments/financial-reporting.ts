import { prisma } from '@/lib/prisma'
import { SubscriptionStatus } from '@prisma/client'

// Define these enums locally since they're not in the Prisma schema
export enum ReportType {
  REVENUE = 'REVENUE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  CUSTOMER = 'CUSTOMER',
  CHURN = 'CHURN',
  GROWTH = 'GROWTH'
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
  cancelledSubscriptions: number
  churnRate: number
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  avgRevenuePerUser: number
}

export interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  churned: number
  retention: number
  customerLifetimeValue: number
  avgOrderValue: number
}

export interface GrowthMetrics {
  revenueGrowthRate: number
  customerGrowthRate: number
  subscriptionGrowthRate: number
  churnRate: number
  netRevenueRetention: number
}

/**
 * Get revenue metrics for a given period
 */
export async function getRevenueMetrics(
  startDate: Date,
  endDate: Date,
  currency: string = 'USD'
): Promise<RevenueMetrics> {
  // Get all payments in the period
  const payments = await prisma.payment.findMany({
    where: {
      processedAt: {
        gte: startDate,
        lte: endDate
      },
      currency: currency.toUpperCase(),
      status: 'COMPLETED'
    },
    include: {
      invoice: {
        include: {
          subscription: true
        }
      }
    }
  })

  // Get all refunds in the period
  const refunds = await prisma.refund.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      currency: currency.toUpperCase()
    }
  })

  const totalRefunds = refunds.reduce((sum, refund) => sum + Number(refund.amount), 0)
  
  // Calculate revenue metrics
  const recurringRevenue = payments
    .filter(p => p.invoice.subscription)
    .reduce((sum, p) => sum + Number(p.amount), 0)
    
  const oneTimeRevenue = payments
    .filter(p => !p.invoice.subscription)
    .reduce((sum, p) => sum + Number(p.amount), 0)
    
  const totalRevenue = recurringRevenue + oneTimeRevenue
  const netRevenue = totalRevenue - totalRefunds

  return {
    totalRevenue: totalRevenue / 100, // Convert from cents
    recurringRevenue: recurringRevenue / 100,
    oneTimeRevenue: oneTimeRevenue / 100,
    refunds: totalRefunds / 100,
    netRevenue: netRevenue / 100,
    currency
  }
}

/**
 * Get subscription metrics for a given period
 */
export async function getSubscriptionMetrics(
  startDate: Date,
  endDate: Date
): Promise<SubscriptionMetrics> {
  // Get active subscriptions at end of period
  const activeSubscriptions = await prisma.subscription.count({
    where: {
      status: SubscriptionStatus.ACTIVE,
      createdAt: { lte: endDate }
    }
  })

  // Get new subscriptions in period
  const newSubscriptions = await prisma.subscription.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // Get cancelled subscriptions in period
  const cancelledSubscriptions = await prisma.subscription.count({
    where: {
      status: SubscriptionStatus.CANCELLED,
      canceledAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // Calculate MRR (Monthly Recurring Revenue)
  const activeSubscriptionsData = await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      createdAt: { lte: endDate }
    }
  })

  const mrr = activeSubscriptionsData.reduce((sum, sub) => {
    // Convert to monthly amount based on billing cycle
    if (sub.billingCycle === 'YEARLY') {
      return sum + (Number(sub.amount) / 12)
    }
    return sum + Number(sub.amount)
  }, 0)

  const arr = mrr * 12
  const avgRevenuePerUser = activeSubscriptions > 0 ? mrr / activeSubscriptions : 0
  const churnRate = activeSubscriptions > 0 ? (cancelledSubscriptions / activeSubscriptions) * 100 : 0

  return {
    activeSubscriptions,
    newSubscriptions,
    cancelledSubscriptions,
    churnRate,
    mrr: mrr / 100, // Convert from cents
    arr: arr / 100,
    avgRevenuePerUser: avgRevenuePerUser / 100
  }
}

/**
 * Get customer metrics for a given period
 */
export async function getCustomerMetrics(
  startDate: Date,
  endDate: Date
): Promise<CustomerMetrics> {
  // Get total customers at end of period
  const totalCustomers = await prisma.customer.count({
    where: {
      createdAt: { lte: endDate }
    }
  })

  // Get new customers in period
  const newCustomers = await prisma.customer.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // Get churned customers (customers with cancelled subscriptions)
  const churned = await prisma.customer.count({
    where: {
      subscriptions: {
        some: {
          status: SubscriptionStatus.CANCELLED,
          canceledAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  })

  // Calculate retention rate
  const retention = totalCustomers > 0 ? ((totalCustomers - churned) / totalCustomers) * 100 : 0

  // Calculate average order value from payments
  const payments = await prisma.payment.findMany({
    where: {
      processedAt: {
        gte: startDate,
        lte: endDate
      },
      status: 'COMPLETED'
    }
  })

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const avgOrderValue = payments.length > 0 ? totalRevenue / payments.length : 0

  // Simple CLV calculation (total revenue / total customers)
  const customerLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

  return {
    totalCustomers,
    newCustomers,
    churned,
    retention,
    customerLifetimeValue: customerLifetimeValue / 100, // Convert from cents
    avgOrderValue: avgOrderValue / 100
  }
}

/**
 * Get growth metrics comparing two periods
 */
export async function getGrowthMetrics(
  currentStartDate: Date,
  currentEndDate: Date,
  previousStartDate: Date,
  previousEndDate: Date
): Promise<GrowthMetrics> {
  // Get metrics for both periods
  const [currentRevenue, previousRevenue] = await Promise.all([
    getRevenueMetrics(currentStartDate, currentEndDate),
    getRevenueMetrics(previousStartDate, previousEndDate)
  ])

  const [currentCustomers, previousCustomers] = await Promise.all([
    getCustomerMetrics(currentStartDate, currentEndDate),
    getCustomerMetrics(previousStartDate, previousEndDate)
  ])

  const [currentSubscriptions, previousSubscriptions] = await Promise.all([
    getSubscriptionMetrics(currentStartDate, currentEndDate),
    getSubscriptionMetrics(previousStartDate, previousEndDate)
  ])

  // Calculate growth rates
  const revenueGrowthRate = previousRevenue.totalRevenue > 0 
    ? ((currentRevenue.totalRevenue - previousRevenue.totalRevenue) / previousRevenue.totalRevenue) * 100
    : 0

  const customerGrowthRate = previousCustomers.totalCustomers > 0
    ? ((currentCustomers.totalCustomers - previousCustomers.totalCustomers) / previousCustomers.totalCustomers) * 100
    : 0

  const subscriptionGrowthRate = previousSubscriptions.activeSubscriptions > 0
    ? ((currentSubscriptions.activeSubscriptions - previousSubscriptions.activeSubscriptions) / previousSubscriptions.activeSubscriptions) * 100
    : 0

  // Net Revenue Retention (simplified calculation)
  const netRevenueRetention = previousRevenue.recurringRevenue > 0
    ? (currentRevenue.recurringRevenue / previousRevenue.recurringRevenue) * 100
    : 100

  return {
    revenueGrowthRate,
    customerGrowthRate,
    subscriptionGrowthRate,
    churnRate: currentCustomers.churned,
    netRevenueRetention
  }
}

/**
 * Generate financial report
 */
export async function generateFinancialReport(
  type: ReportType,
  period: ReportPeriod,
  startDate?: Date,
  endDate?: Date
) {
  // Calculate default date range if not provided
  if (!startDate || !endDate) {
    const now = new Date()
    switch (period) {
      case ReportPeriod.DAILY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        endDate = now
        break
      case ReportPeriod.WEEKLY:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        endDate = now
        break
      case ReportPeriod.MONTHLY:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case ReportPeriod.QUARTERLY:
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart - 3, 1)
        endDate = new Date(now.getFullYear(), quarterStart, 0)
        break
      case ReportPeriod.YEARLY:
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        endDate = new Date(now.getFullYear() - 1, 11, 31)
        break
    }
  }

  switch (type) {
    case ReportType.REVENUE:
      return await getRevenueMetrics(startDate, endDate)
    
    case ReportType.SUBSCRIPTION:
      return await getSubscriptionMetrics(startDate, endDate)
    
    case ReportType.CUSTOMER:
      return await getCustomerMetrics(startDate, endDate)
    
    case ReportType.GROWTH:
      // For growth, we need previous period
      const periodLength = endDate.getTime() - startDate.getTime()
      const previousEndDate = new Date(startDate.getTime() - 1)
      const previousStartDate = new Date(previousEndDate.getTime() - periodLength)
      
      return await getGrowthMetrics(startDate, endDate, previousStartDate, previousEndDate)
    
    default:
      throw new Error(`Unsupported report type: ${type}`)
  }
}

/**
 * Export financial data to CSV
 */
export async function exportFinancialData(
  type: ReportType,
  startDate: Date,
  endDate: Date,
  format: 'CSV' | 'JSON' | 'PDF' = 'CSV'
): Promise<string> {
  const reportData = await generateFinancialReport(type, ReportPeriod.MONTHLY, startDate, endDate)

  switch (format) {
    case 'JSON':
      return JSON.stringify(reportData, null, 2)
    
    case 'CSV':
      // Simple CSV conversion
      const headers = Object.keys(reportData).join(',')
      const values = Object.values(reportData).join(',')
      return `${headers}\n${values}`
    
    case 'PDF':
      // For PDF, we'd typically use a library like puppeteer or pdfkit
      // For now, return JSON as a placeholder
      return JSON.stringify(reportData, null, 2)
    
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}


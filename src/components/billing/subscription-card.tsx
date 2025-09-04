'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/stripe'
// Define subscription types locally since they don't exist in the current Prisma schema
enum SubscriptionPlan {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE'
}

enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  INCOMPLETE = 'INCOMPLETE',
  TRIALING = 'TRIALING'
}

enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  QUARTERLY = 'QUARTERLY'
}
import { CalendarDays, CreditCard, AlertTriangle, CheckCircle } from 'lucide-react'

interface SubscriptionCardProps {
  subscription: {
    id: string
    plan: SubscriptionPlan
    status: SubscriptionStatus
    billingCycle: BillingCycle
    unitAmount: number
    currency: string
    currentPeriodStart: Date
    currentPeriodEnd: Date
    trialEnd?: Date | null
    canceledAt?: Date | null
    cancelAtPeriodEnd: boolean
  }
  usage?: {
    totalStats: {
      totalTokens: number
      totalRequests: number
      totalCost: number
    }
    usage: {
      tokensUsed: number
      tokenLimit: number
      requestsToday: number
      requestLimit: number
    }
  }
  onManage?: () => void
  onUpgrade?: () => void
  onCancel?: () => void
  onReactivate?: () => void
}

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'bg-green-500', icon: CheckCircle },
  TRIALING: { label: 'Trial', color: 'bg-blue-500', icon: CheckCircle },
  PAST_DUE: { label: 'Past Due', color: 'bg-orange-500', icon: AlertTriangle },
  CANCELED: { label: 'Canceled', color: 'bg-red-500', icon: AlertTriangle },
  INCOMPLETE: { label: 'Incomplete', color: 'bg-yellow-500', icon: AlertTriangle },
  UNPAID: { label: 'Unpaid', color: 'bg-red-500', icon: AlertTriangle },
  PAUSED: { label: 'Paused', color: 'bg-gray-500', icon: AlertTriangle }
}

const planConfig = {
  STARTER: { name: 'Starter', color: 'bg-blue-100 text-blue-800' },
  PROFESSIONAL: { name: 'Professional', color: 'bg-purple-100 text-purple-800' },
  ENTERPRISE: { name: 'Enterprise', color: 'bg-gold-100 text-gold-800' }
}

export function SubscriptionCard({
  subscription,
  usage,
  onManage,
  onUpgrade,
  onCancel,
  onReactivate
}: SubscriptionCardProps) {
  const [loading, setLoading] = useState(false)
  
  const statusInfo = statusConfig[subscription.status]
  const planInfo = planConfig[subscription.plan]
  const StatusIcon = statusInfo.icon

  const isTrialing = subscription.status === 'TRIALING'
  const isCanceled = subscription.status === 'CANCELED' || subscription.canceledAt
  const canReactivate = subscription.cancelAtPeriodEnd && subscription.status === 'ACTIVE'

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  const getTokenUsagePercentage = () => {
    if (!usage?.usage.tokenLimit || usage.usage.tokenLimit === -1) return 0
    return Math.min((usage.usage.tokensUsed / usage.usage.tokenLimit) * 100, 100)
  }

  const getRequestUsagePercentage = () => {
    if (!usage?.usage.requestLimit || usage.usage.requestLimit === -1) return 0
    return Math.min((usage.usage.requestsToday / usage.usage.requestLimit) * 100, 100)
  }

  const handleAction = async (action: () => void) => {
    setLoading(true)
    try {
      await action()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Badge className={planInfo.color}>
                {planInfo.name}
              </Badge>
              <Badge variant="outline" className={`${statusInfo.color} text-white`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusInfo.label}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-2">
              {formatCurrency(subscription.unitAmount, subscription.currency)} 
              {subscription.billingCycle === 'MONTHLY' && '/month'}
              {subscription.billingCycle === 'QUARTERLY' && '/quarter'}
              {subscription.billingCycle === 'YEARLY' && '/year'}
            </CardDescription>
          </div>
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Trial Information */}
        {isTrialing && subscription.trialEnd && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-800">
              Trial ends on {formatDate(subscription.trialEnd)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Your subscription will automatically start after the trial period.
            </p>
          </div>
        )}

        {/* Cancellation Notice */}
        {canReactivate && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm font-medium text-orange-800">
              Subscription will cancel on {formatDate(subscription.currentPeriodEnd)}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              You can reactivate your subscription before this date.
            </p>
          </div>
        )}

        {/* Billing Period */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4" />
          <span>
            Current period: {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
          </span>
        </div>

        {/* Usage Information */}
        {usage && (
          <div className="space-y-3">
            <div className="text-sm font-medium">Usage This Period</div>
            
            {/* Token Usage */}
            {usage.usage.tokenLimit !== -1 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>AI Tokens</span>
                  <span>
                    {usage.usage.tokensUsed.toLocaleString()} / {usage.usage.tokenLimit.toLocaleString()}
                  </span>
                </div>
                <Progress value={getTokenUsagePercentage()} className="h-2" />
              </div>
            )}

            {/* Request Usage */}
            {usage.usage.requestLimit !== -1 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>API Calls Today</span>
                  <span>
                    {usage.usage.requestsToday.toLocaleString()} / {usage.usage.requestLimit.toLocaleString()}
                  </span>
                </div>
                <Progress value={getRequestUsagePercentage()} className="h-2" />
              </div>
            )}

            {/* Usage-based costs */}
            {usage.totalStats.totalCost > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Usage-based charges</span>
                  <span className="font-medium">
                    {formatCurrency(Math.round(usage.totalStats.totalCost * 100))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {onManage && (
          <Button
            variant="outline"
            onClick={() => handleAction(onManage)}
            disabled={loading}
          >
            Manage Billing
          </Button>
        )}

        {onUpgrade && subscription.plan !== 'ENTERPRISE' && (
          <Button
            onClick={() => handleAction(onUpgrade)}
            disabled={loading}
          >
            Upgrade
          </Button>
        )}

        {onReactivate && canReactivate && (
          <Button
            onClick={() => handleAction(onReactivate)}
            disabled={loading}
            variant="primary"
          >
            Reactivate
          </Button>
        )}

        {onCancel && !isCanceled && !canReactivate && (
          <Button
            variant="destructive"
            onClick={() => handleAction(onCancel)}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubscriptionCard } from '@/components/billing/subscription-card'
import { PaymentMethods } from '@/components/billing/payment-methods'
import { InvoiceHistory } from '@/components/billing/invoice-history'
import { UsageAnalytics } from '@/components/billing/usage-analytics'
import { useToast } from '@/hooks/use-toast'
import { CreditCard, FileText, BarChart3, Settings, Plus } from 'lucide-react'

interface BillingData {
  customer?: any
  subscription?: any
  paymentMethods: any[]
  invoices: any[]
  usage?: any
}

export default function BillingPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'authenticated') {
      loadBillingData()
    }
  }, [status])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      
      // Load customer and subscription data
      const [customerRes, subscriptionRes, paymentMethodsRes] = await Promise.all([
        fetch('/api/payments/customers').then(res => res.ok ? res.json() : null),
        fetch('/api/payments/subscriptions?includeUsage=true').then(res => res.ok ? res.json() : null),
        fetch('/api/payments/payment-methods').then(res => res.ok ? res.json() : null)
      ])

      setBillingData({
        customer: customerRes?.customer,
        subscription: subscriptionRes?.subscription,
        paymentMethods: paymentMethodsRes?.paymentMethods || [],
        invoices: [], // We'll load this separately
        usage: subscriptionRes?.usage
      })
    } catch (error) {
      console.error('Error loading billing data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load billing information. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    try {
      const response = await fetch('/api/payments/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session?.user?.name,
          metadata: {
            source: 'billing_page'
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create customer')
      }

      toast({
        title: 'Success',
        description: 'Billing account created successfully!',
      })

      await loadBillingData()
    } catch (error) {
      console.error('Error creating customer:', error)
      toast({
        title: 'Error',
        description: 'Failed to create billing account. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleManageBilling = async () => {
    try {
      // Open Stripe customer portal
      window.open('https://billing.stripe.com/p/login/test_...', '_blank')
    } catch (error) {
      console.error('Error opening billing portal:', error)
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return
    }

    try {
      const response = await fetch('/api/payments/subscriptions', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription has been canceled and will end at the end of your billing period.',
      })

      await loadBillingData()
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      // This would need to be implemented in the API
      toast({
        title: 'Coming Soon',
        description: 'Subscription reactivation will be available soon. Please contact support.',
      })
    } catch (error) {
      console.error('Error reactivating subscription:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Sign In Required</h3>
            <p className="text-muted-foreground text-center mb-4">
              Please sign in to access your billing information.
            </p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no customer exists, show setup flow
  if (!billingData?.customer) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Manage your billing information and subscriptions</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Set Up Billing</CardTitle>
            <CardDescription>
              Create your billing account to manage subscriptions and payments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateCustomer} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Billing Account
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your billing information and subscriptions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Subscription Status */}
          {billingData.subscription ? (
            <SubscriptionCard
              subscription={billingData.subscription}
              usage={billingData.usage}
              onManage={handleManageBilling}
              onUpgrade={() => {
                // Navigate to upgrade flow
                toast({
                  title: 'Coming Soon',
                  description: 'Subscription upgrades will be available soon.',
                })
              }}
              onCancel={handleCancelSubscription}
              onReactivate={handleReactivateSubscription}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>
                  Choose a subscription plan to get started with premium features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button>
                  View Plans
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="flex items-center p-6">
                <CreditCard className="w-8 h-8 text-blue-500 mr-4" />
                <div>
                  <p className="text-2xl font-bold">{billingData.paymentMethods.length}</p>
                  <p className="text-muted-foreground">Payment Methods</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <FileText className="w-8 h-8 text-green-500 mr-4" />
                <div>
                  <p className="text-2xl font-bold">{billingData.invoices.length}</p>
                  <p className="text-muted-foreground">Invoices</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <BarChart3 className="w-8 h-8 text-purple-500 mr-4" />
                <div>
                  <p className="text-2xl font-bold">
                    {billingData.usage?.totalStats.totalRequests || 0}
                  </p>
                  <p className="text-muted-foreground">API Calls This Month</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment-methods">
          <PaymentMethods
            paymentMethods={billingData.paymentMethods}
            onAdd={loadBillingData}
            onSetDefault={async (id) => {
              toast({
                title: 'Coming Soon',
                description: 'Setting default payment method will be available soon.',
              })
            }}
            onRemove={async (id) => {
              toast({
                title: 'Coming Soon',
                description: 'Removing payment methods will be available soon.',
              })
            }}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceHistory invoices={billingData.invoices} />
        </TabsContent>

        <TabsContent value="usage">
          <UsageAnalytics usage={billingData.usage} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
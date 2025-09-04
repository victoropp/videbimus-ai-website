'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PaymentMethod as PrismaPaymentMethod } from '@prisma/client'
import { CreditCard, Plus, MoreHorizontal, Check, X } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddPaymentMethodForm } from './add-payment-method-form'

interface PaymentMethod {
  id: string
  type: PrismaPaymentMethod
  cardBrand?: string
  cardLast4?: string
  cardExpMonth?: number
  cardExpYear?: number
  bankName?: string
  bankLast4?: string
  isDefault: boolean
  isActive: boolean
  billingDetails?: any
  createdAt: Date
}

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[]
  onAdd?: () => void
  onSetDefault?: (id: string) => void
  onRemove?: (id: string) => void
  onUpdate?: (id: string, data: any) => void
}

const cardBrandIcons = {
  'VISA': '💳',
  'MASTERCARD': '💳',
  'AMEX': '💳',
  'DISCOVER': '💳',
  'DINERS': '💳',
  'JCB': '💳',
  'UNIONPAY': '💳',
  'UNKNOWN': '💳'
}

export function PaymentMethods({
  paymentMethods,
  onAdd,
  onSetDefault,
  onRemove,
  onUpdate
}: PaymentMethodsProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleAction = async (action: () => void | Promise<void>, actionId: string) => {
    setLoadingAction(actionId)
    try {
      await action()
    } finally {
      setLoadingAction(null)
    }
  }

  const formatExpirationDate = (month?: number, year?: number) => {
    if (!month || !year) return ''
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`
  }

  const getPaymentMethodDisplay = (pm: PaymentMethod) => {
    switch (pm.type) {
      case 'CARD':
        return {
          icon: cardBrandIcons[pm.cardBrand as keyof typeof cardBrandIcons] || '💳',
          title: `${pm.cardBrand || 'Card'} •••• ${pm.cardLast4}`,
          subtitle: `Expires ${formatExpirationDate(pm.cardExpMonth, pm.cardExpYear)}`
        }
      case 'BANK_ACCOUNT':
        return {
          icon: '🏦',
          title: `${pm.bankName || 'Bank Account'} •••• ${pm.bankLast4}`,
          subtitle: 'Bank Account'
        }
      case 'SEPA_DEBIT':
        return {
          icon: '🏦',
          title: `SEPA •••• ${pm.bankLast4}`,
          subtitle: 'SEPA Direct Debit'
        }
      default:
        return {
          icon: '💳',
          title: pm.type.replace('_', ' '),
          subtitle: 'Payment Method'
        }
    }
  }

  const activePaymentMethods = paymentMethods.filter(pm => pm.isActive)
  const defaultPaymentMethod = activePaymentMethods.find(pm => pm.isDefault)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">
            Manage your payment methods for subscriptions and one-time payments.
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>
                Add a new payment method to your account.
              </DialogDescription>
            </DialogHeader>
            <AddPaymentMethodForm
              onSuccess={() => {
                setShowAddDialog(false)
                onAdd?.()
              }}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {activePaymentMethods.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No payment methods</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add a payment method to start making payments and manage subscriptions.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activePaymentMethods.map((paymentMethod) => {
            const display = getPaymentMethodDisplay(paymentMethod)
            
            return (
              <Card key={paymentMethod.id} className={paymentMethod.isDefault ? 'ring-2 ring-primary' : ''}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{display.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{display.title}</p>
                        {paymentMethod.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{display.subtitle}</p>
                      {paymentMethod.billingDetails?.email && (
                        <p className="text-xs text-muted-foreground">
                          {paymentMethod.billingDetails.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!paymentMethod.isDefault && onSetDefault && (
                        <DropdownMenuItem
                          onClick={() => handleAction(
                            () => onSetDefault(paymentMethod.id),
                            `default-${paymentMethod.id}`
                          )}
                          disabled={loadingAction === `default-${paymentMethod.id}`}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Set as Default
                        </DropdownMenuItem>
                      )}
                      {onUpdate && (
                        <DropdownMenuItem
                          onClick={() => {
                            // Handle update - could open a dialog
                            console.log('Update payment method:', paymentMethod.id)
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onRemove && activePaymentMethods.length > 1 && (
                        <DropdownMenuItem
                          onClick={() => handleAction(
                            () => onRemove(paymentMethod.id),
                            `remove-${paymentMethod.id}`
                          )}
                          disabled={loadingAction === `remove-${paymentMethod.id}`}
                          className="text-destructive"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {defaultPaymentMethod && (
        <div className="text-xs text-muted-foreground">
          Your default payment method will be used for automatic subscription renewals.
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'

// Load Stripe outside of component render to avoid recreating the Stripe object on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface AddPaymentMethodFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
}

function AddPaymentMethodFormContent({ onSuccess, onCancel }: AddPaymentMethodFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US'
    }
  })

  // Get setup intent on component mount
  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        const response = await fetch('/api/payments/payment-methods/setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethodTypes: ['card']
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to create setup intent')
        }

        const { setupIntent } = await response.json()
        setClientSecret(setupIntent.client_secret)
      } catch (error) {
        console.error('Error creating setup intent:', error)
        toast({
          title: 'Error',
          description: 'Failed to initialize payment form. Please try again.',
          variant: 'destructive',
        })
      }
    }

    createSetupIntent()
  }, [toast])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setLoading(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setLoading(false)
      return
    }

    try {
      // Confirm the setup intent with the card element
      const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: billingDetails,
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      if (setupIntent?.status === 'succeeded') {
        // Attach the payment method to the customer
        const response = await fetch('/api/payments/payment-methods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentMethodId: setupIntent.payment_method,
            setAsDefault: false, // Let user choose if they want it as default
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save payment method')
        }

        toast({
          title: 'Success',
          description: 'Payment method added successfully!',
        })

        onSuccess?.()
      }
    } catch (error) {
      console.error('Error adding payment method:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add payment method',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Card Element */}
      <div className="space-y-2">
        <Label htmlFor="card-element">Card Information</Label>
        <Card>
          <CardContent className="p-3">
            <CardElement
              id="card-element"
              options={CARD_ELEMENT_OPTIONS}
            />
          </CardContent>
        </Card>
      </div>

      {/* Billing Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Cardholder Name</Label>
          <Input
            id="name"
            type="text"
            value={billingDetails.name}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={billingDetails.email}
            onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="line1">Address</Label>
          <Input
            id="line1"
            type="text"
            value={billingDetails.address.line1}
            onChange={(e) => setBillingDetails(prev => ({ 
              ...prev, 
              address: { ...prev.address, line1: e.target.value }
            }))}
            placeholder="123 Main St"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="line2">Address Line 2 (Optional)</Label>
          <Input
            id="line2"
            type="text"
            value={billingDetails.address.line2}
            onChange={(e) => setBillingDetails(prev => ({ 
              ...prev, 
              address: { ...prev.address, line2: e.target.value }
            }))}
            placeholder="Apt, suite, etc."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              type="text"
              value={billingDetails.address.city}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, city: e.target.value }
              }))}
              placeholder="New York"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              type="text"
              value={billingDetails.address.state}
              onChange={(e) => setBillingDetails(prev => ({ 
                ...prev, 
                address: { ...prev.address, state: e.target.value }
              }))}
              placeholder="NY"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="postal_code">ZIP / Postal Code</Label>
          <Input
            id="postal_code"
            type="text"
            value={billingDetails.address.postal_code}
            onChange={(e) => setBillingDetails(prev => ({ 
              ...prev, 
              address: { ...prev.address, postal_code: e.target.value }
            }))}
            placeholder="10001"
            required
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Adding...
            </div>
          ) : (
            'Add Payment Method'
          )}
        </Button>
      </div>
    </form>
  )
}

export function AddPaymentMethodForm(props: AddPaymentMethodFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <AddPaymentMethodFormContent {...props} />
    </Elements>
  )
}
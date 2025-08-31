'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/stripe'
import { FileText, Download, Eye, ExternalLink } from 'lucide-react'

interface Invoice {
  id: string
  number: string
  status: string
  total: number
  currency: string
  paidAt?: Date | null
  dueDate?: Date | null
  periodStart: Date
  periodEnd: Date
  hostedInvoiceUrl?: string | null
  invoicePdf?: string | null
  items: Array<{
    description: string
    quantity: number
    unitAmount: number
    amount: number
  }>
}

interface InvoiceHistoryProps {
  invoices: Invoice[]
  onLoadMore?: () => void
  hasMore?: boolean
}

const statusConfig = {
  'DRAFT': { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  'OPEN': { label: 'Open', color: 'bg-yellow-100 text-yellow-800' },
  'PAID': { label: 'Paid', color: 'bg-green-100 text-green-800' },
  'VOID': { label: 'Void', color: 'bg-red-100 text-red-800' },
  'UNCOLLECTIBLE': { label: 'Uncollectible', color: 'bg-red-100 text-red-800' }
}

export function InvoiceHistory({ invoices, onLoadMore, hasMore }: InvoiceHistoryProps) {
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null)

  const formatDate = (date: Date | string) => {
    return new Intl.DateFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  const handleViewInvoice = (invoice: Invoice) => {
    if (invoice.hostedInvoiceUrl) {
      window.open(invoice.hostedInvoiceUrl, '_blank')
    }
  }

  const handleDownloadPdf = (invoice: Invoice) => {
    if (invoice.invoicePdf) {
      window.open(invoice.invoicePdf, '_blank')
    }
  }

  const toggleExpanded = (invoiceId: string) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId)
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
          <p className="text-muted-foreground text-center">
            Your invoice history will appear here once you start making payments.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Invoice History</h3>
        <p className="text-sm text-muted-foreground">
          View and download your past invoices and receipts.
        </p>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => {
          const statusInfo = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.OPEN
          const isExpanded = expandedInvoice === invoice.id

          return (
            <Card key={invoice.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">Invoice #{invoice.number}</h4>
                      <Badge className={statusInfo.color}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>
                        {formatCurrency(invoice.total, invoice.currency)}
                      </span>
                      <span>
                        Period: {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                      </span>
                      {invoice.paidAt && (
                        <span>
                          Paid: {formatDate(invoice.paidAt)}
                        </span>
                      )}
                      {invoice.dueDate && !invoice.paidAt && (
                        <span>
                          Due: {formatDate(invoice.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(invoice.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {isExpanded ? 'Hide' : 'Details'}
                    </Button>

                    {invoice.hostedInvoiceUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}

                    {invoice.invoicePdf && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPdf(invoice)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    )}
                  </div>
                </div>

                {isExpanded && invoice.items && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium mb-3">Invoice Details</h5>
                    <div className="space-y-2">
                      {invoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.description}</p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                {item.quantity} × {formatCurrency(item.unitAmount, invoice.currency)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatCurrency(item.amount, invoice.currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex justify-between items-center pt-2 border-t font-medium">
                        <p>Total</p>
                        <p>{formatCurrency(invoice.total, invoice.currency)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {hasMore && onLoadMore && (
        <div className="text-center">
          <Button variant="outline" onClick={onLoadMore}>
            Load More Invoices
          </Button>
        </div>
      )}
    </div>
  )
}
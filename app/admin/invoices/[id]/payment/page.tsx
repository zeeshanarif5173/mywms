'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Payment {
  id: number
  amount: number
  method: string
  reference?: string
  paidAt: string
  createdAt: string
  status: string
  notes?: string
}

interface Invoice {
  id: number
  invoiceNumber: string
  customer: {
    id: number
    name: string
    email: string
    company?: string
  }
  branch: {
    id: number
    name: string
  }
  issueDate: string
  dueDate: string
  status: string
  subtotal: number
  taxAmount: number
  total: number
  notes?: string
  paidAt?: string
  createdAt: string
}

export default function InvoicePaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: '',
    reference: '',
    notes: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchInvoiceAndPayments()
    }
  }, [params.id])

  const fetchInvoiceAndPayments = async () => {
    try {
      setLoading(true)
      const [invoiceRes, paymentsRes] = await Promise.all([
        fetch(`/api/invoices/${params.id}`),
        fetch(`/api/invoices/${params.id}/payments`)
      ])

      // Fetch invoice data
      if (invoiceRes.ok) {
        const invoiceData = await invoiceRes.json()
        if (invoiceData.success) {
          setInvoice(invoiceData.data)
        } else {
          setError(invoiceData.error || 'Invoice not found')
        }
      }

      // Fetch payments data
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        if (paymentsData.success) {
          setPayments(paymentsData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentData.amount || !paymentData.method) {
      alert('Please fill in amount and payment method')
      return
    }

    const amount = parseFloat(paymentData.amount)
    if (amount <= 0) {
      alert('Payment amount must be greater than 0')
      return
    }

    if (invoice) {
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
      if (totalPaid + amount > invoice.total) {
        alert('Payment amount exceeds remaining balance')
        return
      }
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/invoices/${params.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: paymentData.amount,
          method: paymentData.method,
          reference: paymentData.reference || undefined,
          notes: paymentData.notes || undefined
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(data.message || 'Payment recorded successfully')
        setPaymentData({ amount: '', method: '', reference: '', notes: '' })
        fetchInvoiceAndPayments() // Refresh data
      } else {
        alert(data.error || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Failed to record payment')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PAID: 'bg-green-100 text-green-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800',
      SENT: 'bg-blue-100 text-blue-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'credit card':
      case 'card':
        return <CreditCardIcon className="w-5 h-5" />
      case 'cash':
      case 'cash payment':
        return <BanknotesIcon className="w-5 h-5" />
      default:
        return <CheckCircleIcon className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || 'Invoice not found'}</p>
          <button
            onClick={() => router.push('/admin/invoices')}
            className="text-blue-600 hover:text-blue-900"
          >
            ← Back to Invoices
          </button>
        </div>
      </div>
    )
  }

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const remainingBalance = invoice.total - totalPaid
  const isOverdue = invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && new Date(invoice.dueDate) < new Date()

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/admin/invoices/${params.id}`)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to Invoice
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
            <p className="text-gray-600">Invoice {invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(invoice.status)}
          {isOverdue && (
            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Overdue
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer:</span>
                <span className="text-sm font-medium text-gray-900">{invoice.customer.name}</span>
              </div>
              {invoice.customer.company && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Company:</span>
                  <span className="text-sm font-medium text-gray-900">{invoice.customer.company}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Branch:</span>
                <span className="text-sm font-medium text-gray-900">{invoice.branch.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount Paid:</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-gray-300 pt-2">
                  <span className={remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}>Balance:</span>
                  <span className={remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          {remainingBalance > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Record New Payment</h2>
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={remainingBalance}
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum: {formatCurrency(remainingBalance)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Method</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference/Transaction ID
                  </label>
                  <input
                    type="text"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional reference number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Recording Payment...' : 'Record Payment'}
                </button>
              </form>
            </div>
          )}

          {remainingBalance === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">Invoice Fully Paid</h3>
                  <p className="text-green-600">This invoice has been completely paid.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
            
            {payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="text-blue-600">
                          {getPaymentMethodIcon(payment.method)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.method}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(payment.paidAt)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.reference && `Ref: ${payment.reference}`}
                        </div>
                      </div>
                    </div>
                    {payment.notes && (
                      <div className="mt-2 text-sm text-gray-600 italic">
                        {payment.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BanknotesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payments recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

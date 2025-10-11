'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline'

interface Payment {
  id: number
  amount: number
  method: string
  reference: string
  paidAt: string
}

interface Bill {
  id: number
  billNumber: string
  vendor: {
    id: number
    name: string
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
  payments: Payment[]
}

export default function BillPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    amount: '',
    method: 'CASH',
    reference: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (params.id) {
      fetchBill()
    }
  }, [params.id])

  const fetchBill = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bills/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setBill(data)
        
        // Set default amount to remaining balance
        const totalPaid = data.payments.reduce((sum: number, payment: Payment) => sum + payment.amount, 0)
        const remainingBalance = data.total - totalPaid
        setFormData(prev => ({ ...prev, amount: remainingBalance.toString() }))
      } else if (response.status === 404) {
        setError('Bill not found')
      } else {
        setError('Failed to load bill')
      }
    } catch (error) {
      console.error('Error fetching bill:', error)
      setError('Failed to load bill')
    } finally {
      setLoading(false)
    }
  }

  const getTotalPaid = () => {
    return bill?.payments.reduce((sum, payment) => sum + payment.amount, 0) || 0
  }

  const getRemainingBalance = () => {
    if (!bill) return 0
    return bill.total - getTotalPaid()
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const amount = parseFloat(formData.amount)

    if (!formData.amount || amount <= 0) {
      newErrors.amount = 'Valid payment amount is required'
    } else if (amount > getRemainingBalance()) {
      newErrors.amount = 'Payment amount cannot exceed remaining balance'
    }

    if (!formData.method) newErrors.method = 'Payment method is required'
    if (!formData.reference.trim()) newErrors.reference = 'Reference is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/bills/${params.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          method: formData.method,
          reference: formData.reference,
          notes: formData.notes
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push(`/admin/bills/${params.id}`)
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
      month: 'short',
      day: 'numeric'
    })
  }

  const paymentMethods = [
    { value: 'CASH', label: 'Cash', icon: BanknotesIcon },
    { value: 'CARD', label: 'Credit/Debit Card', icon: CreditCardIcon },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: BanknotesIcon },
    { value: 'CHECK', label: 'Check', icon: BanknotesIcon },
    { value: 'OTHER', label: 'Other', icon: BanknotesIcon }
  ]

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

  if (error || !bill) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.push('/admin/bills')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to Bills
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bill Not Found</h1>
          <p className="text-gray-600">{error || 'The requested bill could not be found.'}</p>
        </div>
      </div>
    )
  }

  const remainingBalance = getRemainingBalance()
  const totalPaid = getTotalPaid()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push(`/admin/bills/${params.id}`)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to Bill
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
            <p className="text-gray-600">Bill {bill.billNumber} - {bill.vendor.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingBalance}
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  required
                />
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Maximum: {formatCurrency(remainingBalance)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon
                    return (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, method: method.value }))}
                        className={`p-3 border rounded-md text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formData.method === method.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                        <div className="text-sm font-medium text-gray-900">{method.label}</div>
                      </button>
                    )
                  })}
                </div>
                {errors.method && (
                  <p className="mt-1 text-sm text-red-600">{errors.method}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference/Transaction ID *
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.reference ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter transaction reference"
                  required
                />
                {errors.reference && (
                  <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional payment notes (optional)"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/bills/${params.id}`)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || remainingBalance <= 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <CheckIcon className="w-4 h-4 mr-2" />
                  {submitting ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="space-y-6">
          {/* Bill Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Bill Total</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(bill.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount Paid</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(totalPaid)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">Remaining Balance</span>
                  <span className={`text-base font-bold ${remainingBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(remainingBalance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Information</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Bill Number</label>
                <p className="text-sm text-gray-900">{bill.billNumber}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Vendor</label>
                <p className="text-sm text-gray-900">{bill.vendor.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Branch</label>
                <p className="text-sm text-gray-900">{bill.branch.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Due Date</label>
                <p className="text-sm text-gray-900">{formatDate(bill.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {bill.payments.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
              <div className="space-y-3">
                {bill.payments.map((payment) => (
                  <div key={payment.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payment.method}</p>
                        <p className="text-xs text-gray-500">{formatDate(payment.paidAt)}</p>
                        <p className="text-xs text-gray-500">{payment.reference}</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  PrinterIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface InvoiceItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface Payment {
  id: number
  amount: number
  method: string
  status: string
  createdAt: string
  notes?: string
}

interface Invoice {
  id: number
  invoiceNumber: string
  customer: {
    id: number
    name: string
    email: string
    phone?: string
    company?: string
  }
  branch: {
    id: number
    name: string
    address?: string
    phone?: string
    email?: string
  }
  issueDate: string
  dueDate: string
  status: string
  subtotal: number
  taxAmount: number
  total: number
  taxRate: number
  notes?: string
  paidAt?: string
  createdAt: string
  items: InvoiceItem[]
  payments: Payment[]
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchInvoice(params.id as string)
    }
  }, [params.id])

  const fetchInvoice = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/invoices/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setInvoice(data.data)
      } else {
        setError(data.error || 'Failed to fetch invoice')
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      setError('Failed to fetch invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!invoice) return

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setInvoice(data.data)
        }
      }
    } catch (error) {
      console.error('Error updating invoice status:', error)
    }
  }

  const handleDelete = async () => {
    if (!invoice) return

    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/invoices')
      }
    } catch (error) {
      console.error('Error deleting invoice:', error)
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
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      PARTIAL: 'bg-yellow-100 text-yellow-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }

    const statusIcons = {
      DRAFT: ClockIcon,
      SENT: ClockIcon,
      PAID: CheckCircleIcon,
      PARTIAL: ExclamationTriangleIcon,
      OVERDUE: ExclamationTriangleIcon,
      CANCELLED: ExclamationTriangleIcon
    }

    const Icon = statusIcons[status as keyof typeof statusIcons] || ClockIcon

    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status}
      </span>
    )
  }

  const isOverdue = () => {
    if (!invoice) return false
    return invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && new Date(invoice.dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <Link
            href="/admin/invoices"
            className="inline-flex items-center text-blue-600 hover:text-blue-900"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Invoices
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/invoices"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to Invoices
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
            <p className="text-gray-600">Created on {formatDate(invoice.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(invoice.status)}
          {isOverdue() && (
            <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Overdue
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/invoices/${invoice.id}/edit`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <PrinterIcon className="w-4 h-4 mr-1" />
              Print
            </button>
            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
              <Link
                href={`/admin/invoices/${invoice.id}/payment`}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Record Payment
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {invoice.status === 'DRAFT' && (
              <button
                onClick={() => handleStatusChange('SENT')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send Invoice
              </button>
            )}
            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            
            {/* From/To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">From</h3>
                <div className="text-sm text-gray-900">
                  <div className="font-semibold">{invoice.branch.name}</div>
                  {invoice.branch.address && <div>{invoice.branch.address}</div>}
                  {invoice.branch.phone && <div>{invoice.branch.phone}</div>}
                  {invoice.branch.email && <div>{invoice.branch.email}</div>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">To</h3>
                <div className="text-sm text-gray-900">
                  <div className="font-semibold">{invoice.customer.name}</div>
                  {invoice.customer.company && <div>{invoice.customer.company}</div>}
                  <div>{invoice.customer.email}</div>
                  {invoice.customer.phone && <div>{invoice.customer.phone}</div>}
                </div>
              </div>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-sm font-medium text-gray-700">Invoice Number</div>
                <div className="text-sm text-gray-900">{invoice.invoiceNumber}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Issue Date</div>
                <div className="text-sm text-gray-900">{formatDate(invoice.issueDate)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Due Date</div>
                <div className={`text-sm ${isOverdue() ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                  {formatDate(invoice.dueDate)}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm text-gray-900">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Tax ({invoice.taxRate}%):</span>
                  <span className="text-sm text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-base font-semibold text-gray-900">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
            
            {invoice.payments.length > 0 ? (
              <div className="space-y-4">
                {invoice.payments.map((payment) => (
                  <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        payment.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : payment.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>{payment.method}</div>
                      <div>{formatDate(payment.createdAt)}</div>
                      {payment.notes && (
                        <div className="mt-1 italic">{payment.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No payments recorded</p>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(invoice.payments.reduce((sum, payment) => sum + payment.amount, 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Balance:</span>
                <span className={`font-semibold ${
                  invoice.total - invoice.payments.reduce((sum, payment) => sum + payment.amount, 0) === 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {formatCurrency(invoice.total - invoice.payments.reduce((sum, payment) => sum + payment.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

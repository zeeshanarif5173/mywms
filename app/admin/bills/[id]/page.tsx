'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  CreditCardIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface BillItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  total: number
}

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
    email?: string
    phone?: string
    address?: string
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
  paidAt?: string
  createdAt: string
  items: BillItem[]
  payments: Payment[]
}

export default function BillDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/bills/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/admin/bills')
      } else {
        alert('Failed to delete bill')
      }
    } catch (error) {
      console.error('Error deleting bill:', error)
      alert('Failed to delete bill')
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
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }

    return (
      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    )
  }

  const getTotalPaid = () => {
    return bill?.payments.reduce((sum, payment) => sum + payment.amount, 0) || 0
  }

  const getRemainingBalance = () => {
    if (!bill) return 0
    return bill.total - getTotalPaid()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Link
            href="/admin/bills"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to Bills
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Bill Not Found</h1>
          <p className="text-gray-600">{error || 'The requested bill could not be found.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/bills"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to Bills
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bill {bill.billNumber}</h1>
            <p className="text-gray-600">Bill Details and Payment History</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
            <Link
              href={`/admin/bills/${bill.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Edit
            </Link>
          )}
          <button className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center">
            <PrinterIcon className="w-4 h-4 mr-2" />
            Print
          </button>
          {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
            <Link
              href={`/admin/bills/${bill.id}/payment`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
            >
              <CreditCardIcon className="w-4 h-4 mr-2" />
              Payment
            </Link>
          )}
          {bill.status !== 'PAID' && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bill Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bill Number</label>
                <p className="text-sm text-gray-900">{bill.billNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(bill.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                <p className="text-sm text-gray-900">{formatDate(bill.issueDate)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <p className="text-sm text-gray-900">{formatDate(bill.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{bill.vendor.name}</p>
              </div>
              {bill.vendor.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{bill.vendor.email}</p>
                </div>
              )}
              {bill.vendor.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{bill.vendor.phone}</p>
                </div>
              )}
              {bill.vendor.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="text-sm text-gray-900">{bill.vendor.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Bill Items */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bill.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment History */}
          {bill.payments.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bill.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.paidAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.reference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Bill Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(bill.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(bill.taxAmount)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-base font-bold text-gray-900">{formatCurrency(bill.total)}</span>
                </div>
              </div>
              {getTotalPaid() > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount Paid</span>
                    <span className="text-sm font-medium text-green-600">{formatCurrency(getTotalPaid())}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-medium text-gray-900">Remaining Balance</span>
                      <span className={`text-base font-bold ${getRemainingBalance() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(getRemainingBalance())}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Branch Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch</label>
              <p className="text-sm text-gray-900">{bill.branch.name}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                <>
                  <Link
                    href={`/admin/bills/${bill.id}/edit`}
                    className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Edit Bill
                  </Link>
                  <Link
                    href={`/admin/bills/${bill.id}/payment`}
                    className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Record Payment
                  </Link>
                </>
              )}
              <button className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Print Bill
              </button>
              <button className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

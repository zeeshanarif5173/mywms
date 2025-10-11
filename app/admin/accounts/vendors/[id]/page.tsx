'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Vendor {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  taxId?: string
  isActive: boolean
  branch: {
    id: number
    name: string
    address: string
    phone?: string
    email?: string
  }
  createdAt: string
  bills: Array<{
    id: number
    billNumber: string
    issueDate: string
    dueDate: string
    status: string
    total: number
    _count: {
      items: number
      payments: number
    }
  }>
  stats: {
    totalBills: number
    totalBillsAmount: number
    paidBills: number
    pendingBills: number
    overdueBills: number
  }
}

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendor()
  }, [params.id])

  const fetchVendor = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vendors/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setVendor(data.data)
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleVendorStatus = async () => {
    if (!vendor) return

    try {
      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !vendor.isActive })
      })

      if (response.ok) {
        fetchVendor() // Refresh vendor data
      }
    } catch (error) {
      console.error('Error updating vendor status:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800'
    }

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    )
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

  if (!vendor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h1>
          <Link
            href="/admin/accounts/vendors"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Vendors
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
          <p className="text-gray-600">Vendor Details</p>
        </div>
        <div className="flex space-x-4">
          <Link
            href={`/admin/accounts/vendors/${vendor.id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Vendor
          </Link>
          <button
            onClick={toggleVendorStatus}
            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${
              vendor.isActive
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            {vendor.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Vendor Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-gray-900">{vendor.email || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Phone:</span>
              <p className="text-gray-900">{vendor.phone || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Address:</span>
              <p className="text-gray-900">{vendor.address || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Tax ID:</span>
              <p className="text-gray-900">{vendor.taxId || 'Not provided'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Branch:</span>
              <p className="text-gray-900">{vendor.branch.name}</p>
              <p className="text-sm text-gray-600">{vendor.branch.address}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Status:</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                vendor.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {vendor.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Total Bills:</span>
              <span className="text-gray-900 font-semibold">{vendor.stats.totalBills}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Total Amount:</span>
              <span className="text-gray-900 font-semibold">{formatCurrency(vendor.stats.totalBillsAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Paid Bills:</span>
              <span className="text-green-600 font-semibold">{vendor.stats.paidBills}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Pending Bills:</span>
              <span className="text-yellow-600 font-semibold">{vendor.stats.pendingBills}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Overdue Bills:</span>
              <span className="text-red-600 font-semibold">{vendor.stats.overdueBills}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bills History */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bills History</h3>
          <Link
            href="/admin/accounts/bills/create"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Create Bill
          </Link>
        </div>

        {vendor.bills.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bill #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendor.bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {bill.billNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(bill.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(bill.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(bill.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/accounts/bills/${bill.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No bills found for this vendor.</p>
            <Link
              href="/admin/accounts/bills/create"
              className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
            >
              Create First Bill →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}


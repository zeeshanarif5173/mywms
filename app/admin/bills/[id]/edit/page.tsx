'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Vendor {
  id: number
  name: string
  email?: string
}

interface Branch {
  id: number
  name: string
}

interface BillItem {
  id?: number
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Bill {
  id: number
  billNumber: string
  vendorId: number
  branchId: number
  issueDate: string
  dueDate: string
  status: string
  subtotal: number
  taxAmount: number
  total: number
  items: BillItem[]
}

export default function EditBillPage() {
  const params = useParams()
  const router = useRouter()
  const [bill, setBill] = useState<Bill | null>(null)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    vendorId: '',
    branchId: '',
    issueDate: '',
    dueDate: '',
    status: 'PENDING'
  })

  const [items, setItems] = useState<BillItem[]>([])
  const [taxRate, setTaxRate] = useState(0.1) // 10% default tax rate

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (params.id) {
      fetchBill()
      fetchVendorsAndBranches()
    }
  }, [params.id])

  const fetchBill = async () => {
    try {
      const response = await fetch(`/api/bills/${params.id}`)
      
      if (response.ok) {
        const billData = await response.json()
        setBill(billData)
        setFormData({
          vendorId: billData.vendor.id.toString(),
          branchId: billData.branch.id.toString(),
          issueDate: billData.issueDate.split('T')[0],
          dueDate: billData.dueDate.split('T')[0],
          status: billData.status
        })
        setItems(billData.items)
      } else if (response.status === 404) {
        setError('Bill not found')
      } else {
        setError('Failed to load bill')
      }
    } catch (error) {
      console.error('Error fetching bill:', error)
      setError('Failed to load bill')
    }
  }

  const fetchVendorsAndBranches = async () => {
    try {
      const [vendorsRes, branchesRes] = await Promise.all([
        fetch('/api/vendors'),
        fetch('/api/branches')
      ])

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json()
        setVendors(vendorsData.data || [])
      }

      if (branchesRes.ok) {
        const branchesData = await branchesRes.json()
        setBranches(branchesData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
    calculateTotals()
  }

  const updateItem = (index: number, field: keyof BillItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice
    }
    
    setItems(updatedItems)
    calculateTotals()
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount
    
    return { subtotal, taxAmount, total }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.vendorId) newErrors.vendorId = 'Vendor is required'
    if (!formData.branchId) newErrors.branchId = 'Branch is required'
    if (!formData.issueDate) newErrors.issueDate = 'Issue date is required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required'
    if (items.length === 0) newErrors.items = 'At least one item is required'

    // Validate items
    items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Item description is required'
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0'
      }
      if (item.unitPrice < 0) {
        newErrors[`item_${index}_unitPrice`] = 'Unit price must be 0 or greater'
      }
    })

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
      const { subtotal, taxAmount, total } = calculateTotals()

      const response = await fetch(`/api/bills/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          vendorId: parseInt(formData.vendorId),
          branchId: parseInt(formData.branchId),
          subtotal,
          taxAmount,
          total,
          items: items.map(item => ({
            ...item,
            id: item.id || undefined
          }))
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        router.push(`/admin/bills/${params.id}`)
      } else {
        alert(data.error || 'Failed to update bill')
      }
    } catch (error) {
      console.error('Error updating bill:', error)
      alert('Failed to update bill')
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

  const { subtotal, taxAmount, total } = calculateTotals()

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Bill {bill.billNumber}</h1>
            <p className="text-gray-600">Update bill information and items</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bill Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor *
              </label>
              <select
                value={formData.vendorId}
                onChange={(e) => setFormData(prev => ({ ...prev, vendorId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.vendorId ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              {errors.vendorId && (
                <p className="mt-1 text-sm text-red-600">{errors.vendorId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch *
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.branchId ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              {errors.branchId && (
                <p className="mt-1 text-sm text-red-600">{errors.branchId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date *
              </label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.issueDate ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.issueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={taxRate * 100}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bill Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bill Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`item_${index}_description`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Item description"
                />
                {errors[`item_${index}_description`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_description`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors[`item_${index}_quantity`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[`item_${index}_unitPrice`] ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors[`item_${index}_unitPrice`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_unitPrice`]}</p>
                )}
              </div>

              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <input
                    type="text"
                    value={formatCurrency(item.total)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {errors.items && (
            <p className="mt-2 text-sm text-red-600">{errors.items}</p>
          )}
        </div>

        {/* Bill Summary */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Subtotal</h4>
              <p className="text-2xl font-bold text-gray-600">{formatCurrency(subtotal)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Tax ({(taxRate * 100).toFixed(1)}%)</h4>
              <p className="text-2xl font-bold text-gray-600">{formatCurrency(taxAmount)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900">Total</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
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
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            {submitting ? 'Updating...' : 'Update Bill'}
          </button>
        </div>
      </form>
    </div>
  )
}

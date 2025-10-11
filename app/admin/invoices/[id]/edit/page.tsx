'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'

interface Customer {
  id: number
  name: string
  email: string
  company?: string
  phone?: string
  address?: string
}

interface Branch {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
}

interface InvoiceItem {
  id?: number
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface Invoice {
  id: number
  invoiceNumber: string
  customer: Customer
  branch: Branch
  issueDate: string
  dueDate: string
  status: string
  subtotal: number
  taxAmount: number
  total: number
  taxRate: number
  notes?: string
  items: InvoiceItem[]
}

export default function EditInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    branchId: '',
    issueDate: '',
    dueDate: '',
    status: 'DRAFT',
    taxRate: 0,
    notes: ''
  })

  const [items, setItems] = useState<InvoiceItem[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (params.id) {
      fetchInvoice()
      fetchCustomersAndBranches()
    }
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`)
      
      if (response.ok) {
        const invoiceData = await response.json()
        setInvoice(invoiceData)
        setFormData({
          invoiceNumber: invoiceData.invoiceNumber,
          customerId: invoiceData.customer.id.toString(),
          branchId: invoiceData.branch.id.toString(),
          issueDate: invoiceData.issueDate.split('T')[0],
          dueDate: invoiceData.dueDate.split('T')[0],
          status: invoiceData.status,
          taxRate: invoiceData.taxRate,
          notes: invoiceData.notes || ''
        })
        setItems(invoiceData.items)
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
    }
  }

  const fetchCustomersAndBranches = async () => {
    try {
      const [customersRes, branchesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/branches')
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        // Handle different API response structures
        if (customersData.data && Array.isArray(customersData.data)) {
          setCustomers(customersData.data)
        } else if (Array.isArray(customersData)) {
          setCustomers(customersData)
        } else {
          setCustomers([])
        }
      } else {
        setCustomers([])
      }

      if (branchesRes.ok) {
        const branchesData = await branchesRes.json()
        if (branchesData.data && Array.isArray(branchesData.data)) {
          setBranches(branchesData.data)
        } else if (Array.isArray(branchesData)) {
          setBranches(branchesData)
        } else {
          setBranches([])
        }
      } else {
        setBranches([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setCustomers([])
      setBranches([])
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setItems([...items, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
    calculateTotals()
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].unitPrice
    }
    
    setItems(updatedItems)
    calculateTotals()
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * (formData.taxRate / 100)
    const total = subtotal + taxAmount
    
    return { subtotal, taxAmount, total }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required'
    if (!formData.customerId) newErrors.customerId = 'Customer is required'
    if (!formData.branchId) newErrors.branchId = 'Branch is required'
    if (!formData.issueDate) newErrors.issueDate = 'Issue date is required'
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required'
    if (items.length === 0) newErrors.items = 'At least one item is required'

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

      const response = await fetch(`/api/invoices/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          customerId: parseInt(formData.customerId),
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
        router.push(`/admin/invoices/${params.id}`)
      } else {
        alert(data.error || 'Failed to update invoice')
      }
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Failed to update invoice')
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
      day: 'numeric'
    })
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

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.push('/admin/invoices')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            Back to Invoices
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
          <p className="text-gray-600">The requested invoice could not be found.</p>
        </div>
      </div>
    )
  }

  const { subtotal, taxAmount, total } = calculateTotals()
  const selectedCustomer = Array.isArray(customers) ? customers.find(c => c.id.toString() === formData.customerId) : null
  const selectedBranch = Array.isArray(branches) ? branches.find(b => b.id.toString() === formData.branchId) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/admin/invoices/${params.id}`)}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-1" />
                Back to Invoice
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
                <p className="text-gray-600">Update invoice details and items</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center">
                <PrinterIcon className="w-4 h-4 mr-2" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Header - Company Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Invoice Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* From - Branch Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">From</h3>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Branch *
                      </label>
                      <select
                        value={formData.branchId}
                        onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                    {selectedBranch && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{selectedBranch.name}</p>
                        {selectedBranch.address && <p>{selectedBranch.address}</p>}
                        {selectedBranch.phone && <p>Phone: {selectedBranch.phone}</p>}
                        {selectedBranch.email && <p>Email: {selectedBranch.email}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Invoice Info</h3>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Invoice Number *
                      </label>
                      <input
                        type="text"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          errors.invoiceNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="INV-001"
                        required
                      />
                      {errors.invoiceNumber && (
                        <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issue Date *
                        </label>
                        <input
                          type="date"
                          value={formData.issueDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.issueDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date *
                        </label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                            errors.dueDate ? 'border-red-300' : 'border-gray-300'
                          }`}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="SENT">Sent</option>
                        <option value="PAID">Paid</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* To - Customer Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">To</h3>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer *
                      </label>
                      <select
                        value={formData.customerId}
                        onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          errors.customerId ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Select Customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name} {customer.company && `(${customer.company})`}
                          </option>
                        ))}
                      </select>
                      {errors.customerId && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerId}</p>
                      )}
                    </div>
                    {selectedCustomer && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                        {selectedCustomer.company && <p>{selectedCustomer.company}</p>}
                        {selectedCustomer.address && <p>{selectedCustomer.address}</p>}
                        {selectedCustomer.email && <p>Email: {selectedCustomer.email}</p>}
                        {selectedCustomer.phone && <p>Phone: {selectedCustomer.phone}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Invoice Items</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>
            </div>
            <div className="p-6">
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
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`item_${index}_description`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Item description"
                          />
                          {errors[`item_${index}_description`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_description`]}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`item_${index}_quantity`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors[`item_${index}_quantity`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              errors[`item_${index}_unitPrice`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                          />
                          {errors[`item_${index}_unitPrice`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`item_${index}_unitPrice`]}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          Rs {item.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {errors.items && (
                <p className="mt-4 text-sm text-red-600">{errors.items}</p>
              )}
            </div>
          </div>

          {/* Invoice Totals & Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Invoice Summary</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Totals */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Totals</h3>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="font-medium text-gray-900">Rs {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Tax Rate:</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.taxRate}
                          onChange={(e) => setFormData(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                        />
                      </div>
                      {formData.taxRate > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-700">Tax ({formData.taxRate}%):</span>
                          <span className="font-medium text-gray-900">Rs {taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold text-gray-900">Total:</span>
                          <span className="text-lg font-bold text-indigo-600">Rs {total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Payment terms, special instructions, etc."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/admin/invoices/${params.id}`)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                {submitting ? 'Updating...' : 'Update Invoice'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
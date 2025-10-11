'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  TruckIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  CubeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface InventoryTransfer {
  id: string
  itemId: string
  fromLocation: string
  toLocation: string
  quantity: number
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  completedBy?: string
  completedAt?: string
  notes?: string
}

interface InventoryItem {
  id: string
  name: string
  description: string
  category: string
  unit: string
}

interface Branch {
  id: string
  name: string
  buildingName: string
  isActive: boolean
}

export default function InventoryTransfers() {
  const { data: session } = useSession()
  const [transfers, setTransfers] = useState<InventoryTransfer[]>([])
  const [items, setItems] = useState<InventoryItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formData, setFormData] = useState({
    itemId: '',
    fromLocation: '',
    toLocation: '',
    quantity: 0,
    notes: ''
  })

  useEffect(() => {
    loadData()
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      const [transfersResponse, itemsResponse, branchesResponse] = await Promise.all([
        fetch('/api/inventory/transfers'),
        fetch('/api/inventory'),
        fetch('/api/branches')
      ])

      if (transfersResponse.ok) {
        const transfersData = await transfersResponse.json()
        setTransfers(transfersData)
      }

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json()
        setItems(itemsData)
      }

      if (branchesResponse.ok) {
        const branchesData = await branchesResponse.json()
        setBranches(branchesData.filter((branch: Branch) => branch.isActive))
      }
    } catch (error) {
      console.error('Error loading transfer data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/inventory/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadData()
        setShowModal(false)
        resetForm()
      } else {
        console.error('Failed to create transfer')
      }
    } catch (error) {
      console.error('Error creating transfer:', error)
    }
  }

  const handleStatusUpdate = async (transferId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/inventory/transfers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transferId,
          status: newStatus
        }),
      })

      if (response.ok) {
        await loadData()
      } else {
        console.error('Failed to update transfer status')
      }
    } catch (error) {
      console.error('Error updating transfer status:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      itemId: '',
      fromLocation: '',
      toLocation: '',
      quantity: 0,
      notes: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_transit': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />
      case 'in_transit': return <TruckIcon className="w-4 h-4" />
      case 'completed': return <CheckCircleIcon className="w-4 h-4" />
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />
      default: return <ExclamationTriangleIcon className="w-4 h-4" />
    }
  }

  const filteredTransfers = transfers.filter(transfer => {
    if (statusFilter === 'all') return true
    return transfer.status === statusFilter
  })

  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    return item ? item.name : 'Unknown Item'
  }

  const getLocationName = (locationId: string) => {
    if (locationId === 'store-room-1') return 'Store Room'
    const branch = branches.find(b => b.id === locationId)
    return branch ? branch.name : locationId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transfers...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory Transfers</h2>
            <p className="text-sm text-gray-500">Manage inventory transfers between locations</p>
          </div>
          <div className="flex space-x-3">
            <a
              href="/admin/inventory"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <CubeIcon className="w-5 h-5" />
              <span>Inventory</span>
            </a>
            <a
              href="/admin/inventory/reports"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <ChartBarIcon className="w-5 h-5" />
              <span>Reports</span>
            </a>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Transfer</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {transfers.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-900">
                  {transfers.filter(t => t.status === 'in_transit').length}
                </p>
              </div>
              <TruckIcon className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {transfers.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-900">
                  {transfers.filter(t => t.status === 'cancelled').length}
                </p>
              </div>
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Transfers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {filteredTransfers.length === 0 ? (
          <div className="text-center py-12">
            <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Transfers Found</h3>
            <p className="text-gray-500">Create your first inventory transfer to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransfers.map((transfer) => (
              <div key={transfer.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getItemName(transfer.itemId)}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                        {getStatusIcon(transfer.status)}
                        <span className="ml-1 capitalize">{transfer.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">From:</span>
                        <p className="font-medium">{getLocationName(transfer.fromLocation)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">To:</span>
                        <p className="font-medium">{getLocationName(transfer.toLocation)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Quantity:</span>
                        <p className="font-medium">{transfer.quantity}</p>
                      </div>
                    </div>
                    {transfer.notes && (
                      <div className="mt-2">
                        <span className="text-gray-500 text-sm">Notes:</span>
                        <p className="text-sm text-gray-700">{transfer.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {transfer.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(transfer.id, 'in_transit')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(transfer.id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {transfer.status === 'in_transit' && (
                      <button
                        onClick={() => handleStatusUpdate(transfer.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Requested by: {transfer.requestedBy}</span>
                    <span>Requested: {new Date(transfer.requestedAt).toLocaleDateString()}</span>
                  </div>
                  {transfer.approvedBy && (
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Approved by: {transfer.approvedBy}</span>
                      <span>Approved: {new Date(transfer.approvedAt!).toLocaleDateString()}</span>
                    </div>
                  )}
                  {transfer.completedBy && (
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Completed by: {transfer.completedBy}</span>
                      <span>Completed: {new Date(transfer.completedAt!).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Transfer Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">New Inventory Transfer</h3>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item *
                  </label>
                  <select
                    required
                    value={formData.itemId}
                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Location *
                    </label>
                    <select
                      required
                      value={formData.fromLocation}
                      onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select source location</option>
                      <option value="store-room-1">Store Room</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Location *
                    </label>
                    <select
                      required
                      value={formData.toLocation}
                      onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select destination location</option>
                      <option value="store-room-1">Store Room</option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add any notes about this transfer"
                  />
                </div>
              </form>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CubeIcon,
  HomeIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Branch {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Memoized Branch Card Component
const BranchCard = memo(({ 
  branch, 
  onEdit, 
  onDelete 
}: { 
  branch: Branch
  onEdit: (branch: Branch) => void
  onDelete: (id: string) => void
}) => {
  const [inventoryData, setInventoryData] = useState<any>(null)
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingInventory(true)
      try {
        console.log('Fetching inventory for branch:', branch.id)
        const response = await fetch(`/api/branches/${branch.id}/inventory`)
        console.log('Inventory response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Inventory data received:', data)
          setInventoryData(data)
        } else {
          console.error('Failed to fetch inventory data')
        }
      } catch (error) {
        console.error('Error fetching inventory:', error)
      } finally {
        setLoadingInventory(false)
      }
    }

    fetchInventory()
  }, [branch.id])

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl ${branch.isActive ? 'bg-gradient-to-br from-blue-100 to-blue-200' : 'bg-gradient-to-br from-red-100 to-red-200'}`}>
              <BuildingOfficeIcon className={`w-7 h-7 ${branch.isActive ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h3>
              <div className="flex items-center space-x-2">
                {branch.isActive ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${branch.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2 opacity-100 transition-opacity duration-200">
            <button
              onClick={() => window.location.href = `/admin/branches/${branch.id}`}
              className="p-3 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
              title="View Details"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onEdit(branch)}
              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              title="Edit Branch"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => onDelete(branch.id)}
              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              title="Delete Branch"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MapPinIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{branch.address}</p>
              <p className="text-sm text-gray-500">{branch.city}, {branch.state} {branch.zipCode}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PhoneIcon className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">{branch.phone}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <EnvelopeIcon className="w-5 h-5 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">{branch.email}</p>
          </div>
        </div>

        {/* Inventory and Rooms Overview */}
        {inventoryData && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              {/* Inventory Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CubeIcon className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Inventory</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Items:</span>
                    <span className="font-medium">{inventoryData.inventory.totalItems}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Quantity:</span>
                    <span className="font-medium">{inventoryData.inventory.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-medium">Rs {inventoryData.inventory.totalValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Rooms Summary */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <HomeIcon className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Rooms</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Rooms:</span>
                    <span className="font-medium">{inventoryData.rooms.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active:</span>
                    <span className="font-medium">{inventoryData.rooms.active}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bookable:</span>
                    <span className="font-medium">{inventoryData.rooms.bookable}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory Categories */}
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-gray-700 mb-3">Inventory by Category</h5>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <div className="text-orange-600 font-bold text-lg">
                    {inventoryData.inventory.byCategory.fixture.length}
                  </div>
                  <div className="text-xs text-orange-700">Fixtures</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-blue-600 font-bold text-lg">
                    {inventoryData.inventory.byCategory.moveable.length}
                  </div>
                  <div className="text-xs text-blue-700">Moveable</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-purple-600 font-bold text-lg">
                    {inventoryData.inventory.byCategory.consumable.length}
                  </div>
                  <div className="text-xs text-purple-700">Consumable</div>
                </div>
              </div>
            </div>

            {/* Toggle Details Button */}
            <div className="mt-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700"
              >
                <EyeIcon className="w-4 h-4" />
                <span>{showDetails ? 'Hide' : 'Show'} Full Details</span>
              </button>
            </div>

            {/* Detailed Information */}
            {showDetails && inventoryData && (
              <div className="mt-6 space-y-6">
                {/* Detailed Inventory */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Detailed Inventory</h5>
                  <div className="space-y-3">
                    {inventoryData.inventory.byCategory.fixture.length > 0 && (
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h6 className="font-medium text-orange-800 mb-2">Fixtures ({inventoryData.inventory.byCategory.fixture.length})</h6>
                        <div className="space-y-2">
                          {inventoryData.inventory.byCategory.fixture.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-orange-700">{item.name}</span>
                              <span className="text-orange-600 font-medium">Qty: {item.quantity || 0}</span>
                            </div>
                          ))}
                          {inventoryData.inventory.byCategory.fixture.length > 3 && (
                            <div className="text-xs text-orange-600">
                              +{inventoryData.inventory.byCategory.fixture.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {inventoryData.inventory.byCategory.moveable.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h6 className="font-medium text-blue-800 mb-2">Moveable Items ({inventoryData.inventory.byCategory.moveable.length})</h6>
                        <div className="space-y-2">
                          {inventoryData.inventory.byCategory.moveable.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-blue-700">{item.name}</span>
                              <span className="text-blue-600 font-medium">Qty: {item.quantity || 0}</span>
                            </div>
                          ))}
                          {inventoryData.inventory.byCategory.moveable.length > 3 && (
                            <div className="text-xs text-blue-600">
                              +{inventoryData.inventory.byCategory.moveable.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {inventoryData.inventory.byCategory.consumable.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h6 className="font-medium text-purple-800 mb-2">Consumables ({inventoryData.inventory.byCategory.consumable.length})</h6>
                        <div className="space-y-2">
                          {inventoryData.inventory.byCategory.consumable.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-purple-700">{item.name}</span>
                              <span className="text-purple-600 font-medium">Qty: {item.quantity || 0}</span>
                            </div>
                          ))}
                          {inventoryData.inventory.byCategory.consumable.length > 3 && (
                            <div className="text-xs text-purple-600">
                              +{inventoryData.inventory.byCategory.consumable.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detailed Rooms */}
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Room Details</h5>
                  <div className="space-y-3">
                    {inventoryData.rooms.list.map((room: any) => (
                      <div key={room.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-medium text-gray-900">{room.name}</h6>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              room.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {room.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {room.isBookable && (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                Bookable
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Type:</span> {room.type}
                          </div>
                          <div>
                            <span className="font-medium">Capacity:</span> {room.capacity}
                          </div>
                          <div>
                            <span className="font-medium">Floor:</span> {room.floor}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {room.location}
                          </div>
                        </div>
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-700">Amenities:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {room.amenities.map((amenity: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* View Details Button */}
            <div className="mt-4">
              <button
                onClick={() => window.location.href = `/admin/branches/${branch.id}`}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-sm font-medium text-blue-700"
              >
                <EyeIcon className="w-4 h-4" />
                <span>View Full Details & Inventory</span>
              </button>
            </div>
          </div>
        )}

        {loadingInventory && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span className="text-sm">Loading inventory...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

BranchCard.displayName = 'BranchCard'

export default function AdminBranches() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/branches')
        if (response.ok) {
          const data = await response.json()
          setBranches(Array.isArray(data) ? data : [])
        } else {
          setBranches([])
        }
      } catch (error) {
        console.error('Error fetching branches:', error)
        setBranches([])
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchBranches()
    }
  }, [session])

  useEffect(() => {
    if (searchParams.get('success') === 'created') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    } else if (searchParams.get('success') === 'updated') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  const handleEdit = useCallback((branch: Branch) => {
    // Navigate to edit page
    window.location.href = `/admin/branches/edit/${branch.id}`
  }, [])

  const handleViewDetails = useCallback((branch: Branch) => {
    // Navigate to branch details page
    window.location.href = `/admin/branches/${branch.id}`
  }, [])

  const handleDelete = useCallback(async (branchId: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return
    
    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const branchesResponse = await fetch('/api/branches')
        if (branchesResponse.ok) {
          const data = await branchesResponse.json()
          setBranches(Array.isArray(data) ? data : [])
        }
        alert('Branch deleted successfully!')
      } else {
        alert('Failed to delete branch')
      }
    } catch (error) {
      console.error('Error deleting branch:', error)
      alert('Failed to delete branch')
    }
  }, [])

  const filteredBranches = useMemo(() => {
    return branches.filter(branch => {
      const matchesSearch = searchTerm === '' || 
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && branch.isActive) ||
        (statusFilter === 'INACTIVE' && !branch.isActive)
      
      return matchesSearch && matchesStatus
    })
  }, [branches, searchTerm, statusFilter])

  const stats = useMemo(() => ({
    total: branches.length,
    active: branches.filter(b => b.isActive).length,
    inactive: branches.filter(b => !b.isActive).length
  }), [branches])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading branches...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-in slide-in-from-right duration-300">
          <CheckCircleIcon className="w-5 h-5" />
          <span>
            {searchParams.get('success') === 'created' 
              ? 'Branch created successfully!' 
              : 'Branch updated successfully!'}
          </span>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-2 text-white hover:text-green-200"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="space-y-8 p-6">
        {/* Premium Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center lg:text-left mb-8 lg:mb-0">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  Branch Management
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Manage your coworking spaces and inventory
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <span className="text-white font-semibold">{stats.total} Total Branches</span>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <span className="text-white font-semibold">{stats.active} Active</span>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 backdrop-blur-sm">
                    <span className="text-white font-semibold">{stats.inactive} Inactive</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/admin/branches/create"
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Branch
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('ALL')
                }}
                className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium group"
              >
                <FunnelIcon className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-200" />
                Clear Filters
              </button>

              <Link
                href="/admin/branches/create"
                className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Branch
              </Link>
            </div>
          </div>
        </div>

        {/* Branches Grid */}
        {filteredBranches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BuildingOfficeIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm || statusFilter !== 'ALL'
                ? 'No branches found'
                : 'No branches yet'}
            </h3>
            <p className="text-gray-500 mb-8 text-lg">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first branch to manage your coworking spaces.'}
            </p>
            {!searchTerm && statusFilter === 'ALL' && (
              <Link
                href="/admin/branches/create"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Branch
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

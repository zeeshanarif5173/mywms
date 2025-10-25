'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeIcon,
  HomeIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
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

interface InventoryItem {
  id: string
  name: string
  description: string
  category: 'fixture' | 'moveable' | 'consumable'
  quantity: number
  currentPrice: number
  branchId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Room {
  id: string
  name: string
  type: string
  capacity: number
  branchId: string
  isActive: boolean
  isBookable: boolean
  createdAt: string
  updatedAt: string
}

interface BranchData {
  branch: Branch
  inventory: {
    totalItems: number
    totalQuantity: number
    totalValue: number
    byCategory: {
      fixture: InventoryItem[]
      moveable: InventoryItem[]
      consumable: InventoryItem[]
    }
    items: InventoryItem[]
  }
  rooms: {
    total: number
    active: number
    bookable: number
    list: Room[]
  }
}

export default function BranchDetail({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [branchData, setBranchData] = useState<BranchData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [activeTab, setActiveTab] = useState<'inventory' | 'rooms'>('inventory')

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/branches/${params.id}/inventory`)
        if (response.ok) {
          const data = await response.json()
          setBranchData(data)
        } else {
          router.push('/admin/branches')
        }
      } catch (error) {
        console.error('Error fetching branch data:', error)
        router.push('/admin/branches')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN' && params.id) {
      fetchBranchData()
    }
  }, [session, params.id, router])

  const handleEdit = () => {
    router.push(`/admin/branches/edit/${params.id}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this branch?')) return
    
    try {
      const response = await fetch(`/api/branches/${params.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/admin/branches')
      } else {
        alert('Failed to delete branch')
      }
    } catch (error) {
      console.error('Error deleting branch:', error)
      alert('Failed to delete branch')
    }
  }

  const filteredInventory = branchData?.inventory.items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter
    
    return matchesSearch && matchesCategory
  }) || []

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading branch details...</p>
        </div>
      </div>
    )
  }

  if (!branchData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Branch Not Found</h2>
          <p className="text-gray-600">The branch you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/branches')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Branches
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row items-start justify-between">
              <div className="mb-6 lg:mb-0">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-blue-100 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Back to Branches
                </button>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      {branchData.branch.name}
                    </h1>
                    <div className="flex items-center space-x-2">
                      {branchData.branch.isActive ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-300" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-red-300" />
                      )}
                      <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        branchData.branch.isActive 
                          ? 'bg-green-500 bg-opacity-20 text-green-100' 
                          : 'bg-red-500 bg-opacity-20 text-red-100'
                      }`}>
                        {branchData.branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                  <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="w-6 h-6" />
                      <div>
                        <p className="text-sm text-blue-100">Address</p>
                        <p className="font-semibold">{branchData.branch.address}</p>
                        <p className="text-sm text-blue-100">{branchData.branch.city}, {branchData.branch.state} {branchData.branch.zipCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-6 h-6" />
                      <div>
                        <p className="text-sm text-blue-100">Phone</p>
                        <p className="font-semibold">{branchData.branch.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="w-6 h-6" />
                      <div>
                        <p className="text-sm text-blue-100">Email</p>
                        <p className="font-semibold">{branchData.branch.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleEdit}
                  className="flex items-center px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all duration-200 font-medium backdrop-blur-sm"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Branch
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-6 py-3 bg-red-500 bg-opacity-20 text-red-100 rounded-xl hover:bg-opacity-30 transition-all duration-200 font-medium backdrop-blur-sm"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Delete Branch
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Inventory Stats */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CubeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{branchData.inventory.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{branchData.inventory.totalQuantity}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">Rs {branchData.inventory.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <HomeIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{branchData.rooms.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'inventory'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Inventory ({branchData.inventory.totalItems})
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'rooms'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Rooms ({branchData.rooms.total})
            </button>
          </div>

          {activeTab === 'inventory' && (
            <>
              {/* Search and Filter */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search inventory items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="ALL">All Categories</option>
                  <option value="fixture">Fixtures</option>
                  <option value="moveable">Moveable</option>
                  <option value="consumable">Consumable</option>
                </select>
              </div>

              {/* Inventory Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.category === 'fixture' 
                              ? 'bg-orange-100 text-orange-700'
                              : item.category === 'moveable'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold">{item.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold">Rs {item.currentPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Value:</span>
                        <span className="font-semibold text-blue-600">Rs {(item.currentPrice * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredInventory.length === 0 && (
                <div className="text-center py-12">
                  <CubeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventory items found</h3>
                  <p className="text-gray-600">
                    {searchTerm || categoryFilter !== 'ALL'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'No inventory items have been added to this branch yet.'}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === 'rooms' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branchData.rooms.list.map((room) => (
                <div key={room.id} className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{room.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">Type: {room.type}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          room.isActive 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {room.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {room.isBookable && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            Bookable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-semibold">{room.capacity} people</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


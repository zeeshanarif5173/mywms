'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  BuildingOfficeIcon,
  ArrowLeftIcon,
  CubeIcon,
  HomeIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'

interface Branch {
  id: string
  name: string
  address: string
  city: string
  state: string
}

interface InventoryItem {
  id: string
  name: string
  description: string
  category: 'fixture' | 'moveable' | 'consumable'
  subcategory: string
  brand?: string
  model?: string
  sku?: string
  unit: string
  quantity?: number
  purchasePrice?: number
  currentPrice?: number
  supplier?: string
  minimumStock?: number
  maximumStock?: number
  isActive: boolean
}

interface Room {
  id: string
  roomNumber: string
  name: string
  type: string
  capacity: number
  location: string
  floor: string
  isActive: boolean
  isBookable: boolean
}

interface BranchInventoryData {
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

export default function BranchInventory({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BranchInventoryData | null>(null)
  const [activeTab, setActiveTab] = useState<'inventory' | 'rooms'>('inventory')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/branches/${params.id}/inventory`)
        
        if (response.ok) {
          const inventoryData = await response.json()
          setData(inventoryData)
        } else {
          console.error('Failed to fetch inventory data')
          router.push('/admin/branches')
        }
      } catch (error) {
        console.error('Error fetching inventory data:', error)
        router.push('/admin/branches')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN' && params.id) {
      fetchData()
    }
  }, [session, params.id, router])

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
          <p className="text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Found</h2>
          <p className="text-gray-600">Unable to load inventory data for this branch.</p>
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Branches
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{data.branch.name} - Inventory & Rooms</h1>
              <p className="text-gray-600 text-lg">{data.branch.address}, {data.branch.city}, {data.branch.state}</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CubeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.inventory.totalItems}</p>
                <p className="text-sm text-gray-600">Total Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.inventory.totalQuantity}</p>
                <p className="text-sm text-gray-600">Total Quantity</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Rs {data.inventory.totalValue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <HomeIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.rooms.total}</p>
                <p className="text-sm text-gray-600">Total Rooms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CubeIcon className="w-5 h-5" />
                  <span>Inventory ({data.inventory.totalItems})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'rooms'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HomeIcon className="w-5 h-5" />
                  <span>Rooms ({data.rooms.total})</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'inventory' ? (
              <div className="space-y-8">
                {/* Inventory Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Category</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Fixtures */}
                    <div className="bg-orange-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <CubeIcon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Fixtures</h4>
                          <p className="text-sm text-gray-600">{data.inventory.byCategory.fixture.length} items</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {data.inventory.byCategory.fixture.map((item) => (
                          <div key={item.id} className="bg-white rounded-lg p-3 border border-orange-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600">{item.subcategory}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{item.quantity || 0} {item.unit}</p>
                                <p className="text-xs text-gray-500">Rs {item.currentPrice?.toLocaleString() || 0}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Moveable */}
                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <CubeIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Moveable</h4>
                          <p className="text-sm text-gray-600">{data.inventory.byCategory.moveable.length} items</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {data.inventory.byCategory.moveable.map((item) => (
                          <div key={item.id} className="bg-white rounded-lg p-3 border border-blue-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600">{item.subcategory}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{item.quantity || 0} {item.unit}</p>
                                <p className="text-xs text-gray-500">Rs {item.currentPrice?.toLocaleString() || 0}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Consumable */}
                    <div className="bg-purple-50 rounded-xl p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CubeIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Consumable</h4>
                          <p className="text-sm text-gray-600">{data.inventory.byCategory.consumable.length} items</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {data.inventory.byCategory.consumable.map((item) => (
                          <div key={item.id} className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                <p className="text-sm text-gray-600">{item.subcategory}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{item.quantity || 0} {item.unit}</p>
                                <p className="text-xs text-gray-500">Rs {item.currentPrice?.toLocaleString() || 0}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Rooms Overview</h3>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <span>Total: {data.rooms.total}</span>
                    <span>Active: {data.rooms.active}</span>
                    <span>Bookable: {data.rooms.bookable}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.rooms.list.map((room) => (
                    <div key={room.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{room.name}</h4>
                          <p className="text-sm text-gray-600">Room #{room.roomNumber}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {room.isActive ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircleIcon className="w-5 h-5 text-red-500" />
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            room.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {room.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium capitalize">{room.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{room.capacity} people</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{room.location} - {room.floor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bookable:</span>
                          <span className={`font-medium ${room.isBookable ? 'text-green-600' : 'text-gray-500'}`}>
                            {room.isBookable ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

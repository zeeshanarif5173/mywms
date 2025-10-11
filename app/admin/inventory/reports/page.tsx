'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CubeIcon,
  BuildingOfficeIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PrinterIcon,
  TruckIcon
} from '@heroicons/react/24/outline'

interface InventoryReport {
  itemId: string
  itemName: string
  category: string
  totalStock: number
  storeRoomStock: number
  branchStock: number
  reservedStock: number
  availableStock: number
  lastMovement: string
  lowStockAlert: boolean
}

interface InventoryStats {
  totalItems: number
  activeItems: number
  totalStockValue: number
  lowStockCount: number
  totalCategories: number
  categoryStats: {
    fixture: number
    moveable: number
    consumable: number
  }
  categoryValue: {
    fixture: number
    moveable: number
    consumable: number
  }
  lowStockItems: Array<{
    id: string
    name: string
    category: string
    currentStock: number
    minimumStock: number
  }>
}

export default function InventoryReports() {
  const { data: session } = useSession()
  const [report, setReport] = useState<InventoryReport[]>([])
  const [stats, setStats] = useState<InventoryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    loadData()
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      const [reportResponse, statsResponse] = await Promise.all([
        fetch('/api/inventory?report=true'),
        fetch('/api/inventory/stats')
      ])

      if (reportResponse.ok) {
        const reportData = await reportResponse.json()
        // Ensure reportData is an array
        if (Array.isArray(reportData)) {
          setReport(reportData)
        } else {
          console.error('Expected array but got:', typeof reportData, reportData)
          setReport([])
        }
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error loading inventory reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fixture': return 'bg-blue-100 text-blue-800'
      case 'moveable': return 'bg-green-100 text-green-800'
      case 'consumable': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'fixture': return 'Fixture'
      case 'moveable': return 'Moveable'
      case 'consumable': return 'Consumable'
      default: return category
    }
  }

  const filteredAndSortedReport = (Array.isArray(report) ? report : [])
    .filter(item => categoryFilter === 'all' || item.category === categoryFilter)
    .sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.itemName.toLowerCase()
          bValue = b.itemName.toLowerCase()
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        case 'totalStock':
          aValue = a.totalStock
          bValue = b.totalStock
          break
        case 'availableStock':
          aValue = a.availableStock
          bValue = b.availableStock
          break
        case 'lastMovement':
          aValue = new Date(a.lastMovement).getTime()
          bValue = new Date(b.lastMovement).getTime()
          break
        default:
          aValue = a.itemName.toLowerCase()
          bValue = b.itemName.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">Inventory Reports</h2>
            <p className="text-sm text-gray-500">Comprehensive inventory analysis and reporting</p>
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
              href="/admin/inventory/transfers"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <TruckIcon className="w-5 h-5" />
              <span>Transfers</span>
            </a>
            <button
              onClick={handlePrint}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <PrinterIcon className="w-5 h-5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Summary Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Items</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalItems}</p>
                </div>
                <CubeIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Items</p>
                  <p className="text-2xl font-bold text-green-900">{stats.activeItems}</p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Value</p>
                  <p className="text-2xl font-bold text-purple-900">Rs {stats.totalStockValue.toLocaleString()}</p>
                </div>
                <CurrencyDollarIcon className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Low Stock Items</p>
                  <p className="text-2xl font-bold text-red-900">{stats.lowStockCount}</p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Fixture Items</p>
                  <p className="text-xl font-bold text-blue-900">{stats.categoryStats.fixture}</p>
                  <p className="text-xs text-blue-600">Rs {stats.categoryValue.fixture.toLocaleString()}</p>
                </div>
                <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Moveable Items</p>
                  <p className="text-xl font-bold text-green-900">{stats.categoryStats.moveable}</p>
                  <p className="text-xs text-green-600">Rs {stats.categoryValue.moveable.toLocaleString()}</p>
                </div>
                <CubeIcon className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Consumable Items</p>
                  <p className="text-xl font-bold text-orange-900">{stats.categoryStats.consumable}</p>
                  <p className="text-xs text-orange-600">Rs {stats.categoryValue.consumable.toLocaleString()}</p>
                </div>
                <ChartBarIcon className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        {stats && stats.lowStockItems.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4 border border-red-200 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">Low Stock Alerts</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.lowStockItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-3 border border-red-200">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Current: {item.currentStock} | Min: {item.minimumStock}
                  </p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                    {getCategoryName(item.category)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="fixture">Fixture</option>
              <option value="moveable">Moveable</option>
              <option value="consumable">Consumable</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="totalStock">Sort by Total Stock</option>
              <option value="availableStock">Sort by Available Stock</option>
              <option value="lastMovement">Sort by Last Movement</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              {sortOrder === 'asc' ? (
                <ArrowUpIcon className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Inventory Report</h3>
        
        {filteredAndSortedReport.length === 0 ? (
          <div className="text-center py-12">
            <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
            <p className="text-gray-500">No inventory items match the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Store Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Movement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedReport.map((item) => (
                  <tr key={item.itemId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.itemName}</div>
                        <div className="text-sm text-gray-500">ID: {item.itemId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                        {getCategoryName(item.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.totalStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.storeRoomStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.branchStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.availableStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.reservedStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.lastMovement).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.lowStockAlert ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

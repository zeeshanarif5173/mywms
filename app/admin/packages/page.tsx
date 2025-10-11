'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  TagIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface Package {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  price: number
  currency: string
  duration: number // in days
  features: string[]
  limitations: string[]
  isActive: boolean
  branchIds: string[]
  createdAt: string
  updatedAt: string
}

export default function AdminPackages() {
  const { data: session } = useSession()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [allFeatures, setAllFeatures] = useState<string[]>([])
  const [allLimitations, setAllLimitations] = useState<string[]>([])
  const [showFeatureDropdown, setShowFeatureDropdown] = useState(false)
  const [showLimitationDropdown, setShowLimitationDropdown] = useState(false)
  const [newFeature, setNewFeature] = useState('')
  const [newLimitation, setNewLimitation] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    price: 0,
    currency: 'PKR',
    duration: 30,
    features: [] as string[],
    limitations: [] as string[],
    isActive: true,
    branchIds: [] as string[]
  })

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/packages')
        if (response.ok) {
          const data = await response.json()
          setPackages(data)
          
          // Extract all unique features and limitations from all packages
          const features = new Set<string>()
          const limitations = new Set<string>()
          
          data.forEach((pkg: Package) => {
            pkg.features.forEach(feature => features.add(feature))
            pkg.limitations.forEach(limitation => limitations.add(limitation))
          })
          
          setAllFeatures(Array.from(features).sort())
          setAllLimitations(Array.from(limitations).sort())
        }
      } catch (error) {
        console.error('Error fetching packages:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchPackages()
    }
  }, [session])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setShowFeatureDropdown(false)
        setShowLimitationDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = searchTerm === '' || 
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'ALL' || pkg.type === typeFilter
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && pkg.isActive) ||
      (statusFilter === 'INACTIVE' && !pkg.isActive)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingPackage ? `/api/packages/${editingPackage.id}` : '/api/packages'
      const method = editingPackage ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Refresh packages list
        const packagesResponse = await fetch('/api/packages')
        if (packagesResponse.ok) {
          const data = await packagesResponse.json()
          setPackages(data)
        }
        
        setShowModal(false)
        setEditingPackage(null)
        resetForm()
      } else {
        console.error('Failed to save package')
      }
    } catch (error) {
      console.error('Error saving package:', error)
    }
  }

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg)
    setFormData({
      name: pkg.name,
      description: pkg.description,
      type: pkg.type,
      price: pkg.price,
      currency: pkg.currency,
      duration: pkg.duration,
      features: pkg.features,
      limitations: pkg.limitations,
      isActive: pkg.isActive,
      branchIds: pkg.branchIds
    })
    setShowModal(true)
  }

  const handleDelete = async (pkg: Package) => {
    if (!confirm(`Are you sure you want to delete the package "${pkg.name}"?`)) return
    
    try {
      const response = await fetch(`/api/packages/${pkg.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPackages(packages.filter(p => p.id !== pkg.id))
      } else {
        console.error('Failed to delete package')
      }
    } catch (error) {
      console.error('Error deleting package:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'monthly',
      price: 0,
      currency: 'PKR',
      duration: 30,
      features: [],
      limitations: [],
      isActive: true,
      branchIds: []
    })
    setShowFeatureDropdown(false)
    setShowLimitationDropdown(false)
    setNewFeature('')
    setNewLimitation('')
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      case 'yearly': return 'Yearly'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800'
      case 'weekly': return 'bg-green-100 text-green-800'
      case 'monthly': return 'bg-purple-100 text-purple-800'
      case 'yearly': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number, currency: string = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const addFeature = (feature: string) => {
    if (feature && !formData.features.includes(feature)) {
      setFormData({ ...formData, features: [...formData.features, feature] })
    }
    setShowFeatureDropdown(false)
    setNewFeature('')
  }

  const addNewFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] })
    }
    setNewFeature('')
    setShowFeatureDropdown(false)
  }

  const removeFeature = (index: number) => {
    setFormData({ 
      ...formData, 
      features: formData.features.filter((_, i) => i !== index) 
    })
  }

  const addLimitation = (limitation: string) => {
    if (limitation && !formData.limitations.includes(limitation)) {
      setFormData({ ...formData, limitations: [...formData.limitations, limitation] })
    }
    setShowLimitationDropdown(false)
    setNewLimitation('')
  }

  const addNewLimitation = () => {
    if (newLimitation.trim() && !formData.limitations.includes(newLimitation.trim())) {
      setFormData({ ...formData, limitations: [...formData.limitations, newLimitation.trim()] })
    }
    setNewLimitation('')
    setShowLimitationDropdown(false)
  }

  const removeLimitation = (index: number) => {
    setFormData({ 
      ...formData, 
      limitations: formData.limitations.filter((_, i) => i !== index) 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Package Management</h2>
          <p className="text-sm text-gray-500">Manage coworking packages and pricing</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Types</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => {
              setEditingPackage(null)
              resetForm()
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Package</span>
          </button>
          <a
            href="/admin/branches"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Branches
          </a>
        </div>

        {filteredPackages.length === 0 ? (
          <div className="text-center py-12">
            <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Packages Found</h3>
            <p className="text-gray-500">Create your first package to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <TagIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(pkg.type)}`}>
                          {getTypeLabel(pkg.type)}
                        </span>
                        {pkg.isActive ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${pkg.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {pkg.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit Package"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete Package"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(pkg.price, pkg.currency)}</p>
                      <p className="text-sm text-gray-500">per {getTypeLabel(pkg.type).toLowerCase()}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <p className="text-sm text-gray-900">Duration: {pkg.duration} days</p>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">{pkg.description}</p>
                    
                    {pkg.features.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-500 mb-1">Features:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {pkg.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircleIcon className="w-3 h-3 text-green-500 mr-1" />
                              {feature}
                            </li>
                          ))}
                          {pkg.features.length > 3 && (
                            <li className="text-gray-400">+{pkg.features.length - 3} more...</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Package Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">
                    {editingPackage ? 'Edit Package' : 'Add New Package'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingPackage(null)
                      resetForm()
                    }}
                    className="text-white hover:text-blue-200 transition-colors"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Package Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Premium Office"
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                        Package Type *
                      </label>
                      <select
                        id="type"
                        required
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe what's included in this package..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                        Price (PKR) *
                      </label>
                      <input
                        type="number"
                        id="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500 mt-1">Amount in Pakistani Rupees (PKR)</p>
                    </div>

                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                        Duration (Days) *
                      </label>
                      <input
                        type="number"
                        id="duration"
                        required
                        min="1"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="30"
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Features
                    </label>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span className="flex-1 text-sm">{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Feature Dropdown */}
                      <div className="relative dropdown-container">
                        <button
                          type="button"
                          onClick={() => setShowFeatureDropdown(!showFeatureDropdown)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          + Add Feature
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {showFeatureDropdown && (
                          <div className="absolute z-10 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {/* Existing Features */}
                            {allFeatures.length > 0 && (
                              <div className="p-2 border-b border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-1">Existing Features:</p>
                                {allFeatures
                                  .filter(feature => !formData.features.includes(feature))
                                  .map((feature) => (
                                    <button
                                      key={feature}
                                      type="button"
                                      onClick={() => addFeature(feature)}
                                      className="w-full text-left px-2 py-1 text-sm hover:bg-blue-50 rounded flex items-center"
                                    >
                                      <CheckCircleIcon className="w-3 h-3 text-green-500 mr-2" />
                                      {feature}
                                    </button>
                                  ))}
                              </div>
                            )}
                            
                            {/* Add New Feature */}
                            <div className="p-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Add New Feature:</p>
                              <div className="flex space-x-1">
                                <input
                                  type="text"
                                  value={newFeature}
                                  onChange={(e) => setNewFeature(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && addNewFeature()}
                                  placeholder="Enter new feature..."
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={addNewFeature}
                                  className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Limitations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limitations
                    </label>
                    <div className="space-y-2">
                      {formData.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <XCircleIcon className="w-4 h-4 text-red-500" />
                          <span className="flex-1 text-sm">{limitation}</span>
                          <button
                            type="button"
                            onClick={() => removeLimitation(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {/* Limitation Dropdown */}
                      <div className="relative dropdown-container">
                        <button
                          type="button"
                          onClick={() => setShowLimitationDropdown(!showLimitationDropdown)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                        >
                          + Add Limitation
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {showLimitationDropdown && (
                          <div className="absolute z-10 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {/* Existing Limitations */}
                            {allLimitations.length > 0 && (
                              <div className="p-2 border-b border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-1">Existing Limitations:</p>
                                {allLimitations
                                  .filter(limitation => !formData.limitations.includes(limitation))
                                  .map((limitation) => (
                                    <button
                                      key={limitation}
                                      type="button"
                                      onClick={() => addLimitation(limitation)}
                                      className="w-full text-left px-2 py-1 text-sm hover:bg-red-50 rounded flex items-center"
                                    >
                                      <XCircleIcon className="w-3 h-3 text-red-500 mr-2" />
                                      {limitation}
                                    </button>
                                  ))}
                              </div>
                            )}
                            
                            {/* Add New Limitation */}
                            <div className="p-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">Add New Limitation:</p>
                              <div className="flex space-x-1">
                                <input
                                  type="text"
                                  value={newLimitation}
                                  onChange={(e) => setNewLimitation(e.target.value)}
                                  onKeyPress={(e) => e.key === 'Enter' && addNewLimitation()}
                                  placeholder="Enter new limitation..."
                                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                                />
                                <button
                                  type="button"
                                  onClick={addNewLimitation}
                                  className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                      Active Package
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setEditingPackage(null)
                        resetForm()
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingPackage ? 'Update Package' : 'Create Package'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
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
  XMarkIcon,
  TagIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  ClockIcon,
  UsersIcon,
  ChartBarIcon
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

export default function AdminBranches() {
  const { data: session } = useSession()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    isActive: true
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.name.trim()) errors.name = 'Branch name is required'
    if (!formData.address.trim()) errors.address = 'Address is required'
    if (!formData.city.trim()) errors.city = 'City is required'
    if (!formData.state.trim()) errors.state = 'State is required'
    if (!formData.zipCode.trim()) errors.zipCode = 'ZIP code is required'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const url = editingBranch ? `/api/branches/${editingBranch.id}` : '/api/branches'
      const method = editingBranch ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Refresh branches list
        const branchesResponse = await fetch('/api/branches')
        if (branchesResponse.ok) {
          const data = await branchesResponse.json()
          setBranches(Array.isArray(data) ? data : [])
        }
        
        setShowForm(false)
        setEditingBranch(null)
        resetForm()
        alert(editingBranch ? 'Branch updated successfully!' : 'Branch created successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to save branch: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving branch:', error)
      alert('Failed to save branch')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zipCode: branch.zipCode,
      phone: branch.phone,
      email: branch.email,
      isActive: branch.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (branchId: string) => {
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
  }

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      isActive: true
    })
    setFormErrors({})
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = searchTerm === '' || 
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && branch.isActive) ||
      (statusFilter === 'INACTIVE' && !branch.isActive)
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: branches.length,
    active: branches.filter(b => b.isActive).length,
    inactive: branches.filter(b => !b.isActive).length
  }

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
      <div className="space-y-8 p-6">
        {/* Premium Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="text-white mb-6 lg:mb-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Branch Management</h1>
                    <p className="text-blue-100 text-lg mt-1">Manage your coworking space branches</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{stats.total}</div>
                  <div className="text-blue-100 text-sm font-medium">Total Branches</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{stats.active}</div>
                  <div className="text-blue-100 text-sm font-medium">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{stats.inactive}</div>
                  <div className="text-blue-100 text-sm font-medium">Inactive</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>


        {/* Premium Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search branches by name, city, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none px-6 py-4 pr-10 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 bg-white text-gray-700 font-medium"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive Only</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => {
                  setStatusFilter('ALL')
                  setSearchTerm('')
                }}
                className="flex items-center px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium group"
              >
                <FunnelIcon className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-200" />
                Clear Filters
              </button>

              <button
                onClick={() => {
                  setEditingBranch(null)
                  resetForm()
                  setShowForm(true)
                }}
                className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Branch
              </button>
            </div>
          </div>
        </div>

        {/* Branches Grid */}
        {filteredBranches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <BuildingOfficeIcon className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Branches Found</h3>
              <p className="text-gray-500 mb-8 text-lg">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first branch to manage your coworking spaces.'}
              </p>
              {!searchTerm && statusFilter === 'ALL' && (
                <button
                  onClick={() => {
                    setEditingBranch(null)
                    resetForm()
                    setShowForm(true)
                  }}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Branch
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredBranches.map((branch) => (
              <div key={branch.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
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
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                        title="Edit Branch"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Premium Single-Page Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
              {/* Form Header */}
              <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 px-10 py-8">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                      <BuildingOfficeIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                      </h2>
                      <p className="text-blue-100 mt-2 text-lg">
                        {editingBranch ? 'Update branch information' : 'Create a new branch for your coworking space'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setEditingBranch(null)
                      resetForm()
                    }}
                    className="text-white hover:text-blue-200 transition-all duration-200 p-3 hover:bg-white hover:bg-opacity-20 rounded-xl"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
              </div>

              {/* Form Content */}
              <div className="p-10 overflow-y-auto max-h-[calc(95vh-200px)]">
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* Basic Information Section */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-gray-100">
                    <div className="flex items-center mb-8">
                      <div className="p-3 bg-blue-100 rounded-xl mr-4">
                        <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
                        <p className="text-gray-600">Enter the basic details for your branch</p>
                      </div>
                    </div>
                  
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                          Branch Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                            formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="e.g., Downtown Branch"
                        />
                        {formErrors.name && (
                          <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.name}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="isActive" className="block text-sm font-semibold text-gray-700 mb-3">
                          Status
                        </label>
                        <select
                          id="isActive"
                          name="isActive"
                          value={formData.isActive.toString()}
                          onChange={handleInputChange}
                          className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-700 bg-white"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Location Information Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100">
                    <div className="flex items-center mb-8">
                      <div className="p-3 bg-green-100 rounded-xl mr-4">
                        <MapPinIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Location Information</h3>
                        <p className="text-gray-600">Enter the complete address details</p>
                      </div>
                    </div>
                  
                    <div className="space-y-8">
                      <div>
                        <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-3">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                            formErrors.address ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="123 Main Street, Suite 100"
                        />
                        {formErrors.address && (
                          <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-3">
                            City *
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                              formErrors.city ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            placeholder="Lahore"
                          />
                          {formErrors.city && (
                            <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.city}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-3">
                            State/Province *
                          </label>
                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                              formErrors.state ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            placeholder="Punjab"
                          />
                          {formErrors.state && (
                            <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.state}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-3">
                            ZIP/Postal Code *
                          </label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                              formErrors.zipCode ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            placeholder="54000"
                          />
                          {formErrors.zipCode && (
                            <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.zipCode}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                    <div className="flex items-center mb-8">
                      <div className="p-3 bg-purple-100 rounded-xl mr-4">
                        <PhoneIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
                        <p className="text-gray-600">Enter the contact details for this branch</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                            formErrors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="+92 42 1234567"
                        />
                        {formErrors.phone && (
                          <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-6 py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-200 text-gray-700 placeholder-gray-400 ${
                            formErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          placeholder="branch@company.com"
                        />
                        {formErrors.email && (
                          <p className="mt-2 text-sm text-red-600 font-medium">{formErrors.email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Form Footer */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-10 py-8 border-t border-gray-200">
                <div className="flex justify-end space-x-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingBranch(null)
                      resetForm()
                    }}
                    className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>{editingBranch ? 'Update Branch' : 'Create Branch'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
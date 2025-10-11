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
  TagIcon
} from '@heroicons/react/24/outline'

interface Branch {
  id: number
  name: string
  buildingName?: string
  description?: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  rooms?: any[]
  packages?: any[]
  roomCount?: number
  packageCount?: number
}

export default function AdminBranches() {
  const { data: session } = useSession()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
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

  const totalSteps = 4
  const stepTitles = ['Basic Information', 'Location Details', 'Contact Information', 'Review & Confirm']

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/branches')
        if (response.ok) {
          const data = await response.json()
          // Handle API response structure
          if (data && typeof data === 'object' && 'success' in data && data.success && Array.isArray(data.data)) {
            setBranches(data.data)
          } else if (Array.isArray(data)) {
            setBranches(data)
          } else {
            setBranches([])
          }
        } else {
          setBranches([])
        }
      } catch (error) {
        console.error('Error fetching branches:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchBranches()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('Submitting branch form with data:', formData)
      console.log('Form data keys:', Object.keys(formData))
      console.log('Form data values:', Object.values(formData))
      
      const url = editingBranch ? `/api/branches/${editingBranch.id}` : '/api/branches'
      const method = editingBranch ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      console.log('Branch API response:', response.status, response.statusText)

      if (response.ok) {
        // Refresh branches list
        const branchesResponse = await fetch('/api/branches')
        if (branchesResponse.ok) {
          const data = await branchesResponse.json()
          // Handle API response structure
          if (data.success && Array.isArray(data.data)) {
            setBranches(data.data)
          } else if (Array.isArray(data)) {
            setBranches(data)
          } else {
            setBranches([])
          }
        }
        
        setShowModal(false)
        setEditingBranch(null)
        setCurrentStep(1)
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
      } else {
        const errorData = await response.json()
        console.error('Failed to save branch:', errorData)
        alert(`Failed to save branch: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error saving branch:', error)
    }
  }

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch)
    setCurrentStep(1)
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      zipCode: branch.zipCode,
      phone: branch.phone || '',
      email: branch.email || '',
      isActive: branch.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (branchId: number) => {
    if (!confirm('Are you sure you want to delete this branch?')) return
    
    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh branches list
        const branchesResponse = await fetch('/api/branches')
        if (branchesResponse.ok) {
          const data = await branchesResponse.json()
          // Handle API response structure
          if (data.success && Array.isArray(data.data)) {
            setBranches(data.data)
          } else if (Array.isArray(data)) {
            setBranches(data)
          } else {
            setBranches([])
          }
        }
      } else {
        console.error('Failed to delete branch')
      }
    } catch (error) {
      console.error('Error deleting branch:', error)
    }
  }

  const handleReactivate = async (branchId: string) => {
    if (!confirm('Are you sure you want to reactivate this branch?')) return
    
    try {
      const branch = branches.find(b => b.id.toString() === branchId)
      if (!branch) return

      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...branch,
          isActive: true
        }),
      })

      if (response.ok) {
        // Refresh branches list
        const branchesResponse = await fetch('/api/branches')
        if (branchesResponse.ok) {
          const data = await branchesResponse.json()
          // Handle API response structure
          if (data.success && Array.isArray(data.data)) {
            setBranches(data.data)
          } else if (Array.isArray(data)) {
            setBranches(data)
          } else {
            setBranches([])
          }
        }
      } else {
        console.error('Failed to reactivate branch')
      }
    } catch (error) {
      console.error('Error reactivating branch:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading branches...</p>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Branch Management</h2>
          <p className="text-sm text-gray-500">Manage coworking space branches</p>
        </div>

        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => {
              setEditingBranch(null)
              setCurrentStep(1)
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
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Branch</span>
          </button>
          <a
            href="/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to Dashboard
          </a>
        </div>

        {branches.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Branches Found</h3>
            <p className="text-gray-500">Add your first branch to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.filter(branch => branch.isActive).map((branch) => (
              <div key={branch.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                      <p className="text-sm text-gray-600 font-medium">{branch.buildingName}</p>
                      <p className="text-xs text-gray-500 mt-1">{branch.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {branch.isActive ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm font-medium ${branch.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Edit Branch"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Delete Branch"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900">{branch.address}</p>
                      <p className="text-sm text-gray-500">{branch.city}, {branch.state} {branch.zipCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                    <p className="text-sm text-gray-900">{branch.phone}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                    <p className="text-sm text-gray-900">{branch.email}</p>
                  </div>

                  {/* Rooms and Packages Links */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <a
                        href={`/admin/rooms?branch=${branch.id}`}
                        className="flex items-center justify-center px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                      >
                        <BuildingOfficeIcon className="w-4 h-4 text-blue-600 mr-2" />
                        <div className="text-left">
                          <p className="text-xs text-gray-500">Rooms</p>
                          <p className="text-sm font-semibold text-blue-600">{branch.roomCount || 0}</p>
                        </div>
                      </a>
                      <a
                        href="/admin/packages"
                        className="flex items-center justify-center px-3 py-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                      >
                        <TagIcon className="w-4 h-4 text-green-600 mr-2" />
                        <div className="text-left">
                          <p className="text-xs text-gray-500">Packages</p>
                          <p className="text-sm font-semibold text-green-600">{branch.packageCount || 0}</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inactive Branches Section */}
        {branches.filter(branch => !branch.isActive).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Inactive Branches</h3>
              <p className="text-sm text-gray-500">Branches that have been deactivated</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.filter(branch => !branch.isActive).map((branch) => (
                <div key={branch.id} className="bg-red-50 rounded-lg p-6 border border-red-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <BuildingOfficeIcon className="w-8 h-8 text-red-600" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{branch.name}</h4>
                        <p className="text-sm text-gray-600 font-medium">{branch.buildingName}</p>
                        <p className="text-xs text-gray-500 mt-1">{branch.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <XCircleIcon className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">Inactive</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReactivate(branch.id.toString())}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md"
                        title="Reactivate Branch"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step-by-Step Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingBranch(null)
                    setCurrentStep(1)
                  }}
                  className="text-white hover:text-blue-200 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex space-x-2">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                        i < currentStep ? 'bg-white' : 'bg-blue-500 bg-opacity-30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <BuildingOfficeIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                      <p className="text-gray-500 text-sm">Provide the basic details about your branch</p>
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Branch Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Downtown Branch"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Location Details */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <MapPinIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-gray-900">Location Details</h4>
                      <p className="text-gray-500 text-sm">Enter the complete address information</p>
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        id="address"
                        required
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Lahore"
                        />
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          id="state"
                          required
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Punjab"
                        />
                      </div>
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP/Postal Code *
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          required
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="54000"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <PhoneIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                      <p className="text-gray-500 text-sm">Provide contact details for this branch</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="+92 42 1234567"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="branch@company.com"
                        />
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                            Activate this branch
                          </label>
                          <p className="text-sm text-gray-500">Only active branches will be available for selection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Confirm */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <CheckCircleIcon className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h4 className="text-lg font-semibold text-gray-900">Review & Confirm</h4>
                      <p className="text-gray-500 text-sm">Please review all information before creating the branch</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Basic Information</h5>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Branch Name:</span> {formData.name}</p>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Location</h5>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Address:</span> {formData.address}</p>
                            <p><span className="font-medium">City:</span> {formData.city}</p>
                            <p><span className="font-medium">State:</span> {formData.state}</p>
                            <p><span className="font-medium">ZIP:</span> {formData.zipCode}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Contact</h5>
                        <div className="space-y-2 text-sm">
                          <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                          <p><span className="font-medium">Email:</span> {formData.email}</p>
                          <p><span className="font-medium">Status:</span> 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              formData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {formData.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingBranch(null)
                      setCurrentStep(1)
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>

                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{editingBranch ? 'Update Branch' : 'Create Branch'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

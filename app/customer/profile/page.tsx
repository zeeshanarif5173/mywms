'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  companyName?: string
  packageId?: string
  gatePassId?: string
  remarks?: string
  accountStatus: string
  createdAt: string
  updatedAt: string
}

export default function CustomerProfile() {
  const { data: session } = useSession()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showRemarks, setShowRemarks] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    remarks: '',
    accountStatus: 'ACTIVE'
  })

  // Load customer data
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true)
        // Get customer ID from session user ID
        const customerId = session?.user?.id || '1'
        const response = await fetch(`/api/customer/get/${customerId}`)
        
        if (response.ok) {
          const customerData = await response.json()
          setCustomer(customerData)
          setFormData({
            name: customerData.name,
            phone: customerData.phone || '',
            company: customerData.company || '',
            remarks: customerData.remarks || '',
            accountStatus: customerData.accountStatus
          })
        }
      } catch (error) {
        console.error('Error loading customer:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadCustomer()
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Only send fields that customers are allowed to update
      const allowedFields = {
        id: customer?.id,
        name: formData.name,
        phone: formData.phone,
        company: formData.company
      }
      
      console.log('Sending update data:', allowedFields)
      
      const response = await fetch('/api/customer/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(allowedFields)
      })

      if (response.ok) {
        const updatedCustomer = await response.json()
        setCustomer(updatedCustomer)
        setIsEditing(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (customer) {
      setFormData({
        name: customer.name,
        phone: customer.phone || '',
         company: customer.companyName || '',
        remarks: customer.remarks || '',
        accountStatus: customer.accountStatus
      })
    }
    setIsEditing(false)
  }

  const canEditRemarks = session?.user?.role === 'MANAGER' || session?.user?.role === 'ADMIN'
  const canEditStatus = session?.user?.role === 'MANAGER' || session?.user?.role === 'ADMIN'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h2>
          <p className="text-gray-600">The requested customer profile could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                {customer.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
                <p className="text-gray-600">Customer Profile</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                customer.accountStatus === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {customer.accountStatus}
              </span>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            <p className="text-gray-600 mt-1">
              {isEditing ? 'Edit your profile information below' : 'View your profile information'}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    />
                  ) : (
                    <div className="flex items-center">
                      <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{customer.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{customer.email}</span>
                    <span className="ml-2 text-xs text-gray-500">(Read-only)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center">
                      <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{customer.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{customer.companyName || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* System Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package ID
                  </label>
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{customer.packageId || 'Not assigned'}</span>
                    <span className="ml-2 text-xs text-gray-500">(System)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gate Pass ID
                  </label>
                  <div className="flex items-center">
                    <LockClosedIcon className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{customer.gatePassId || 'Not assigned'}</span>
                    <span className="ml-2 text-xs text-gray-500">(System)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Status
                  </label>
                  {isEditing && canEditStatus ? (
                    <select
                      name="accountStatus"
                      value={formData.accountStatus}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="LOCKED">Locked</option>
                    </select>
                  ) : (
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        customer.accountStatus === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.accountStatus}
                      </span>
                      {!canEditStatus && (
                        <span className="ml-2 text-xs text-gray-500">(Manager only)</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                    {canEditRemarks && (
                      <span className="ml-2 text-xs text-blue-600">(Manager editable)</span>
                    )}
                  </label>
                  {isEditing && canEditRemarks ? (
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={3}
                      className="input-field"
                      placeholder="Add remarks about this customer..."
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">
                          {customer.remarks ? 'View remarks' : 'No remarks'}
                        </span>
                        {customer.remarks && (
                          <button
                            onClick={() => setShowRemarks(!showRemarks)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {showRemarks ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                      {showRemarks && customer.remarks && (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                          {customer.remarks}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Profile Metadata */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Member since:</span> {
                    customer.createdAt 
                      ? new Date(customer.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                  }
                </div>
                <div>
                  <span className="font-medium">Last updated:</span> {
                    customer.updatedAt 
                      ? new Date(customer.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

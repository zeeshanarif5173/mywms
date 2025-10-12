'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'
import { generateUniqueId, copyToClipboard } from '@/lib/id-generator'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'TEAM_LEAD' | 'CUSTOMER' | 'VENDOR'
  branchId?: string
  accountStatus: 'Active' | 'Locked' | 'Suspended'
  companyName?: string
  packageId?: string
  gatePassId?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export default function AdminUsers() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER' as 'ADMIN' | 'MANAGER' | 'STAFF' | 'TEAM_LEAD' | 'CUSTOMER' | 'VENDOR',
    branchId: '1',
    accountStatus: 'Active' as 'Active' | 'Locked' | 'Suspended',
    companyName: '',
    packageId: '',
    gatePassId: '',
    remarks: ''
  })
  const [generatedIds, setGeneratedIds] = useState({
    packageId: '',
    gatePassId: ''
  })
  const [copyFeedback, setCopyFeedback] = useState<{
    packageId: boolean
    gatePassId: boolean
  }>({
    packageId: false,
    gatePassId: false
  })

  // Load users based on role permissions
  useEffect(() => {
    const loadUsers = async (retryCount = 0) => {
      try {
        setLoading(true)
        
        // Fetch users from API
        const response = await fetch('/api/users')
        console.log('Users API response status:', response.status)
        if (response.ok) {
          const apiUsers = await response.json()
          console.log('Users API data:', apiUsers)
          console.log('API users count:', apiUsers.length)
          setUsers(apiUsers)
          return
        } else if (response.status === 401 && retryCount < 3) {
          // If unauthorized, wait a bit and retry (session might not be ready)
          console.log(`Retrying API call (attempt ${retryCount + 1}/3)...`)
          setTimeout(() => loadUsers(retryCount + 1), 1000)
          return
        } else {
          console.error('Users API failed:', response.status, response.statusText)
          const errorText = await response.text()
          console.error('API error details:', errorText)
          
          // Try to load from localStorage as fallback
          try {
            const localUsers = localStorage.getItem('coworking_portal_additional_users')
            if (localUsers) {
              const parsedUsers = JSON.parse(localUsers)
              console.log('Loaded users from localStorage:', parsedUsers.length)
              setUsers(parsedUsers)
              return
            }
          } catch (error) {
            console.error('Error loading from localStorage:', error)
          }
        }
        
        // Fallback to empty array if all else fails
        setUsers([])
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [session])

  // Filter users based on role permissions (for statistics)
  const roleFilteredUsers = users.filter(user => {
    // Admin can see all users
    if (session?.user?.role === 'ADMIN') {
      return true
    }

    // Managers can only see users in their branch, excluding other admins
    if (session?.user?.role === 'MANAGER') {
      return user.branchId === session.user.branchId && user.role !== 'ADMIN'
    }

    // Other roles (e.g., STAFF, CUSTOMER) might have no access or limited access
    return false
  })

  // Calculate statistics from role-filtered users (before search/filter filters)
  const stats = {
    total: roleFilteredUsers.length,
    active: roleFilteredUsers.filter(u => u.accountStatus === 'Active').length,
    customers: roleFilteredUsers.filter(u => u.role === 'CUSTOMER').length,
    staff: roleFilteredUsers.filter(u => u.role === 'STAFF' || u.role === 'TEAM_LEAD').length
  }

  // Apply additional filters for display
  const filteredUsers = roleFilteredUsers.filter(user => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.companyName?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(searchTerm)
      )
    }
    return true
  }).filter(user => {
    // Apply role filter
    if (roleFilter !== 'ALL') {
      return user.role === roleFilter
    }
    return true
  }).filter(user => {
    // Apply status filter
    if (statusFilter !== 'ALL') {
      return user.accountStatus === statusFilter
    }
    return true
  })


  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800'
      case 'STAFF':
        return 'bg-green-100 text-green-800'
      case 'TEAM_LEAD':
        return 'bg-purple-100 text-purple-800'
      case 'CUSTOMER':
        return 'bg-gray-100 text-gray-800'
      case 'VENDOR':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800'
      case 'Locked':
        return 'bg-red-100 text-red-800'
      case 'Suspended':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password for security
      phone: user.phone || '',
      role: user.role,
      branchId: user.branchId || '1',
      accountStatus: user.accountStatus,
      companyName: user.companyName || '',
      packageId: user.packageId || '',
      gatePassId: user.gatePassId || '',
      remarks: user.remarks || ''
    })
    setGeneratedIds({
      packageId: user.packageId || '',
      gatePassId: user.gatePassId || ''
    })
    setShowEditModal(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  const handleSaveUser = async () => {
    try {
      if (showAddModal) {
        // Add new user via API
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const newUser = await response.json()
          setUsers([...users, newUser])
          
          // Also save to localStorage as backup
          try {
            const existingUsers = JSON.parse(localStorage.getItem('coworking_portal_additional_users') || '[]')
            const updatedUsers = [...existingUsers, newUser]
            localStorage.setItem('coworking_portal_additional_users', JSON.stringify(updatedUsers))
          } catch (error) {
            console.error('Failed to save to localStorage:', error)
          }
          
          setShowAddModal(false)
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to create user')
        }
      } else if (showEditModal && editingUser) {
        // Update existing user via API
        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        if (response.ok) {
          const updatedUser = await response.json()
          setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u))
          setShowEditModal(false)
          setEditingUser(null)
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to update user')
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Failed to save user')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'CUSTOMER',
      branchId: '1',
      accountStatus: 'Active',
      companyName: '',
      packageId: '',
      gatePassId: '',
      remarks: ''
    })
    setGeneratedIds({
      packageId: '',
      gatePassId: ''
    })
  }

  const generateNewIds = () => {
    const packageId = generateUniqueId('package')
    const gatePassId = generateUniqueId('gatepass')
    
    setGeneratedIds({ packageId, gatePassId })
    setFormData(prev => ({
      ...prev,
      packageId,
      gatePassId
    }))
  }

  const handleCopyId = async (id: string, type: 'packageId' | 'gatePassId') => {
    try {
      await copyToClipboard(id)
      setCopyFeedback(prev => ({ ...prev, [type]: true }))
      setTimeout(() => {
        setCopyFeedback(prev => ({ ...prev, [type]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy ID:', error)
      alert('Failed to copy ID to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-2 text-gray-600">
            Manage all users including customers, staff, team leads, and vendors
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => {
              setRoleFilter('ALL')
              setStatusFilter('ALL')
              setSearchTerm('')
            }}
            className={`rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 text-left w-full ${
              roleFilter === 'ALL' && statusFilter === 'ALL' && !searchTerm
                ? 'bg-blue-50 border-2 border-blue-200'
                : 'bg-white'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setRoleFilter('ALL')
              setStatusFilter('Active')
              setSearchTerm('')
            }}
            className={`rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 text-left w-full ${
              roleFilter === 'ALL' && statusFilter === 'Active' && !searchTerm
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-white'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setRoleFilter('CUSTOMER')
              setStatusFilter('ALL')
              setSearchTerm('')
            }}
            className={`rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 text-left w-full ${
              roleFilter === 'CUSTOMER' && statusFilter === 'ALL' && !searchTerm
                ? 'bg-purple-50 border-2 border-purple-200'
                : 'bg-white'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Customers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.customers}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setRoleFilter('STAFF')
              setStatusFilter('ALL')
              setSearchTerm('')
            }}
            className={`rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 text-left w-full ${
              roleFilter === 'STAFF' && statusFilter === 'ALL' && !searchTerm
                ? 'bg-indigo-50 border-2 border-indigo-200'
                : 'bg-white'
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Staff & Team</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.staff}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, company, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="STAFF">Staff</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="CUSTOMER">Customer</option>
                  <option value="VENDOR">Vendor</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Locked">Locked</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <button
                  onClick={() => {
                    setRoleFilter('ALL')
                    setStatusFilter('ALL')
                    setSearchTerm('')
                  }}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <FunnelIcon className="h-5 w-5 mr-2" />
                  Clear Filters
                </button>

                <button
                  onClick={() => {
                    resetForm()
                    generateNewIds()
                    setShowAddModal(true)
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.companyName || '-'}</div>
                      {user.packageId && (
                        <div className="text-sm text-gray-500">Package: {user.packageId}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.accountStatus)}`}>
                        {user.accountStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.phone && (
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                            {user.phone}
                          </div>
                        )}
                        {user.gatePassId && (
                          <div className="text-sm text-gray-500">Gate Pass: {user.gatePassId}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit User"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete User"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding a new user.'}
              </p>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.accountStatus)}`}>
                      {selectedUser.accountStatus}
                    </span>
                  </div>
                  
                  {selectedUser.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.phone}</p>
                    </div>
                  )}
                  
                  {selectedUser.companyName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.companyName}</p>
                    </div>
                  )}
                  
                  {selectedUser.remarks && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Remarks</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.remarks}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit User Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {showAddModal ? 'Add New User' : 'Edit User'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                      setEditingUser(null)
                      resetForm()
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleSaveUser(); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password {showAddModal ? '*' : ''}
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={showAddModal}
                        placeholder={showAddModal ? "Enter password for new user" : "Leave empty to keep current password"}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {showAddModal && (
                        <p className="mt-1 text-sm text-gray-500">This password will be used for login</p>
                      )}
                      {showEditModal && (
                        <p className="mt-1 text-sm text-gray-500">Leave empty to keep current password</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="STAFF">Staff</option>
                        <option value="TEAM_LEAD">Team Lead</option>
                        <option value="MANAGER">Manager</option>
                        <option value="VENDOR">Vendor</option>
                        {session?.user?.role === 'ADMIN' && (
                          <option value="ADMIN">Admin</option>
                        )}
                      </select>
                    </div>
                    
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        name="accountStatus"
                        value={formData.accountStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Locked">Locked</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Package ID</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 flex items-center">
                          <KeyIcon className="h-4 w-4 text-gray-500 mr-2" />
                          {formData.packageId || 'Will be generated'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.packageId) {
                              handleCopyId(formData.packageId, 'packageId')
                            }
                          }}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            copyFeedback.packageId 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          title={formData.packageId ? "Copy Package ID to clipboard" : "No ID to copy"}
                          disabled={!formData.packageId}
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newId = generateUniqueId('package')
                            setFormData(prev => ({ ...prev, packageId: newId }))
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Generate new Package ID"
                        >
                          <KeyIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Auto-generated unique 8-digit ID</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gate Pass ID</label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 flex items-center">
                          <KeyIcon className="h-4 w-4 text-gray-500 mr-2" />
                          {formData.gatePassId || 'Will be generated'}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.gatePassId) {
                              handleCopyId(formData.gatePassId, 'gatePassId')
                            }
                          }}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            copyFeedback.gatePassId 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                          title={formData.gatePassId ? "Copy Gate Pass ID to clipboard" : "No ID to copy"}
                          disabled={!formData.gatePassId}
                        >
                          <ClipboardDocumentIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newId = generateUniqueId('gatepass')
                            setFormData(prev => ({ ...prev, gatePassId: newId }))
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          title="Generate new Gate Pass ID"
                        >
                          <KeyIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Auto-generated unique 8-digit ID</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        setShowEditModal(false)
                        setEditingUser(null)
                        resetForm()
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {showAddModal ? 'Add User' : 'Update User'}
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

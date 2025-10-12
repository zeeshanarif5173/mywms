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
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'TEAM_LEAD' | 'CUSTOMER' | 'VENDOR'
  category?: 'Staff' | 'Team' | 'Customer' | 'Vendor'
  branchId?: string
  accountStatus: 'Active' | 'Locked' | 'Suspended'
  companyName?: string
  packageId?: string
  gatePassId?: string
  remarks?: string
  createdAt: string
  updatedAt: string
}

export default function ManagerUsers() {
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
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CUSTOMER' as User['role'],
    category: 'Customer' as User['category'],
    branchId: '1',
    accountStatus: 'Active' as User['accountStatus'],
    companyName: '',
    packageId: '',
    gatePassId: '',
    remarks: ''
  })

  // Load users based on role permissions
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true)
        
        // Fetch users from API
        const response = await fetch('/api/users')
        console.log('Users API response status:', response.status)
        if (response.ok) {
          const apiUsers = await response.json()
          console.log('Users API data:', apiUsers)
          setUsers(apiUsers)
        } else {
          console.error('Users API failed:', response.status, response.statusText)
          // Show error instead of falling back to mock data
          setUsers([])
        }
      } catch (error) {
        console.error('Error loading users:', error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadUsers()
    }
  }, [session])

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'CUSTOMER',
      category: 'Customer',
      branchId: '1',
      accountStatus: 'Active',
      companyName: '',
      packageId: '',
      gatePassId: '',
      remarks: ''
    })
    setShowAddModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      category: user.category || 'Customer',
      branchId: user.branchId || '1',
      accountStatus: user.accountStatus,
      companyName: user.companyName || '',
      packageId: user.packageId || '',
      gatePassId: user.gatePassId || '',
      remarks: user.remarks || ''
    })
    setShowEditModal(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      phone: '',
      role: 'CUSTOMER',
      category: 'Customer',
      branchId: '1',
      accountStatus: 'Active',
      companyName: '',
      packageId: '',
      gatePassId: '',
      remarks: ''
    })
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
          setShowAddModal(false)
          resetForm()
          alert('User created successfully!')
        } else {
          const error = await response.json()
          alert(`Error: ${error.error || 'Failed to create user'}`)
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
          alert('User updated successfully!')
        } else {
          const error = await response.json()
          alert(`Error: ${error.error || 'Failed to update user'}`)
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Failed to save user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId))
        alert('User deleted successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to delete user'}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.companyName && user.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || user.accountStatus === statusFilter

    // Manager can only see users in their branch
    if (session?.user?.role === 'MANAGER') {
      const matchesBranch = user.branchId === session.user.branchId
      return matchesSearch && matchesRole && matchesStatus && matchesBranch
    }

    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'TEAM_LEAD': return 'bg-purple-100 text-purple-800'
      case 'STAFF': return 'bg-green-100 text-green-800'
      case 'CUSTOMER': return 'bg-gray-100 text-gray-800'
      case 'VENDOR': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Locked': return 'bg-red-100 text-red-800'
      case 'Suspended': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage customers, staff, and team members
                </p>
              </div>
              <button
                onClick={handleAddUser}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add User
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CUSTOMER">Customers</option>
                  <option value="STAFF">Staff</option>
                  <option value="TEAM_LEAD">Team Leads</option>
                  <option value="MANAGER">Managers</option>
                  <option value="ADMIN">Admins</option>
                  <option value="VENDOR">Vendors</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Locked">Locked</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by adding a new user.'}
              </p>
            </div>
          ) : (
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
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <EnvelopeIcon className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.companyName || '-'}
                        </div>
                        {user.branchId && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                            Branch {user.branchId}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.accountStatus)}`}>
                          {user.accountStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
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
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
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
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Main Branch</option>
                    <option value="2">Branch 2</option>
                    <option value="3">Branch 3</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
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
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Status *</label>
                  <select
                    name="accountStatus"
                    value={formData.accountStatus}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Active">Active</option>
                    <option value="Locked">Locked</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Main Branch</option>
                    <option value="2">Branch 2</option>
                    <option value="3">Branch 3</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
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
                  <p className="text-sm text-gray-900">{selectedUser.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                
                {selectedUser.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.accountStatus)}`}>
                    {selectedUser.accountStatus}
                  </span>
                </div>
                
                {selectedUser.companyName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <p className="text-sm text-gray-900">{selectedUser.companyName}</p>
                  </div>
                )}
                
                {selectedUser.branchId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <p className="text-sm text-gray-900">Branch {selectedUser.branchId}</p>
                  </div>
                )}
                
                {selectedUser.packageId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Package ID</label>
                    <p className="text-sm text-gray-900">{selectedUser.packageId}</p>
                  </div>
                )}
                
                {selectedUser.gatePassId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gate Pass ID</label>
                    <p className="text-sm text-gray-900">{selectedUser.gatePassId}</p>
                  </div>
                )}
                
                {selectedUser.remarks && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                    <p className="text-sm text-gray-900">{selectedUser.remarks}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    handleEditUser(selectedUser)
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
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
          return
        } else {
          console.error('Users API failed:', response.status, response.statusText)
        }
        
        // Fallback to mock data if API fails
        const mockUsers: User[] = [
          // Admins
          {
            id: 'admin-1',
            name: 'Admin User',
            email: 'admin@example.com',
            phone: '+1-555-0001',
            role: 'ADMIN',
            category: 'Team',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'Coworking Portal',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          // Managers
          {
            id: 'manager-1',
            name: 'Jane Manager',
            email: 'manager@example.com',
            phone: '+1-555-0002',
            role: 'MANAGER',
            category: 'Team',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'Branch Office',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          // Staff
          {
            id: 'staff-1',
            name: 'Mike Johnson',
            email: 'mike.johnson@company.com',
            phone: '+1-555-0003',
            role: 'STAFF',
            category: 'Staff',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'Maintenance Team',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'staff-2',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@company.com',
            phone: '+1-555-0004',
            role: 'STAFF',
            category: 'Staff',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'Security Team',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'staff-3',
            name: 'David Brown',
            email: 'david.brown@company.com',
            phone: '+1-555-0005',
            role: 'STAFF',
            category: 'Staff',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'Cleaning Team',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          // Team Leads
          {
            id: 'team-1',
            name: 'Lisa Garcia',
            email: 'lisa.garcia@company.com',
            phone: '+1-555-0006',
            role: 'TEAM_LEAD',
            category: 'Team',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'Technical Team',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'team-2',
            name: 'Robert Davis',
            email: 'robert.davis@company.com',
            phone: '+1-555-0007',
            role: 'TEAM_LEAD',
            category: 'Team',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'Operations Team',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          // Customers
          {
            id: 'customer-1',
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+1-555-0008',
            role: 'CUSTOMER',
            category: 'Customer',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'TechCorp',
            packageId: 'PKG-001',
            gatePassId: 'GP-123',
            remarks: 'VIP member, premium package',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'customer-2',
            name: 'Jane Doe',
            email: 'jane@startup.io',
            phone: '+1-555-0009',
            role: 'CUSTOMER',
            category: 'Customer',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'StartupXYZ',
            packageId: 'PKG-002',
            gatePassId: 'GP-124',
            remarks: 'Regular member',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'customer-3',
            name: 'Bob Wilson',
            email: 'bob@freelance.com',
            phone: '+1-555-0010',
            role: 'CUSTOMER',
            category: 'Customer',
            branchId: '1',
            accountStatus: 'Locked',
            companyName: '',
            packageId: 'PKG-003',
            gatePassId: 'GP-125',
            remarks: 'Payment overdue',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          // Vendors
          {
            id: 'vendor-1',
            name: 'CleanPro Services',
            email: 'contact@cleanpro.com',
            phone: '+1-555-0011',
            role: 'VENDOR',
            category: 'Vendor',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'CleanPro Services',
            remarks: 'Cleaning services provider',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'vendor-2',
            name: 'TechFix Solutions',
            email: 'support@techfix.com',
            phone: '+1-555-0012',
            role: 'VENDOR',
            category: 'Vendor',
            branchId: '1',
            accountStatus: 'Active',
            companyName: 'TechFix Solutions',
            remarks: 'IT support and maintenance',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]

        // Filter users based on role permissions
        let filteredUsers = mockUsers
        
        if (session?.user?.role === 'MANAGER') {
          // Managers can see customers, staff, team leads, and vendors in their branch
          filteredUsers = mockUsers.filter(user => 
            user.branchId === session.user.branchId && 
            (user.role === 'CUSTOMER' || user.role === 'STAFF' || user.role === 'TEAM_LEAD' || user.role === 'VENDOR')
          )
        } else if (session?.user?.role === 'ADMIN') {
          // Admins can see all users
          filteredUsers = mockUsers
        }

        setUsers(filteredUsers)
      } catch (error) {
        console.error('Error loading users:', error)
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

  const handleDeleteUser = async (userId: string) => {
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
        // Update existing user (for now, just update locally)
        const updatedUser: User = {
          ...editingUser,
          ...formData,
          updatedAt: new Date().toISOString()
        }
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u))
        setShowEditModal(false)
        setEditingUser(null)
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || user.accountStatus === statusFilter
    return matchesSearch && matchesRole && matchesStatus
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
        return 'bg-yellow-100 text-yellow-800'
      case 'VENDOR':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Staff':
        return 'bg-emerald-100 text-emerald-800'
      case 'Team':
        return 'bg-indigo-100 text-indigo-800'
      case 'Customer':
        return 'bg-amber-100 text-amber-800'
      case 'Vendor':
        return 'bg-orange-100 text-orange-800'
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <ShieldCheckIcon className="w-5 h-5 text-red-600" />
      case 'MANAGER':
        return <UserGroupIcon className="w-5 h-5 text-blue-600" />
      case 'STAFF':
        return <UserIcon className="w-5 h-5 text-green-600" />
      case 'TEAM_LEAD':
        return <UserGroupIcon className="w-5 h-5 text-purple-600" />
      case 'CUSTOMER':
        return <UserIcon className="w-5 h-5 text-yellow-600" />
      case 'VENDOR':
        return <BuildingOfficeIcon className="w-5 h-5 text-orange-600" />
      default:
        return <UserIcon className="w-5 h-5 text-gray-600" />
    }
  }

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.accountStatus === 'Active').length
  const lockedUsers = users.filter(u => u.accountStatus === 'Locked').length
  const customers = users.filter(u => u.role === 'CUSTOMER').length
  const staff = users.filter(u => u.role === 'STAFF' || u.role === 'TEAM_LEAD').length
  const vendors = users.filter(u => u.role === 'VENDOR').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">Manage all users including staff, customers, and vendors</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Role: {session?.user?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-3xl font-bold text-yellow-600">{customers}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Staff & Team</p>
                <p className="text-3xl font-bold text-purple-600">{staff}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Locked">Locked</option>
                <option value="Suspended">Suspended</option>
              </select>
              <button 
                onClick={handleAddUser}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.companyName || 'Individual'}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                  {user.category && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(user.category)}`}>
                      {user.category}
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.accountStatus)}`}>
                    {user.accountStatus}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.packageId && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ShieldCheckIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{user.packageId}</span>
                  </div>
                )}
                {user.remarks && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{user.remarks}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Updated {new Date(user.updatedAt).toLocaleDateString()}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user)
                      setShowUserModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit User"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete User"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Add New User</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="STAFF">Staff</option>
                        <option value="TEAM_LEAD">Team Lead</option>
                        <option value="MANAGER">Manager</option>
                        <option value="VENDOR">Vendor</option>
                        {session?.user?.role === 'ADMIN' && <option value="ADMIN">Admin</option>}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Staff">Staff</option>
                        <option value="Team">Team</option>
                        <option value="Vendor">Vendor</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                      <select
                        name="accountStatus"
                        value={formData.accountStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Locked">Locked</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add remarks about this user..."
                    />
                  </div>
                </form>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUser}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Add User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="CUSTOMER">Customer</option>
                        <option value="STAFF">Staff</option>
                        <option value="TEAM_LEAD">Team Lead</option>
                        <option value="MANAGER">Manager</option>
                        <option value="VENDOR">Vendor</option>
                        {session?.user?.role === 'ADMIN' && <option value="ADMIN">Admin</option>}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Customer">Customer</option>
                        <option value="Staff">Staff</option>
                        <option value="Team">Team</option>
                        <option value="Vendor">Vendor</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                      <select
                        name="accountStatus"
                        value={formData.accountStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Active">Active</option>
                        <option value="Locked">Locked</option>
                        <option value="Suspended">Suspended</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add remarks about this user..."
                    />
                  </div>
                </form>

                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveUser}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Update User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
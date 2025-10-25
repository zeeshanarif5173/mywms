'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  UsersIcon,
  TagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

interface Room {
  id: string
  branchId: string
  roomNumber: string
  name: string
  type: 'meeting' | 'private_office' | 'store' | 'workspace' | 'conference_hall'
  capacity: number
  location: string
  floor: string
  amenities: string[]
  isActive: boolean
  isBookable: boolean
  assignedCustomerId?: string
  hourlyRate?: number
  monthlyRate?: number
  description: string
  tags: string[]
  inventory: any[]
  createdAt: string
  updatedAt: string
}

interface Branch {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  email?: string
  isActive: boolean
}

export default function AdminRooms() {
  const { data: session } = useSession()
  const [rooms, setRooms] = useState<Room[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    branchId: '',
    roomNumber: '',
    name: '',
    type: 'meeting' as 'meeting' | 'private_office' | 'store' | 'workspace' | 'conference_hall',
    capacity: 4,
    location: '',
    floor: '1',
    amenities: [] as string[],
    isActive: true,
    isBookable: true,
    assignedCustomerId: '',
    hourlyRate: 0,
    monthlyRate: 0,
    description: '',
    tags: [] as string[]
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch branches
        const branchesResponse = await fetch('/api/branches')
        if (branchesResponse.ok) {
          const branchesData = await branchesResponse.json()
          // Handle API response structure
          if (branchesData.success && Array.isArray(branchesData.data)) {
            setBranches(branchesData.data)
          } else if (Array.isArray(branchesData)) {
            setBranches(branchesData)
          } else {
            setBranches([])
          }
        }

        // Fetch rooms
        const roomsResponse = await fetch('/api/rooms')
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json()
          setRooms(roomsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchData()
    }
  }, [session])

  const filteredRooms = rooms.filter(room => {
    const matchesBranch = selectedBranch === 'all' || room.branchId === selectedBranch
    const matchesSearch = searchTerm === '' || 
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesBranch && matchesSearch
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingRoom ? `/api/rooms/${editingRoom.id}` : '/api/rooms'
      const method = editingRoom ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Refresh rooms list
        const roomsResponse = await fetch('/api/rooms')
        if (roomsResponse.ok) {
          const data = await roomsResponse.json()
          setRooms(data)
        }
        
        setShowModal(false)
        setEditingRoom(null)
        resetForm()
      } else {
        console.error('Failed to save room')
      }
    } catch (error) {
      console.error('Error saving room:', error)
    }
  }

  const handleEdit = (room: Room) => {
    setEditingRoom(room)
    setFormData({
      branchId: room.branchId,
      roomNumber: room.roomNumber,
      name: room.name,
      type: room.type,
      capacity: room.capacity,
      location: room.location,
      floor: room.floor,
      amenities: room.amenities,
      isActive: room.isActive,
      isBookable: room.isBookable,
      assignedCustomerId: room.assignedCustomerId || '',
      hourlyRate: room.hourlyRate || 0,
      monthlyRate: room.monthlyRate || 0,
      description: room.description,
      tags: room.tags
    })
    setShowModal(true)
  }

  const handleDelete = async (room: Room) => {
    const confirmMessage = `Are you sure you want to delete this room?\n\nRoom: ${room.name} (${room.roomNumber})\nBranch: ${branches.find(b => b.id === room.branchId)?.name}\nType: ${getRoomTypeLabel(room.type)}\n\nThis action cannot be undone.`
    
    if (!confirm(confirmMessage)) return
    
    try {
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        let message = `Room "${result.deletedRoom.name}" has been permanently deleted.`
        
        if (result.cleanup) {
          const cleanup = result.cleanup
          if (cleanup.deletedBookings > 0 || cleanup.deletedInventoryItems > 0) {
            message += `\n\nCleanup completed:\n`
            if (cleanup.deletedBookings > 0) {
              message += `• ${cleanup.deletedBookings} booking(s) removed\n`
            }
            if (cleanup.deletedInventoryItems > 0) {
              message += `• ${cleanup.deletedInventoryItems} inventory item(s) removed\n`
            }
          }
        }
        
        alert(message)
        
        // Refresh rooms list
        const roomsResponse = await fetch('/api/rooms')
        if (roomsResponse.ok) {
          const data = await roomsResponse.json()
          setRooms(data)
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to delete room: ${errorData.error || 'Unknown error'}`)
        console.error('Failed to delete room:', errorData)
      }
    } catch (error) {
      alert('Error deleting room. Please try again.')
      console.error('Error deleting room:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      branchId: '',
      roomNumber: '',
      name: '',
      type: 'meeting',
      capacity: 4,
      location: '',
      floor: '1',
      amenities: [],
      isActive: true,
      isBookable: true,
      assignedCustomerId: '',
      hourlyRate: 0,
      monthlyRate: 0,
      description: '',
      tags: []
    })
  }

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800'
      case 'private_office':
        return 'bg-green-100 text-green-800'
      case 'store':
        return 'bg-purple-100 text-purple-800'
      case 'workspace':
        return 'bg-yellow-100 text-yellow-800'
      case 'conference_hall':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'Meeting Room'
      case 'private_office':
        return 'Private Office'
      case 'store':
        return 'Store'
      case 'workspace':
        return 'Workspace'
      case 'conference_hall':
        return 'Conference Hall'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rooms...</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
          <p className="text-sm text-gray-500">Manage rooms and workspaces across all branches</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
          >
            <option value="all">All Branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>

        <div className="flex space-x-3 mb-6">
          <button
            onClick={() => {
              setEditingRoom(null)
              resetForm()
              setShowModal(true)
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Add Room</span>
          </button>
          <a
            href="/admin/branches"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Manage Branches
          </a>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Found</h3>
            <p className="text-gray-500">Add your first room or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => {
              const branch = branches.find(b => b.id === room.branchId)
              return (
                <div key={room.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-sm text-gray-600 font-medium">{room.roomNumber}</p>
                        <p className="text-xs text-gray-500">{branch?.name}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoomTypeColor(room.type)}`}>
                            {getRoomTypeLabel(room.type)}
                          </span>
                          {room.isBookable ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircleIcon className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs font-medium ${room.isBookable ? 'text-green-600' : 'text-red-600'}`}>
                            {room.isBookable ? 'Bookable' : 'Not Bookable'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(room)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit Room"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete Room"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-900">{room.location}</p>
                        <p className="text-sm text-gray-500">Floor {room.floor}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <UsersIcon className="w-5 h-5 text-gray-400" />
                      <p className="text-sm text-gray-900">Capacity: {room.capacity} people</p>
                    </div>

                    {room.hourlyRate && (
                      <div className="flex items-center space-x-3">
                        <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-900">
                          {room.hourlyRate} PKR/hour
                          {room.monthlyRate && ` • ${room.monthlyRate} PKR/month`}
                        </p>
                      </div>
                    )}

                    {room.amenities.length > 0 && (
                      <div className="flex items-start space-x-3">
                        <TagIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">Amenities:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {room.amenities.slice(0, 3).map((amenity, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {amenity}
                              </span>
                            ))}
                            {room.amenities.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                +{room.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingRoom ? 'Edit Room' : 'Add New Room'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-1">
                    Branch *
                  </label>
                  <select
                    id="branchId"
                    required
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    id="roomNumber"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 101, 112, 201"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Conference Room Alpha"
                  />
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Room Type *
                  </label>
                  <select
                    id="type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="meeting">Meeting Room</option>
                    <option value="private_office">Private Office</option>
                    <option value="store">Store</option>
                    <option value="workspace">Workspace</option>
                    <option value="conference_hall">Conference Hall</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    id="location"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1st Floor"
                  />
                </div>

                <div>
                  <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                    Floor *
                  </label>
                  <input
                    type="text"
                    id="floor"
                    required
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1, 2, Ground"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the room and its features..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (PKR)
                  </label>
                  <input
                    type="number"
                    id="hourlyRate"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="monthlyRate" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rate (PKR)
                  </label>
                  <input
                    type="number"
                    id="monthlyRate"
                    min="0"
                    value={formData.monthlyRate}
                    onChange={(e) => setFormData({ ...formData, monthlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active Room
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isBookable"
                    checked={formData.isBookable}
                    onChange={(e) => setFormData({ ...formData, isBookable: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isBookable" className="ml-2 block text-sm text-gray-700">
                    Bookable by Clients
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingRoom(null)
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


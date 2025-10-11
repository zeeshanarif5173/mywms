'use client'

import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, UserIcon, CheckIcon } from '@heroicons/react/24/outline'

interface User {
  id: string
  name: string
  email: string
  role: string
  branchId: string
  accountStatus: string
}

interface UserSelectorProps {
  selectedUserId?: string
  selectedUserName?: string
  onUserSelect: (userId: string, userName: string) => void
  placeholder?: string
  className?: string
}

export default function UserSelector({
  selectedUserId,
  selectedUserName,
  onUserSelect,
  placeholder = "Search staff and team members...",
  className = ""
}: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load users when search query changes
  useEffect(() => {
    const searchUsers = async (retryCount = 0) => {
      setLoading(true)
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`)
        console.log('UserSelector: API response status:', response.status)
        if (response.ok) {
          const usersData = await response.json()
          console.log('UserSelector: Received users data:', usersData)
          console.log('UserSelector: Users count:', usersData.length)
          setUsers(usersData)
        } else if (response.status === 401 && retryCount < 2) {
          // If unauthorized, wait a bit and retry (session might not be ready)
          console.log(`UserSelector: Retrying API call (attempt ${retryCount + 1}/2)...`)
          setTimeout(() => searchUsers(retryCount + 1), 500)
          return
        } else {
          console.warn('UserSelector: API failed, using localStorage fallback')
          // Fallback to localStorage if API fails
          try {
            const localUsers = localStorage.getItem('coworking_portal_additional_users')
            if (localUsers) {
              const parsedUsers = JSON.parse(localUsers)
              const filteredUsers = parsedUsers.filter((user: any) => 
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              console.log('UserSelector: Loaded from localStorage:', filteredUsers.length)
              setUsers(filteredUsers)
            } else {
              setUsers([])
            }
          } catch {
            setUsers([])
          }
        }
      } catch (error) {
        console.error('UserSelector: Error searching users:', error)
        // Fallback to localStorage if API fails
        try {
          const localUsers = localStorage.getItem('coworking_portal_additional_users')
          if (localUsers) {
            const parsedUsers = JSON.parse(localUsers)
            const filteredUsers = parsedUsers.filter((user: any) => 
              user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase())
            )
            setUsers(filteredUsers)
          } else {
            setUsers([])
          }
        } catch {
          setUsers([])
        }
      } finally {
        setLoading(false)
      }
    }

    // Always search (even with empty query) to load users when component mounts
    const debounceTimer = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Load users when component first mounts
  useEffect(() => {
    const loadInitialUsers = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/users/search?q=')
        if (response.ok) {
          const usersData = await response.json()
          console.log('UserSelector: Initial load - users count:', usersData.length)
          setUsers(usersData)
        } else {
          console.log('UserSelector: API failed, loading from localStorage')
          // Fallback to localStorage
          const localUsers = localStorage.getItem('coworking_portal_additional_users')
          if (localUsers) {
            const parsedUsers = JSON.parse(localUsers)
            console.log('UserSelector: Initial load from localStorage:', parsedUsers.length)
            setUsers(parsedUsers)
          } else {
            console.log('UserSelector: No users in localStorage')
            setUsers([])
          }
        }
      } catch (error) {
        console.error('UserSelector: Error loading initial users:', error)
        // Fallback to localStorage
        const localUsers = localStorage.getItem('coworking_portal_additional_users')
        if (localUsers) {
          const parsedUsers = JSON.parse(localUsers)
          setUsers(parsedUsers)
        }
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialUsers()
  }, [])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Set selected user when props change
  useEffect(() => {
    if (selectedUserId && selectedUserName) {
      setSelectedUser({
        id: selectedUserId,
        name: selectedUserName,
        email: '',
        role: '',
        branchId: '',
        accountStatus: ''
      })
    }
  }, [selectedUserId, selectedUserName])

  const handleUserSelect = (user: User) => {
    setSelectedUser(user)
    onUserSelect(user.id, user.name)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'ArrowDown' && isOpen && users.length > 0) {
      e.preventDefault()
      // Focus first user option
      const firstButton = dropdownRef.current?.querySelector('button[data-user-option]') as HTMLButtonElement
      firstButton?.focus()
    }
  }

  const clearSelection = () => {
    setSelectedUser(null)
    onUserSelect('', '')
    setSearchQuery('')
  }

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

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <UserIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={selectedUser ? selectedUser.name : searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={selectedUser ? selectedUser.name : placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        {selectedUser && (
          <button
            onClick={clearSelection}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
        {!selectedUser && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm">Searching users...</p>
            </div>
          )}

          {!loading && searchQuery.length === 0 && (
            <div className="px-4 py-3 text-center text-gray-500">
              <p className="text-sm">Start typing to search staff and team members</p>
            </div>
          )}

          {!loading && searchQuery.length > 0 && users.length === 0 && (
            <div className="px-4 py-3 text-center text-gray-500">
              <p className="text-sm">No users found matching "{searchQuery}"</p>
            </div>
          )}

          {!loading && users.length > 0 && (
            <div className="py-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  data-user-option
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.accountStatus)}`}>
                    {user.accountStatus}
                  </span>
                  {selectedUser?.id === user.id && (
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  )}
                </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected User Display */}
      {selectedUser && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{selectedUser.name}</p>
              <p className="text-xs text-gray-500">ID: {selectedUser.id}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(selectedUser.role)}`}>
                {selectedUser.role.replace('_', ' ')}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedUser.accountStatus)}`}>
                {selectedUser.accountStatus}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

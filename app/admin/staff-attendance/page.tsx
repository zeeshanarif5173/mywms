'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  branchId: string
  accountStatus: string
}

interface TimeStats {
  totalHours: number
  totalDays: number
  averageHoursPerDay: number
  totalEntries: number
  completedEntries: number
  currentStatus: 'Checked In' | 'Checked Out' | 'Never'
}

interface StaffTimeEntry {
  id: string
  staffId: string
  checkInTime: string
  checkOutTime?: string
  duration?: number
  date: string
  status: 'Checked In' | 'Checked Out'
  notes?: string
  branchId: string
}

interface StaffAttendanceData {
  staff: StaffMember
  timeEntries: StaffTimeEntry[]
  stats: TimeStats
  currentStatus: string
}

interface OverallStats {
  totalStaff: number
  currentlyCheckedIn: number
  totalHours: number
  totalWorkingDays: number
  averageHoursPerStaff: number
}

export default function AdminStaffAttendance() {
  const { data: session } = useSession()
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendanceData[]>([])
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStaff, setSelectedStaff] = useState<StaffAttendanceData | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    staffId: '',
    branchId: ''
  })

  // Load staff attendance data
  useEffect(() => {
    const loadStaffAttendance = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters.startDate) params.append('startDate', filters.startDate)
        if (filters.endDate) params.append('endDate', filters.endDate)
        if (filters.staffId) params.append('staffId', filters.staffId)
        if (filters.branchId) params.append('branchId', filters.branchId)

        const response = await fetch(`/api/admin/staff-attendance?${params}`)
        if (response.ok) {
          const data = await response.json()
          setStaffAttendance(data.staffAttendance)
          setOverallStats(data.overallStats)
        }
      } catch (error) {
        console.error('Error loading staff attendance:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadStaffAttendance()
    }
  }, [session, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      staffId: '',
      branchId: ''
    })
  }

  const handleViewDetails = (staffData: StaffAttendanceData) => {
    setSelectedStaff(staffData)
    setShowDetailsModal(true)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Checked In':
        return 'bg-green-100 text-green-800'
      case 'Checked Out':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STAFF':
        return 'bg-blue-100 text-blue-800'
      case 'TEAM_LEAD':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
              <h1 className="text-3xl font-bold text-gray-900">Staff Attendance</h1>
              <p className="text-gray-600">Monitor and manage staff time tracking across all branches</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Statistics */}
        {overallStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Staff</p>
                  <p className="text-3xl font-bold text-blue-600">{overallStats.totalStaff}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Currently Working</p>
                  <p className="text-3xl font-bold text-green-600">{overallStats.currentlyCheckedIn}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-3xl font-bold text-purple-600">{overallStats.totalHours}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Working Days</p>
                  <p className="text-3xl font-bold text-orange-600">{overallStats.totalWorkingDays}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Hours/Staff</p>
                  <p className="text-3xl font-bold text-indigo-600">{overallStats.averageHoursPerStaff}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <select
                value={filters.branchId}
                onChange={(e) => handleFilterChange('branchId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Branches</option>
                <option value="1">Downtown Branch</option>
                <option value="2">Uptown Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Member
              </label>
              <select
                value={filters.staffId}
                onChange={(e) => handleFilterChange('staffId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Staff</option>
                {staffAttendance.map((data) => (
                  <option key={data.staff.id} value={data.staff.id}>
                    {data.staff.name} ({data.staff.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Staff Attendance Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Staff Attendance Overview</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Working Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Hours/Day
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffAttendance.map((data) => (
                  <tr key={data.staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserGroupIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{data.staff.name}</div>
                          <div className="text-sm text-gray-500">{data.staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(data.staff.role)}`}>
                        {data.staff.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(data.currentStatus)}`}>
                        {data.currentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.stats.totalHours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.stats.totalDays}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {data.stats.averageHoursPerDay}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(data)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <EyeIcon className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {staffAttendance.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
                <p className="text-gray-500">No staff members match the current filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Staff Details Modal */}
      {showDetailsModal && selectedStaff && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-2xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedStaff.staff.name} - Time Tracking Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Staff Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Staff Information</h4>
                <p className="text-sm text-gray-600">Name: {selectedStaff.staff.name}</p>
                <p className="text-sm text-gray-600">Email: {selectedStaff.staff.email}</p>
                <p className="text-sm text-gray-600">Role: {selectedStaff.staff.role.replace('_', ' ')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedStaff.currentStatus)}`}>
                  {selectedStaff.currentStatus}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
                <p className="text-sm text-gray-600">Total Hours: {selectedStaff.stats.totalHours}</p>
                <p className="text-sm text-gray-600">Working Days: {selectedStaff.stats.totalDays}</p>
                <p className="text-sm text-gray-600">Avg Hours/Day: {selectedStaff.stats.averageHoursPerDay}</p>
              </div>
            </div>

            {/* Time Entries */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Time Entries</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedStaff.timeEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">{new Date(entry.checkInTime).toLocaleTimeString()}</td>
                        <td className="px-4 py-2">
                          {entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleTimeString() : '-'}
                        </td>
                        <td className="px-4 py-2">
                          {entry.duration ? formatDuration(entry.duration) : '-'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedStaff.timeEntries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No time entries found for the selected period.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

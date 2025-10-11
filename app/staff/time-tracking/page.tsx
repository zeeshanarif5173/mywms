'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  ClockIcon,
  PlayIcon,
  StopIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as TimeIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

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

interface TimeStats {
  totalHours: number
  totalDays: number
  averageHoursPerDay: number
  totalEntries: number
  completedEntries: number
  currentStatus: 'Checked In' | 'Checked Out' | 'Never'
}

export default function StaffTimeTracking() {
  const { data: session } = useSession()
  const [timeEntries, setTimeEntries] = useState<StaffTimeEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<StaffTimeEntry | null>(null)
  const [stats, setStats] = useState<TimeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [notes, setNotes] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  // Load time entries and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        await loadTimeEntries()
        await loadStats()
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadData()
    }
  }, [session, dateRange])

  const loadTimeEntries = async () => {
    try {
      const response = await fetch(`/api/staff/time-tracking/entries/${session?.user?.id}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data)
        
        // Find current entry
        const current = data.find((entry: StaffTimeEntry) => entry.status === 'Checked In')
        setCurrentEntry(current || null)
      }
    } catch (error) {
      console.error('Error loading time entries:', error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/staff/time-tracking/export/${session?.user?.id}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true)
      const response = await fetch('/api/staff/time-tracking/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      })

      if (response.ok) {
        const newEntry = await response.json()
        setCurrentEntry(newEntry)
        setNotes('')
        await loadTimeEntries()
        await loadStats()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to check in')
      }
    } catch (error) {
      console.error('Error checking in:', error)
      alert('Failed to check in')
    } finally {
      setCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true)
      const response = await fetch('/api/staff/time-tracking/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const updatedEntry = await response.json()
        setCurrentEntry(null)
        await loadTimeEntries()
        await loadStats()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to check out')
      }
    } catch (error) {
      console.error('Error checking out:', error)
      alert('Failed to check out')
    } finally {
      setCheckingOut(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/staff/time-tracking/export/${session?.user?.id}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&format=csv`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `staff-time-entries-${dateRange.startDate}-${dateRange.endDate}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to export data')
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data')
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
              <p className="text-gray-600">Track your working hours and generate reports</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExport}
                className="flex items-center px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                currentEntry ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {currentEntry ? (
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-gray-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentEntry ? 'Currently Checked In' : 'Not Checked In'}
                </h2>
                <p className="text-gray-600">
                  {currentEntry 
                    ? `Since ${new Date(currentEntry.checkInTime).toLocaleTimeString()}`
                    : 'Click "Check In" to start tracking your time'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {currentEntry ? (
                <button
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  className="flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-all duration-200"
                >
                  <StopIcon className="w-5 h-5 mr-2" />
                  {checkingOut ? 'Checking Out...' : 'Check Out'}
                </button>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                >
                  <PlayIcon className="w-5 h-5 mr-2" />
                  {checkingIn ? 'Checking In...' : 'Check In'}
                </button>
              )}
            </div>
          </div>
          
          {!currentEntry && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your work..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalHours}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Working Days</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalDays}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Hours/Day</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.averageHoursPerDay}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.totalEntries}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TimeIcon className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Time Entries */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.checkInTime).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.duration ? formatDuration(entry.duration) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {timeEntries.length === 0 && (
              <div className="text-center py-12">
                <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries found</h3>
                <p className="text-gray-500">Start tracking your time by checking in.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

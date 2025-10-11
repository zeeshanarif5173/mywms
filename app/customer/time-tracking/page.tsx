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
  ClockIcon as TimeIcon
} from '@heroicons/react/24/outline'

interface TimeEntry {
  id: string
  customerId: string
  checkInTime: string
  checkOutTime?: string
  duration?: number
  date: string
  status: 'Checked In' | 'Checked Out'
  notes?: string
}

export default function TimeTracking() {
  const { data: session } = useSession()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [totalHours, setTotalHours] = useState(0)
  const [todayHours, setTodayHours] = useState(0)

  // Load time entries
  useEffect(() => {
    const loadTimeEntries = async () => {
      try {
        setLoading(true)
        await loadAllTimeEntries()
      } catch (error) {
        console.error('Error loading time entries:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadTimeEntries()
    }
  }, [session])

  // Refresh data when date range changes
  useEffect(() => {
    if (session) {
      loadTimeEntriesForRange()
    }
  }, [dateRange.startDate, dateRange.endDate, session])

  // Load all time entries (for current status)
  const loadAllTimeEntries = async () => {
    try {
      const response = await fetch(`/api/time-tracking/entries/${session?.user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data.entries)
        setCurrentEntry(data.currentEntry)
        setTotalHours(data.totalHours)
        setTodayHours(data.todayHours || 0)
      }
    } catch (error) {
      console.error('Error loading time entries:', error)
    }
  }

  // Load time entries for date range
  const loadTimeEntriesForRange = async () => {
    try {
      setLoading(true)
      // First get current status
      const currentResponse = await fetch(`/api/time-tracking/entries/${session?.user?.id}`)
      if (currentResponse.ok) {
        const currentData = await currentResponse.json()
        setCurrentEntry(currentData.currentEntry)
        setTodayHours(currentData.todayHours || 0)
      }
      
      // Then get filtered entries
      const response = await fetch(
        `/api/time-tracking/entries/${session?.user?.id}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      )
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data.entries)
        setTotalHours(data.totalHours)
      }
    } catch (error) {
      console.error('Error loading time entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true)
      setUpdating(true)
      const response = await fetch('/api/time-tracking/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentEntry(data)
        setNotes('')
        // Reload all data immediately
        await loadAllTimeEntries()
        // Also reload the filtered data for the current date range
        await loadTimeEntriesForRange()
      }
    } catch (error) {
      console.error('Error checking in:', error)
    } finally {
      setCheckingIn(false)
      setUpdating(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true)
      setUpdating(true)
      const response = await fetch('/api/time-tracking/checkout', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setCurrentEntry(null)
        // Reload all data immediately
        await loadAllTimeEntries()
        // Also reload the filtered data for the current date range
        await loadTimeEntriesForRange()
      }
    } catch (error) {
      console.error('Error checking out:', error)
    } finally {
      setCheckingOut(false)
      setUpdating(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch(
        `/api/time-tracking/export/${session?.user?.id}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      )
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `time-tracking-${dateRange.startDate}-to-${dateRange.endDate}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading time tracking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Time Tracking</h1>
                <p className="text-sm text-gray-500">Track your office hours</p>
              </div>
            </div>
            <a
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {updating ? (
                <>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Updating...</h3>
                    <p className="text-sm text-gray-500">Please wait while we update your status</p>
                  </div>
                </>
              ) : currentEntry ? (
                <>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Currently Checked In</h3>
                    <p className="text-sm text-gray-500">
                      Since {formatTime(currentEntry.checkInTime)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <XCircleIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Not Checked In</h3>
                    <p className="text-sm text-gray-500">Click below to check in</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex space-x-3">
              {currentEntry ? (
                <button
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <StopIcon className="w-5 h-5" />
                  <span>{checkingOut ? 'Checking Out...' : 'Check Out'}</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCheckIn}
                    disabled={checkingIn}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>{checkingIn ? 'Checking In...' : 'Check In'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <span className="text-gray-500">to</span>
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={loadTimeEntriesForRange}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Filter
            </button>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <TimeIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Total Hours:</span>
                  <span className="text-lg font-bold text-blue-600">{totalHours.toFixed(2)}h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Today:</span>
                  <span className="text-lg font-bold text-orange-600">{todayHours.toFixed(2)}h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Entries:</span>
                  <span className="text-lg font-bold text-green-600">{timeEntries.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Entries List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Time Entries</h3>
          </div>
          
          {timeEntries.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No time entries found for the selected date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
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
                        {formatTime(entry.checkInTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.checkOutTime ? formatTime(entry.checkOutTime) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.duration ? formatDuration(entry.duration) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.status === 'Checked In' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

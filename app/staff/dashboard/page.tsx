'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ClockIcon,
  UserIcon,
  BellIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface TimeStats {
  totalHours: number
  totalDays: number
  averageHoursPerDay: number
  totalEntries: number
  completedEntries: number
  currentStatus: 'Checked In' | 'Checked Out' | 'Never'
}

export default function StaffDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<TimeStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/staff/time-tracking/export/${session?.user?.id}`)
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadStats()
    }
  }, [session])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
            <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link
            href="/staff/time-tracking"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-blue-300"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Time Tracking</p>
                <p className="text-2xl font-semibold text-gray-900">Track Hours</p>
              </div>
            </div>
          </Link>

          <Link
            href="/staff/profile"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-green-300"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Profile</p>
                <p className="text-2xl font-semibold text-gray-900">Update Info</p>
              </div>
            </div>
          </Link>

          <Link
            href="/staff/notifications"
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-orange-300"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BellIcon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Notifications</p>
                <p className="text-2xl font-semibold text-gray-900">View Updates</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {stats?.currentStatus === 'Checked In' ? (
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                ) : (
                  <ExclamationTriangleIcon className="h-8 w-8 text-gray-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Current Status</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats?.currentStatus === 'Checked In' ? 'Working' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Statistics */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Time Statistics</h2>
              <Link
                href="/staff/time-tracking"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View Details →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalHours}</p>
                <p className="text-sm text-gray-600">Total Hours</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDays}</p>
                <p className="text-sm text-gray-600">Working Days</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ChartBarIcon className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.averageHoursPerDay}</p>
                <p className="text-sm text-gray-600">Avg Hours/Day</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircleIcon className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.completedEntries}</p>
                <p className="text-sm text-gray-600">Completed Sessions</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Time Tracking</h3>
              <p className="text-sm text-gray-600 mb-4">
                Track your working hours, view reports, and export time data.
              </p>
              <Link
                href="/staff/time-tracking"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Go to Time Tracking →
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Profile Management</h3>
              <p className="text-sm text-gray-600 mb-4">
                Update your personal information and account settings.
              </p>
              <Link
                href="/staff/profile"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Update Profile →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

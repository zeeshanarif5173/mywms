'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeComplaints: 0,
    totalBookings: 0,
    todayHours: 0
  })

  const userRole = session?.user?.role || 'CUSTOMER'

  // Load dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        if (userRole === 'CUSTOMER') {
          // Load customer-specific stats
          const [complaintsRes, bookingsRes, timeRes] = await Promise.all([
            fetch(`/api/complaints/list/${session?.user?.id}`),
            fetch(`/api/meeting-rooms/customer-bookings/${session?.user?.id}`),
            fetch(`/api/time-tracking/entries/${session?.user?.id}`)
          ])

          const complaints = complaintsRes.ok ? await complaintsRes.json() : []
          const bookings = bookingsRes.ok ? await bookingsRes.json() : []
          const timeData = timeRes.ok ? await timeRes.json() : { totalHours: 0 }

          setStats({
            totalCustomers: 0,
            activeComplaints: complaints.filter((c: any) => c.status !== 'Resolved').length,
            totalBookings: bookings.filter((b: any) => b.status === 'Confirmed').length,
            todayHours: timeData.todayHours || 0
          })
        } else {
          // Load admin/manager stats
          setStats({
            totalCustomers: 3,
            activeComplaints: 2,
            totalBookings: 5,
            todayHours: 8.5
          })
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    if (session) {
      loadStats()
    }
  }, [session, userRole])

  if (userRole === 'CUSTOMER') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {session?.user?.name}!</h1>
                  <p className="text-gray-600">Here's what's happening with your account today.</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-orange-300"
                onClick={() => router.push('/customer/complaints')}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftRightIcon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Complaints</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeComplaints}</p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-blue-300"
                onClick={() => router.push('/customer/meeting-rooms')}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-green-300"
                onClick={() => router.push('/customer/time-tracking')}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Today's Hours</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.todayHours}</p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-purple-300"
                onClick={() => router.push('/customer/analytics')}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Analytics</p>
                    <p className="text-2xl font-semibold text-gray-900">View</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/customer/complaints/new')}
                  className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium text-orange-900">Submit Complaint</span>
                </button>
                <button
                  onClick={() => router.push('/customer/meeting-rooms')}
                  className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Book Meeting Room</span>
                </button>
                <button
                  onClick={() => router.push('/customer/time-tracking')}
                  className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <ClockIcon className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Track Time</span>
                </button>
                <button
                  onClick={() => router.push('/customer/analytics')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">View Analytics</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Time tracking entry added</span>
                  <span className="text-xs text-gray-400">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Complaint submitted</span>
                  <span className="text-xs text-gray-400">4 hours ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Meeting room booked</span>
                  <span className="text-xs text-gray-400">6 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Dashboard</h1>
      <p className="text-gray-600">Select an option from the sidebar to get started.</p>
    </div>
  )
}
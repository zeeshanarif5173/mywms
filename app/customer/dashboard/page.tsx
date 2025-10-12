'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChatBubbleLeftRightIcon,
  ClockIcon,
  BuildingOfficeIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalComplaints: number
  openComplaints: number
  resolvedComplaints: number
  recentTimeEntries: number
  upcomingBookings: number
  unreadNotifications: number
}

export default function CustomerDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    openComplaints: 0,
    resolvedComplaints: 0,
    recentTimeEntries: 0,
    upcomingBookings: 0,
    unreadNotifications: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true)
        
        // Load customer-specific stats
        const customerId = session?.user?.id || '1'
        
        // Fetch complaints stats
        const complaintsResponse = await fetch(`/api/complaints/list/${customerId}`)
        if (complaintsResponse.ok) {
          const complaints = await complaintsResponse.json()
          setStats(prev => ({
            ...prev,
            totalComplaints: complaints.length,
            openComplaints: complaints.filter((c: any) => c.status !== 'Resolved').length,
            resolvedComplaints: complaints.filter((c: any) => c.status === 'Resolved').length
          }))
        }
        
        // TODO: Add other stats when APIs are available
        // - Time tracking stats
        // - Meeting room bookings
        // - Notifications
        
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadDashboardStats()
    }
  }, [session])

  const quickActions = [
    {
      name: 'Submit Complaint',
      href: '/customer/complaints',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-red-500',
      description: 'Report issues or request assistance'
    },
    {
      name: 'Time Tracking',
      href: '/customer/time-tracking',
      icon: ClockIcon,
      color: 'bg-blue-500',
      description: 'Check in/out and view time records'
    },
    {
      name: 'Book Meeting Room',
      href: '/customer/meeting-rooms',
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
      description: 'Reserve meeting rooms and spaces'
    },
    {
      name: 'View Notifications',
      href: '/customer/notifications',
      icon: BellIcon,
      color: 'bg-purple-500',
      description: 'Check updates and announcements'
    }
  ]

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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {session?.user?.name}! Here's what's happening with your account.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Complaints</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Open Issues</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.openComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Resolved</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.resolvedComplaints}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.name}
                  href={action.href}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center mb-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="ml-3 text-sm font-medium text-gray-900">{action.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your recent actions and updates will appear here.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

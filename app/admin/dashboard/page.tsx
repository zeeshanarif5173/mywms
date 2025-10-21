'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  UserGroupIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  PauseIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface DashboardStats {
  // User Statistics
  totalCustomers: number
  activeCustomers: number
  lockedCustomers: number
  
  // Complaint Statistics
  totalComplaints: number
  openComplaints: number
  inProcessComplaints: number
  resolvedComplaints: number
  
  // Task Statistics
  totalTasks: number
  pendingTasks: number
  completedTasks: number
  
  // Booking Statistics
  totalBookings: number
  activeBookings: number
  
  // Time Tracking Statistics
  totalTimeEntries: number
  totalHours: number
  
  // Revenue Statistics
  totalRevenue: number
  
  // Additional Data
  topCustomers: Array<{
    id: string
    name: string
    hours: number
  }>
  recentActivity: Array<{
    id: string
    type: string
    title: string
    customer: string
    status: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    lockedCustomers: 0,
    totalComplaints: 0,
    openComplaints: 0,
    inProcessComplaints: 0,
    resolvedComplaints: 0,
    totalTasks: 0,
    pendingTasks: 0,
    completedTasks: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalTimeEntries: 0,
    totalHours: 0,
    totalRevenue: 0,
    topCustomers: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/dashboard-stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error('Failed to fetch dashboard stats')
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    // User Statistics
    {
      name: 'Total Customers',
      value: stats.totalCustomers,
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-blue-500',
      subtitle: `${stats.activeCustomers} active, ${stats.lockedCustomers} locked`
    },
    {
      name: 'Active Customers',
      value: stats.activeCustomers,
      icon: CheckCircleIcon,
      href: '/admin/users',
      color: 'bg-green-500',
      subtitle: 'Currently active accounts'
    },
    
    // Complaint Statistics
    {
      name: 'Open Complaints',
      value: stats.openComplaints,
      icon: ExclamationTriangleIcon,
      href: '/admin/complaints',
      color: 'bg-red-500',
      subtitle: `${stats.totalComplaints} total complaints`
    },
    {
      name: 'In Process',
      value: stats.inProcessComplaints,
      icon: WrenchScrewdriverIcon,
      href: '/admin/complaints',
      color: 'bg-yellow-500',
      subtitle: 'Being worked on'
    },
    {
      name: 'Resolved',
      value: stats.resolvedComplaints,
      icon: CheckCircleIcon,
      href: '/admin/complaints',
      color: 'bg-green-500',
      subtitle: 'Successfully resolved'
    },
    
    // Task Statistics
    {
      name: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: ClockIcon,
      href: '/admin/tasks',
      color: 'bg-orange-500',
      subtitle: `${stats.totalTasks} total tasks`
    },
    {
      name: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircleIcon,
      href: '/admin/tasks',
      color: 'bg-green-500',
      subtitle: 'Successfully completed'
    },
    
    // Booking Statistics
    {
      name: 'Active Bookings',
      value: stats.activeBookings,
      icon: BuildingOfficeIcon,
      href: '/admin/meeting-rooms/bookings',
      color: 'bg-purple-500',
      subtitle: `${stats.totalBookings} total bookings`
    },
    
    // Time Tracking
    {
      name: 'Total Hours',
      value: `${stats.totalHours}h`,
      icon: ClockIcon,
      href: '/admin/staff-attendance',
      color: 'bg-indigo-500',
      subtitle: `${stats.totalTimeEntries} time entries`
    },
    
    // Revenue
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      href: '/admin/analytics',
      color: 'bg-yellow-500',
      subtitle: 'From all packages'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {session?.user?.name || session?.user?.email}! Here's an overview of your system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.name}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <EyeIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.name}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{card.value}</p>
              <p className="text-xs text-gray-500">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Top Customers</h2>
            <ArrowTrendingUpIcon className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.topCustomers.length > 0 ? (
              stats.topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">Customer ID: {customer.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{customer.hours}h</p>
                    <p className="text-xs text-gray-500">Total time</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No time tracking data available</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            <ClockIcon className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'Open' ? 'bg-red-100' :
                    activity.status === 'In Process' ? 'bg-yellow-100' :
                    activity.status === 'Resolved' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <ExclamationTriangleIcon className={`w-4 h-4 ${
                      activity.status === 'Open' ? 'text-red-600' :
                      activity.status === 'In Process' ? 'text-yellow-600' :
                      activity.status === 'Resolved' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">by {activity.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      activity.status === 'Open' ? 'bg-red-100 text-red-800' :
                      activity.status === 'In Process' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/users"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <UserGroupIcon className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">Manage Users</span>
          </Link>
          <Link
            href="/admin/complaints"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            <span className="font-medium text-gray-900">View Complaints</span>
          </Link>
          <Link
            href="/admin/tasks"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ClockIcon className="w-5 h-5 text-green-600" />
            <span className="font-medium text-gray-900">Manage Tasks</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-gray-900">View Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

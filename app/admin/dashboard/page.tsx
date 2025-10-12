'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  UserGroupIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalComplaints: number
  totalTasks: number
  totalBookings: number
  totalRevenue: number
  totalBranches: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalComplaints: 0,
    totalTasks: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalBranches: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        // Since we've simplified the API routes to return mock data,
        // we'll set some basic mock stats for the dashboard
        setStats({
          totalUsers: 25,
          totalComplaints: 8,
          totalTasks: 15,
          totalBookings: 12,
          totalRevenue: 45000,
          totalBranches: 3
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      name: 'Complaints',
      value: stats.totalComplaints,
      icon: ExclamationTriangleIcon,
      href: '/admin/complaints',
      color: 'bg-red-500'
    },
    {
      name: 'Tasks',
      value: stats.totalTasks,
      icon: ClockIcon,
      href: '/admin/tasks',
      color: 'bg-green-500'
    },
    {
      name: 'Bookings',
      value: stats.totalBookings,
      icon: BuildingOfficeIcon,
      href: '/admin/meeting-rooms/bookings',
      color: 'bg-purple-500'
    },
    {
      name: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'bg-yellow-500'
    },
    {
      name: 'Branches',
      value: stats.totalBranches,
      icon: DocumentTextIcon,
      href: '/admin/branches',
      color: 'bg-indigo-500'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.name}
            href={card.href}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
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

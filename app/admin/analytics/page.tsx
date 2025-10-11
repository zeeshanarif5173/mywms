'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import {
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

interface AnalyticsData {
  totalCustomers: number
  activeCustomers: number
  lockedCustomers: number
  totalBookings: number
  totalRevenue: number
  averageSessionTime: number
  customerGrowth: number
  bookingGrowth: number
  revenueGrowth: number
  thisMonthBookings: number
  lastMonthBookings: number
  thisMonthCustomers: number
  peakHours: string
  mostPopularRoom: string
  churnRate: number
  avgLifetimeValue: number
  retentionRate: number
  systemPerformance: {
    uptime: number
    avgResponseTime: number
    activeSessions: number
    serverLoad: string
  }
  bookingBreakdown: {
    confirmed: number
    completed: number
    cancelled: number
  }
}

export default function AdminAnalytics() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCustomers: 0,
    activeCustomers: 0,
    lockedCustomers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageSessionTime: 0,
    customerGrowth: 0,
    bookingGrowth: 0,
    revenueGrowth: 0,
    thisMonthBookings: 0,
    lastMonthBookings: 0,
    thisMonthCustomers: 0,
    peakHours: '',
    mostPopularRoom: '',
    churnRate: 0,
    avgLifetimeValue: 0,
    retentionRate: 0,
    systemPerformance: {
      uptime: 0,
      avgResponseTime: 0,
      activeSessions: 0,
      serverLoad: ''
    },
    bookingBreakdown: {
      confirmed: 0,
      completed: 0,
      cancelled: 0
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/analytics')
        
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data)
        } else {
          console.error('Failed to fetch analytics:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchAnalytics()
    }
  }, [session])

  const stats = [
    {
      name: 'Total Customers',
      value: analytics.totalCustomers,
      change: analytics.customerGrowth,
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      name: 'Active Customers',
      value: analytics.activeCustomers,
      change: 89.1,
      changeType: 'increase',
      icon: UserGroupIcon,
      color: 'green'
    },
    {
      name: 'Total Bookings',
      value: analytics.totalBookings,
      change: analytics.bookingGrowth,
      changeType: 'increase',
      icon: BuildingOfficeIcon,
      color: 'purple'
    },
    {
      name: 'Total Revenue',
      value: `Rs ${analytics.totalRevenue.toLocaleString()}`,
      change: analytics.revenueGrowth,
      changeType: 'increase',
      icon: BanknotesIcon,
      color: 'yellow'
    },
    {
      name: 'Avg Session Time',
      value: `${analytics.averageSessionTime}h`,
      change: -2.1,
      changeType: 'decrease',
      icon: ClockIcon,
      color: 'indigo'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into your coworking space performance</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`ml-1 text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.abs(stat.change)}%
                    </span>
                    <span className="ml-1 text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart would be displayed here</p>
            </div>
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ArrowTrendingUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Customer growth chart would be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">This Month</span>
              <span className="font-semibold text-gray-900">{analytics.thisMonthBookings} bookings</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Month</span>
              <span className="font-semibold text-gray-900">{analytics.lastMonthBookings} bookings</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Peak Hours</span>
              <span className="font-semibold text-gray-900">{analytics.peakHours || '10:00 AM'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Most Popular Room</span>
              <span className="font-semibold text-gray-900">{analytics.mostPopularRoom || 'Conference Room A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confirmed Bookings</span>
              <span className="font-semibold text-gray-900">{analytics.bookingBreakdown.confirmed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed Bookings</span>
              <span className="font-semibold text-gray-900">{analytics.bookingBreakdown.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cancelled Bookings</span>
              <span className="font-semibold text-gray-900">{analytics.bookingBreakdown.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Customer Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New This Month</span>
              <span className="font-semibold text-gray-900">{analytics.thisMonthCustomers} customers</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Customers</span>
              <span className="font-semibold text-gray-900">{analytics.activeCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Locked Customers</span>
              <span className="font-semibold text-gray-900">{analytics.lockedCustomers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Churn Rate</span>
              <span className="font-semibold text-gray-900">{analytics.churnRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Lifetime Value</span>
              <span className="font-semibold text-gray-900">Rs {analytics.avgLifetimeValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Retention Rate</span>
              <span className="font-semibold text-gray-900">{analytics.retentionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="font-semibold text-green-600">{analytics.systemPerformance.uptime}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Response Time</span>
              <span className="font-semibold text-gray-900">{analytics.systemPerformance.avgResponseTime}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Sessions</span>
              <span className="font-semibold text-gray-900">{analytics.systemPerformance.activeSessions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Server Load</span>
              <span className={`font-semibold ${
                analytics.systemPerformance.serverLoad === 'Low' ? 'text-green-600' : 
                analytics.systemPerformance.serverLoad === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {analytics.systemPerformance.serverLoad}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
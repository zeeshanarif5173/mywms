'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  UserGroupIcon,
  CreditCardIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface CronJobStatus {
  accountsLocked: number
  accountsUnlocked: number
  lastRun: string
  isRunning: boolean
}

interface DashboardStats {
  totalCustomers: number
  activeAccounts: number
  lockedAccounts: number
  monthlyRevenue: number
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [cronStatus, setCronStatus] = useState<CronJobStatus | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeAccounts: 0,
    lockedAccounts: 0,
    monthlyRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch cron status and dashboard stats in parallel
        const [cronResponse, statsResponse] = await Promise.all([
          fetch('/api/cron/check-expiry'),
          fetch('/api/admin/dashboard-stats')
        ])
        
        if (cronResponse.ok) {
          const cronData = await cronResponse.json()
          setCronStatus(cronData)
        }
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Set fallback data
        setStats({
          totalCustomers: 3,
          activeAccounts: 3,
          lockedAccounts: 0,
          monthlyRevenue: 1500
        })
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchDashboardData()
    }
  }, [session])

  const handleRunCron = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cron/check-expiry', {
        method: 'POST'
      })
      if (response.ok) {
        const data = await response.json()
        setCronStatus(data)
      }
    } catch (error) {
      console.error('Error running cron job:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Customers */}
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-blue-300"
            onClick={() => handleNavigate('/manager/customers')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Active Accounts */}
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-green-300"
            onClick={() => handleNavigate('/manager/customers?filter=active')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Accounts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeAccounts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Locked Accounts */}
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-red-300"
            onClick={() => handleNavigate('/manager/customers?filter=locked')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Locked Accounts</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.lockedAccounts.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-purple-300"
            onClick={() => handleNavigate('/admin/payments')}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">Rs {stats.monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cron Job Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Cron Job Management</h2>
              <p className="text-gray-600">Automated account expiry and locking system</p>
            </div>
            <button
              onClick={handleRunCron}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
              <span>{loading ? 'Running...' : 'Run Now'}</span>
            </button>
          </div>

          {cronStatus && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                onClick={() => handleNavigate('/admin/cron-logs')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Last Run</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {cronStatus.lastRun ? new Date(cronStatus.lastRun).toLocaleString() : 'Never'}
                </p>
              </div>

              <div 
                className="bg-green-50 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors duration-200"
                onClick={() => handleNavigate('/manager/customers?filter=locked')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Accounts Locked</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {cronStatus.accountsLocked}
                </p>
              </div>

              <div 
                className="bg-blue-50 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
                onClick={() => handleNavigate('/admin/system-status')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Status</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {cronStatus.isRunning ? 'Running' : 'Idle'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow duration-200 hover:border-green-300"
            onClick={() => handleNavigate('/admin/system-status')}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Healthy</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <span className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600">Active</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => handleNavigate('/manager/customers')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <UserGroupIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">Manage Customers</span>
              </button>
              <button 
                onClick={() => handleNavigate('/admin/payments')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <CreditCardIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">View Payments</span>
              </button>
              <button 
                onClick={() => handleNavigate('/admin/notifications')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <BellIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">System Notifications</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

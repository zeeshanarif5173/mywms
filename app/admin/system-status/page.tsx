'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircleIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CpuChipIcon,
  ServerIcon,
  CloudIcon
} from '@heroicons/react/24/outline'

export default function AdminSystemStatus() {
  const { data: session } = useSession()
  const router = useRouter()
  const [systemStatus, setSystemStatus] = useState({
    database: 'Healthy',
    apiServices: 'Online',
    emailService: 'Active',
    serverUptime: '99.9%',
    cpuUsage: '45%',
    memoryUsage: '62%',
    diskUsage: '78%'
  })

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, router])

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

  const getStatusColor = (status: string) => {
    if (status === 'Healthy' || status === 'Online' || status === 'Active') {
      return 'text-green-600'
    }
    if (status.includes('%') && parseInt(status) > 80) {
      return 'text-red-600'
    }
    if (status.includes('%') && parseInt(status) > 60) {
      return 'text-yellow-600'
    }
    return 'text-green-600'
  }

  const getStatusIcon = (status: string) => {
    if (status === 'Healthy' || status === 'Online' || status === 'Active') {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />
    }
    return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
              <p className="text-gray-600">Monitor system health and performance</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ServerIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Database</p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.database)}
                  <span className={`text-sm font-semibold ${getStatusColor(systemStatus.database)}`}>
                    {systemStatus.database}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CloudIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">API Services</p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.apiServices)}
                  <span className={`text-sm font-semibold ${getStatusColor(systemStatus.apiServices)}`}>
                    {systemStatus.apiServices}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Email Service</p>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(systemStatus.emailService)}
                  <span className={`text-sm font-semibold ${getStatusColor(systemStatus.emailService)}`}>
                    {systemStatus.emailService}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CpuChipIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">CPU Usage</span>
                </div>
                <span className={`text-sm font-semibold ${getStatusColor(systemStatus.cpuUsage)}`}>
                  {systemStatus.cpuUsage}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ServerIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Memory Usage</span>
                </div>
                <span className={`text-sm font-semibold ${getStatusColor(systemStatus.memoryUsage)}`}>
                  {systemStatus.memoryUsage}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ServerIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Disk Usage</span>
                </div>
                <span className={`text-sm font-semibold ${getStatusColor(systemStatus.diskUsage)}`}>
                  {systemStatus.diskUsage}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Uptime Information</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Server Uptime</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  {systemStatus.serverUptime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">Last Restart</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  7 days ago
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-600">System Status</span>
                </div>
                <span className="text-sm font-semibold text-green-600">
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Health Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Summary</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="text-sm font-semibold text-green-800">All Systems Operational</h4>
                <p className="text-sm text-green-700">
                  All critical services are running normally. No issues detected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


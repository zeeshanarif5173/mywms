'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ClockIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface CronLog {
  id: string
  jobName: string
  status: string
  startTime: string
  endTime: string
  duration: string
  accountsLocked: number
  notificationsSent: number
  message: string
}

export default function AdminCronLogs() {
  const { data: session } = useSession()
  const router = useRouter()
  const [cronLogs, setCronLogs] = useState<CronLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    // Mock cron log data
    const mockLogs = [
      {
        id: '1',
        jobName: 'Package Expiry Check',
        status: 'Completed',
        startTime: '2025-01-08T16:24:36Z',
        endTime: '2025-01-08T16:24:42Z',
        duration: '6s',
        accountsLocked: 1,
        notificationsSent: 0,
        message: 'Package expiry check completed successfully'
      },
      {
        id: '2',
        jobName: 'Package Expiry Check',
        status: 'Completed',
        startTime: '2025-01-08T15:24:36Z',
        endTime: '2025-01-08T15:24:41Z',
        duration: '5s',
        accountsLocked: 0,
        notificationsSent: 2,
        message: 'Package expiry check completed. 2 notifications sent.'
      },
      {
        id: '3',
        jobName: 'Package Expiry Check',
        status: 'Failed',
        startTime: '2025-01-08T14:24:36Z',
        endTime: '2025-01-08T14:24:38Z',
        duration: '2s',
        accountsLocked: 0,
        notificationsSent: 0,
        message: 'Database connection failed'
      }
    ]
    
    setCronLogs(mockLogs)
    setLoading(false)
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

  const getStatusIcon = (status: string) => {
    if (status === 'Completed') {
      return <CheckCircleIcon className="w-5 h-5 text-green-600" />
    }
    return <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
  }

  const getStatusColor = (status: string) => {
    if (status === 'Completed') {
      return 'bg-green-100 text-green-800'
    }
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cron Job Logs</h1>
                <p className="text-gray-600">View automated job execution history</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Run Now</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-2xl font-bold text-gray-900">{cronLogs.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cronLogs.filter((log: any) => log.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cronLogs.filter((log: any) => log.status === 'Failed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cron Logs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Execution History</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {cronLogs.map((log: any) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(log.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {log.jobName}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">
                        {log.message}
                      </p>
                      <div className="mt-2 flex items-center space-x-6 text-sm text-gray-500">
                        <span>Started: {new Date(log.startTime).toLocaleString()}</span>
                        <span>Duration: {log.duration}</span>
                        {log.accountsLocked > 0 && (
                          <span className="text-red-600">Accounts Locked: {log.accountsLocked}</span>
                        )}
                        {log.notificationsSent > 0 && (
                          <span className="text-blue-600">Notifications: {log.notificationsSent}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>{new Date(log.endTime).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}


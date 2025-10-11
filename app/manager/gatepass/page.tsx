'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { 
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Customer {
  id: string
  name: string
  email: string
  gatePassId: string
  accountStatus: 'ACTIVE' | 'LOCKED'
  packageId?: string
  companyName?: string
}

interface GatePassValidation {
  valid: boolean
  status: 'ACTIVE' | 'LOCKED' | 'INVALID'
  message: string
  customer?: Customer
  accessTime?: string
}

export default function ManagerGatePass() {
  const { data: session } = useSession()
  const [gatePassId, setGatePassId] = useState('')
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<GatePassValidation | null>(null)
  const [scanHistory, setScanHistory] = useState<GatePassValidation[]>([])

  const handleValidateGatePass = async () => {
    if (!gatePassId.trim()) {
      alert('Please enter a Gate Pass ID')
      return
    }

    try {
      setValidating(true)
      const response = await fetch(`/api/gatepass/validate/${gatePassId.trim()}`)
      
      if (response.ok) {
        const result = await response.json()
        setValidationResult(result)
        setScanHistory(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 scans
      } else {
        const error = await response.json()
        const errorResult = {
          valid: false,
          status: 'INVALID' as const,
          message: error.error || 'Validation failed'
        }
        setValidationResult(errorResult)
        setScanHistory(prev => [errorResult, ...prev.slice(0, 9)])
      }
    } catch (error) {
      console.error('Error validating gate pass:', error)
      const errorResult = {
        valid: false,
        status: 'INVALID' as const,
        message: 'Network error during validation'
      }
      setValidationResult(errorResult)
      setScanHistory(prev => [errorResult, ...prev.slice(0, 9)])
    } finally {
      setValidating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidateGatePass()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'LOCKED':
        return <XCircleIcon className="w-6 h-6 text-red-500" />
      case 'INVALID':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'LOCKED':
        return 'bg-red-100 text-red-800'
      case 'INVALID':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 border-green-200'
      case 'LOCKED':
        return 'bg-red-50 border-red-200'
      case 'INVALID':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gate Pass Scanner</h1>
              <p className="text-gray-600">Validate customer access at the entrance</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Role: {session?.user?.role}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Interface */}
          <div className="space-y-6">
            {/* Scanner Input */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Gate Pass</h2>
              <div className="space-y-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter or scan Gate Pass ID..."
                    value={gatePassId}
                    onChange={(e) => setGatePassId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleValidateGatePass}
                  disabled={validating || !gatePassId.trim()}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {validating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <QrCodeIcon className="w-5 h-5" />
                      <span>Validate Access</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className={`rounded-2xl p-6 shadow-sm border ${getStatusBgColor(validationResult.status)}`}>
                <div className="flex items-center space-x-3 mb-4">
                  {getStatusIcon(validationResult.status)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {validationResult.valid ? 'Access Granted' : 'Access Denied'}
                    </h3>
                    <p className="text-sm text-gray-600">{validationResult.message}</p>
                  </div>
                </div>

                {validationResult.customer && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="font-medium text-gray-900">{validationResult.customer.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Gate Pass ID</p>
                        <p className="font-mono font-medium text-gray-900">{validationResult.customer.gatePassId}</p>
                      </div>
                    </div>
                    {validationResult.customer.companyName && (
                      <div className="flex items-center space-x-3">
                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Company</p>
                          <p className="font-medium text-gray-900">{validationResult.customer.companyName}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(validationResult.customer.accountStatus)}`}>
                        {validationResult.customer.accountStatus}
                      </span>
                    </div>
                  </div>
                )}

                {validationResult.accessTime && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Scanned at: {new Date(validationResult.accessTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Scan History */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Scans</h2>
              {scanHistory.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanHistory.map((scan, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getStatusBgColor(scan.status)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(scan.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                            {scan.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {scan.accessTime ? new Date(scan.accessTime).toLocaleTimeString() : 'Just now'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{scan.message}</p>
                      {scan.customer && (
                        <p className="text-xs text-gray-500 mt-1">
                          {scan.customer.name} ({scan.customer.gatePassId})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <QrCodeIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No scans yet</p>
                  <p className="text-sm text-gray-400">Start scanning gate passes to see history</p>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {scanHistory.filter(s => s.valid).length}
                  </p>
                  <p className="text-sm text-gray-500">Successful</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {scanHistory.filter(s => !s.valid).length}
                  </p>
                  <p className="text-sm text-gray-500">Denied</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Scanner Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">For QR Code Scanners:</h4>
              <ul className="space-y-1">
                <li>• Point scanner at customer's QR code</li>
                <li>• Wait for automatic validation</li>
                <li>• Check the result on screen</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">For Manual Entry:</h4>
              <ul className="space-y-1">
                <li>• Ask customer for Gate Pass ID</li>
                <li>• Type or scan the ID</li>
                <li>• Press Enter or click Validate</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Access Control:</h4>
              <ul className="space-y-1">
                <li>• Green = Access Granted</li>
                <li>• Red = Access Denied</li>
                <li>• Check account status if denied</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

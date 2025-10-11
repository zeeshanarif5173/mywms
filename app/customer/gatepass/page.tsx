'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ArrowPathIcon as RefreshIcon,
  EyeIcon,
  EyeSlashIcon
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

export default function CustomerGatePass() {
  const { data: session } = useSession()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<GatePassValidation | null>(null)
  const [showQR, setShowQR] = useState(true)

  // Load customer data
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true)
        // Mock customer data for demo
        const mockCustomer: Customer = {
          id: session?.user?.id || '1',
          name: session?.user?.name || 'John Smith',
          email: session?.user?.email || 'john@example.com',
          gatePassId: 'GP-123456',
          accountStatus: 'ACTIVE',
          packageId: 'PKG-001',
          companyName: 'TechCorp'
        }
        setCustomer(mockCustomer)
      } catch (error) {
        console.error('Error loading customer:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadCustomer()
    }
  }, [session])

  const handleValidateGatePass = async () => {
    if (!customer) return

    try {
      setValidating(true)
      const response = await fetch(`/api/gatepass/validate/${customer.gatePassId}`)
      
      if (response.ok) {
        const result = await response.json()
        setValidationResult(result)
      } else {
        const error = await response.json()
        setValidationResult({
          valid: false,
          status: 'INVALID',
          message: error.error || 'Validation failed'
        })
      }
    } catch (error) {
      console.error('Error validating gate pass:', error)
      setValidationResult({
        valid: false,
        status: 'INVALID',
        message: 'Network error during validation'
      })
    } finally {
      setValidating(false)
    }
  }

  const generateQRCode = (gatePassId: string) => {
    // In a real application, you would use a QR code library like 'qrcode'
    // For demo purposes, we'll return a placeholder
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${gatePassId}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'LOCKED':
        return <XCircleIcon className="w-6 h-6 text-red-500" />
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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h2>
          <p className="text-gray-600">Unable to load customer information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gate Pass</h1>
              <p className="text-gray-600">Your digital access card for the coworking space</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(customer.accountStatus)}`}>
                {customer.accountStatus}
              </span>
              <button
                onClick={handleValidateGatePass}
                disabled={validating}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                {validating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Validating...</span>
                  </>
                ) : (
                  <>
                    <RefreshIcon className="w-4 h-4" />
                    <span>Validate Access</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gate Pass Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCodeIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Digital Gate Pass</h2>
              <p className="text-gray-600">Scan this QR code at the entrance</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              {showQR ? (
                <div className="relative">
                  <img
                    src={generateQRCode(customer.gatePassId)}
                    alt="Gate Pass QR Code"
                    className="w-48 h-48 border-4 border-gray-200 rounded-xl"
                  />
                  {customer.accountStatus === 'LOCKED' && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-75 rounded-xl flex items-center justify-center">
                      <XCircleIcon className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  <EyeSlashIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Gate Pass ID */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-2">Gate Pass ID</p>
              <p className="text-2xl font-mono font-bold text-gray-900">{customer.gatePassId}</p>
            </div>

            {/* Toggle QR Code */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowQR(!showQR)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                {showQR ? (
                  <>
                    <EyeSlashIcon className="w-4 h-4" />
                    <span>Hide QR Code</span>
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-4 h-4" />
                    <span>Show QR Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Customer Information & Status */}
          <div className="space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Gate Pass ID</p>
                    <p className="font-mono font-medium text-gray-900">{customer.gatePassId}</p>
                  </div>
                </div>
                {customer.companyName && (
                  <div className="flex items-center space-x-3">
                    <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium text-gray-900">{customer.companyName}</p>
                    </div>
                  </div>
                )}
                {customer.packageId && (
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Package</p>
                      <p className="font-medium text-gray-900">{customer.packageId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h3>
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(customer.accountStatus)}
                <div>
                  <p className="font-medium text-gray-900">{customer.accountStatus}</p>
                  <p className="text-sm text-gray-500">
                    {customer.accountStatus === 'ACTIVE' 
                      ? 'Gate pass access is enabled' 
                      : 'Gate pass access is blocked'
                    }
                  </p>
                </div>
              </div>
              
              {customer.accountStatus === 'LOCKED' && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">
                    Your account has been locked. Please contact support to restore access.
                  </p>
                </div>
              )}
            </div>

            {/* Validation Result */}
            {validationResult && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Last Validation</h3>
                <div className="flex items-center space-x-3 mb-4">
                  {getStatusIcon(validationResult.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {validationResult.valid ? 'Access Granted' : 'Access Denied'}
                    </p>
                    <p className="text-sm text-gray-500">{validationResult.message}</p>
                  </div>
                </div>
                
                {validationResult.accessTime && (
                  <p className="text-xs text-gray-500">
                    Validated at: {new Date(validationResult.accessTime).toLocaleString()}
                  </p>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Use</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <span className="font-bold">1.</span>
                  <span>Show this QR code to the security scanner at the entrance</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">2.</span>
                  <span>Wait for the green light to confirm access</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-bold">3.</span>
                  <span>If your account is locked, contact support immediately</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

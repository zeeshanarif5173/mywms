'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon,
  PlusIcon,
  ArrowDownTrayIcon as DownloadIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface ContractRequest {
  id: string
  customerId: string
  status: 'Pending' | 'Completed'
  requestedAt: string
  uploadedAt?: string
  contractFileName?: string
  contractFileUrl?: string
  uploadedBy?: string
}

export default function CustomerContracts() {
  const { data: session } = useSession()
  const [contractRequests, setContractRequests] = useState<ContractRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  // Load contract requests
  useEffect(() => {
    const loadContractRequests = async () => {
      try {
        setLoading(true)
        const customerId = session?.user?.id || '1'
        const response = await fetch(`/api/contracts/request/${customerId}`)
        
        if (response.ok) {
          const requests = await response.json()
          setContractRequests(requests)
        }
      } catch (error) {
        console.error('Error loading contract requests:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadContractRequests()
    }
  }, [session])

  const handleCreateRequest = async () => {
    try {
      setCreating(true)
      const customerId = session?.user?.id || '1'
      const response = await fetch(`/api/contracts/request/${customerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const newRequest = await response.json()
        setContractRequests([newRequest, ...contractRequests])
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create contract request')
      }
    } catch (error) {
      console.error('Error creating contract request:', error)
      alert('Failed to create contract request')
    } finally {
      setCreating(false)
    }
  }

  const handleDownloadContract = async (requestId: string) => {
    try {
      setDownloading(requestId)
      const response = await fetch(`/api/contracts/download/${requestId}`)
      
      if (response.ok) {
        const data = await response.json()
        // In a real application, you would trigger the actual file download
        // For demo purposes, we'll show a success message
        alert(`Contract downloaded: ${data.fileName}`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to download contract')
      }
    } catch (error) {
      console.error('Error downloading contract:', error)
      alert('Failed to download contract')
    } finally {
      setDownloading(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      case 'Completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const pendingRequests = contractRequests.filter(r => r.status === 'Pending').length
  const completedRequests = contractRequests.filter(r => r.status === 'Completed').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Contract Requests</h1>
              <p className="text-gray-600">Request and download your contract documents</p>
            </div>
            <button
              onClick={handleCreateRequest}
              disabled={creating}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  <span>Request Contract Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{contractRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedRequests}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Contract Requests List */}
        <div className="space-y-4">
          {contractRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Contract Request #{request.id}</h3>
                    <p className="text-sm text-gray-600">
                      {request.status === 'Completed' ? 'Contract ready for download' : 'Awaiting manager upload'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Requested</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                </div>
                {request.uploadedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Uploaded</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(request.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {request.uploadedBy && (
                  <div>
                    <p className="text-xs text-gray-500">Uploaded By</p>
                    <p className="text-sm font-medium text-gray-900">{request.uploadedBy}</p>
                  </div>
                )}
              </div>

              {request.contractFileName && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">{request.contractFileName}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  {request.status === 'Completed' && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Ready for download
                    </span>
                  )}
                  {request.status === 'Pending' && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Awaiting upload
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {request.status === 'Completed' && (
                    <button
                      onClick={() => handleDownloadContract(request.id)}
                      disabled={downloading === request.id}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                    >
                      {downloading === request.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="w-4 h-4" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // Show contract details
                    }}
                    className="px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {contractRequests.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contract requests</h3>
            <p className="text-gray-500 mb-6">Click "Request Contract Copy" to create your first request.</p>
            <button
              onClick={handleCreateRequest}
              disabled={creating}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 mx-auto disabled:opacity-50"
            >
              {creating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5" />
                  <span>Request Contract Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

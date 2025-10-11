'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface ContractRequest {
  id: string
  customerId: string
  customerName?: string
  customerEmail?: string
  status: 'Pending' | 'Completed'
  requestedAt: string
  uploadedAt?: string
  contractFileName?: string
  contractFileUrl?: string
  uploadedBy?: string
}

export default function ManagerContracts() {
  const { data: session } = useSession()
  const [contractRequests, setContractRequests] = useState<ContractRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedRequest, setSelectedRequest] = useState<ContractRequest | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Form data for uploading contracts
  const [uploadData, setUploadData] = useState({
    contract: null as File | null
  })

  // Load contract requests
  useEffect(() => {
    const loadContractRequests = async () => {
      try {
        setLoading(true)
        // Mock data for demo - in real app, you'd fetch from API
        const mockRequests: ContractRequest[] = [
          {
            id: '1',
            customerId: '1',
            customerName: 'John Smith',
            customerEmail: 'john@example.com',
            status: 'Pending',
            requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedAt: undefined,
            contractFileName: undefined,
            contractFileUrl: undefined,
            uploadedBy: undefined
          },
          {
            id: '2',
            customerId: '2',
            customerName: 'Jane Doe',
            customerEmail: 'jane@example.com',
            status: 'Completed',
            requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            contractFileName: 'contract_2024_001.pdf',
            contractFileUrl: '/uploads/contracts/contract_2024_001.pdf',
            uploadedBy: 'manager@example.com'
          },
          {
            id: '3',
            customerId: '3',
            customerName: 'Bob Wilson',
            customerEmail: 'bob@example.com',
            status: 'Pending',
            requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            uploadedAt: undefined,
            contractFileName: undefined,
            contractFileUrl: undefined,
            uploadedBy: undefined
          }
        ]
        setContractRequests(mockRequests)
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

  const handleUploadContract = async () => {
    if (!selectedRequest || !uploadData.contract) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('contract', uploadData.contract)

      const response = await fetch(`/api/contracts/upload/${selectedRequest.id}`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const updatedRequest = await response.json()
        setContractRequests(contractRequests.map(r => 
          r.id === selectedRequest.id ? updatedRequest : r
        ))
        setShowUploadModal(false)
        setSelectedRequest(null)
        setUploadData({ contract: null })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload contract')
      }
    } catch (error) {
      console.error('Error uploading contract:', error)
      alert('Failed to upload contract')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadData(prev => ({
        ...prev,
        contract: file
      }))
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

  const filteredRequests = contractRequests.filter(request => {
    const matchesSearch = request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
              <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
              <p className="text-gray-600">Manage customer contract requests and uploads</p>
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
                <p className="text-sm font-medium text-gray-600">Pending Upload</p>
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

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contract requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="ALL">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contract Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(request.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">Request #{request.id}</h3>
                    <p className="text-sm text-gray-600">
                      {request.customerName} ({request.customerEmail})
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  {request.status === 'Pending' && (
                    <button
                      onClick={() => {
                        setSelectedRequest(request)
                        setShowUploadModal(true)
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <ArrowUpTrayIcon className="w-4 h-4" />
                      <span>Upload Contract</span>
                    </button>
                  )}
                </div>
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
                      Contract uploaded
                    </span>
                  )}
                  {request.status === 'Pending' && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Awaiting upload
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    // Show request details
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contract requests found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>

      {/* Upload Contract Modal */}
      {showUploadModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Upload Contract</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Upload contract for Request #{selectedRequest.id}
                </p>
                <p className="text-sm text-gray-500">
                  Customer: {selectedRequest.customerName} ({selectedRequest.customerEmail})
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contract File (PDF only)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="input-field"
                />
                {uploadData.contract && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {uploadData.contract.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadContract}
                  disabled={!uploadData.contract || uploading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Contract'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

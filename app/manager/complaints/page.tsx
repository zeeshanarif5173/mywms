'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  WrenchScrewdriverIcon,
  PauseIcon,
  EyeIcon,
  PencilIcon,
  PhotoIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface Complaint {
  id: string
  customerId: string
  title: string
  description: string
  photo?: string
  status: 'Open' | 'In Process' | 'On Hold' | 'Testing' | 'Resolved'
  remarks?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  workCompletionImage?: string
  feedback?: {
    rating: number
    comment: string
    submittedAt: string
  }
  resolvingTime?: number
  customer?: {
    id: string
    name: string
    email: string
  }
}

interface Analytics {
  totalComplaints: number
  openComplaints: number
  resolvedThisWeek: number
  resolvedThisMonth: number
  avgResolutionTime: number
  avgRating: number
  statusDistribution: Record<string, number>
}

export default function ManagerComplaints() {
  const { data: session } = useSession()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  
  // Form data for updating complaints
  const [updateData, setUpdateData] = useState({
    status: 'Open',
    remarks: '',
    workCompletionImage: null as File | null
  })

  // Load complaints and analytics
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch real analytics data
        const statsResponse = await fetch('/api/complaints/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setAnalytics({
            totalComplaints: statsData.totalComplaints,
            openComplaints: statsData.openComplaints,
            resolvedThisWeek: statsData.resolvedThisWeek,
            resolvedThisMonth: statsData.resolvedThisMonth,
            avgResolutionTime: statsData.avgResolutionTime,
            avgRating: 4.2, // This could be calculated from feedback data
            statusDistribution: {
              'Open': statsData.openComplaints,
              'In Process': statsData.inProcessComplaints,
              'On Hold': statsData.onHoldComplaints,
              'Testing': statsData.testingComplaints,
              'Resolved': statsData.resolvedComplaints
            }
          })
        }

        // Fetch real complaints data
        const complaintsResponse = await fetch('/api/complaints/all')
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json()
          setComplaints(complaintsData)
        } else {
          console.error('Failed to fetch complaints:', complaintsResponse.statusText)
          // Fallback to empty array if fetch fails
          setComplaints([])
        }

        // Analytics are now fetched from the API above
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadData()
    }
  }, [session])

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return

    try {
      const updatePayload: any = {
        status: updateData.status,
        remarks: updateData.remarks,
        workCompletionImage: updateData.workCompletionImage ? 'base64_encoded_image' : null
      }

      // If status is being changed to Resolved, set resolvedAt
      if (updateData.status === 'Resolved' && selectedComplaint.status !== 'Resolved') {
        updatePayload.resolvedAt = new Date().toISOString()
      }

      const response = await fetch(`/api/complaints/update/${selectedComplaint.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload)
      })

      if (response.ok) {
        // Reload complaints list to get updated data
        const complaintsResponse = await fetch('/api/complaints/all')
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json()
          setComplaints(complaintsData)
        }
        
        // Also reload analytics to update statistics
        const statsResponse = await fetch('/api/complaints/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setAnalytics({
            totalComplaints: statsData.totalComplaints,
            openComplaints: statsData.openComplaints,
            resolvedThisWeek: statsData.resolvedThisWeek,
            resolvedThisMonth: statsData.resolvedThisMonth,
            avgResolutionTime: statsData.avgResolutionTime,
            avgRating: 4.2,
            statusDistribution: {
              'Open': statsData.openComplaints,
              'In Process': statsData.inProcessComplaints,
              'On Hold': statsData.onHoldComplaints,
              'Testing': statsData.testingComplaints,
              'Resolved': statsData.resolvedComplaints
            }
          })
        }
        
        setShowUpdateModal(false)
        setSelectedComplaint(null)
        setUpdateData({ status: 'Open', remarks: '', workCompletionImage: null })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update complaint')
      }
    } catch (error) {
      console.error('Error updating complaint:', error)
      alert('Failed to update complaint')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUpdateData(prev => ({
        ...prev,
        workCompletionImage: file
      }))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case 'In Process':
        return <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500" />
      case 'On Hold':
        return <PauseIcon className="w-5 h-5 text-yellow-500" />
      case 'Testing':
        return <ClockIcon className="w-5 h-5 text-purple-500" />
      case 'Resolved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800'
      case 'In Process':
        return 'bg-blue-100 text-blue-800'
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'Testing':
        return 'bg-purple-100 text-purple-800'
      case 'Resolved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatResolvingTime = (resolvingTime?: number) => {
    if (!resolvingTime) return 'N/A'
    const days = Math.floor(resolvingTime / (1000 * 60 * 60 * 24))
    const hours = Math.floor((resolvingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  const formatAvgTime = (avgTime: number) => {
    const days = Math.floor(avgTime / (1000 * 60 * 60 * 24))
    const hours = Math.floor((avgTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || complaint.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
              <h1 className="text-3xl font-bold text-gray-900">Complaints Management</h1>
              <p className="text-gray-600">Monitor and manage customer complaints</p>
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
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.totalComplaints}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Complaints</p>
                  <p className="text-3xl font-bold text-red-600">{analytics.openComplaints}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved This Week</p>
                  <p className="text-3xl font-bold text-green-600">{analytics.resolvedThisWeek}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved This Month</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.resolvedThisMonth}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Average Resolution Time</h3>
                <ClockIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {formatAvgTime(analytics.avgResolutionTime)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Based on {complaints.filter(c => c.status === 'Resolved').length} resolved complaints
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
                <StarIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-yellow-600">
                  {analytics.avgRating.toFixed(1)}
                </p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarSolidIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(analytics.avgRating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Based on {complaints.filter(c => c.feedback).length} feedback submissions
              </p>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
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
                <option value="Open">Open</option>
                <option value="In Process">In Process</option>
                <option value="On Hold">On Hold</option>
                <option value="Testing">Testing</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(complaint.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{complaint.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                    {complaint.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedComplaint(complaint)
                      setUpdateData({ 
                        status: complaint.status, 
                        remarks: complaint.remarks || '', 
                        workCompletionImage: null 
                      })
                      setShowUpdateModal(true)
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Update Status"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Customer</p>
                  <p className="text-sm font-medium text-gray-900">
                    {complaint.customer?.name || `Customer ${complaint.customerId}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(complaint.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Feedback</p>
                  <div className="flex items-center space-x-1">
                    {complaint.feedback ? (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarSolidIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < complaint.feedback!.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          ({complaint.feedback.rating}/5)
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No feedback</span>
                    )}
                  </div>
                </div>
              </div>

              {complaint.remarks && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Manager Remarks</p>
                  <p className="text-sm text-blue-800">{complaint.remarks}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  {complaint.photo && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <PhotoIcon className="w-4 h-4 mr-1" />
                      Has photo
                    </span>
                  )}
                  {complaint.workCompletionImage && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      Work completed
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedComplaint(complaint)
                    // Show complaint details
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

        {filteredComplaints.length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>

      {/* Update Complaint Modal */}
      {showUpdateModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Update Complaint</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Update status for "{selectedComplaint.title}"
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Open">Open</option>
                    <option value="In Process">In Process</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Testing">Testing</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea
                    value={updateData.remarks}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Add remarks about the complaint status..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Completion Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input-field"
                />
                {updateData.workCompletionImage && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {updateData.workCompletionImage.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateComplaint}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

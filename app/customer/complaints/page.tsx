'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { subscribeToComplaints, isSupabaseConfigured } from '@/lib/supabase'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PauseIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  PhotoIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  BellIcon,
  PaperAirplaneIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Complaint {
  id: string
  customerId: string
  title: string
  description: string
  photo?: string
  status: 'Open' | 'In Process' | 'On Hold' | 'Testing' | 'Resolved'
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
}

export default function CustomerComplaints() {
  const { data: session } = useSession()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  
  // Form data for creating complaints
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photo: null as File | null
  })

  // Form data for feedback
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  })

  // Load complaints
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true)
        const customerId = session?.user?.id || '1'
        const response = await fetch(`/api/complaints/list/${customerId}`)
        
        if (response.ok) {
          const complaintsData = await response.json()
          setComplaints(complaintsData)
        }
      } catch (error) {
        console.error('Error loading complaints:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      loadComplaints()
    }
  }, [session])

  // Real-time subscription for complaints updates
  useEffect(() => {
    if (!session || !isSupabaseConfigured()) return

    const customerId = session?.user?.id || '1'
    
    const subscription = subscribeToComplaints(customerId, (payload) => {
      console.log('Real-time complaint update:', payload)
      
      if (payload.eventType === 'INSERT') {
        // New complaint added
        setComplaints(prev => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        // Complaint updated
        setComplaints(prev => 
          prev.map(complaint => 
            complaint.id === payload.new.id ? payload.new : complaint
          )
        )
      } else if (payload.eventType === 'DELETE') {
        // Complaint deleted
        setComplaints(prev => 
          prev.filter(complaint => complaint.id !== payload.old.id)
        )
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [session])

  const handleCreateComplaint = async () => {
    try {
      const customerId = session?.user?.id || '1'
      const response = await fetch('/api/complaints/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          customerId: customerId,
          photo: formData.photo ? 'base64_encoded_image' : null // In real app, upload to cloud storage
        })
      })

      if (response.ok) {
        const newComplaint = await response.json()
        setComplaints([newComplaint, ...complaints])
        setShowCreateModal(false)
        setFormData({ title: '', description: '', photo: null })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create complaint')
      }
    } catch (error) {
      console.error('Error creating complaint:', error)
      alert('Failed to create complaint')
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedComplaint) return

    try {
      const response = await fetch(`/api/complaints/feedback/${selectedComplaint.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      })

      if (response.ok) {
        const updatedComplaint = await response.json()
        setComplaints(complaints.map(c => 
          c.id === selectedComplaint.id ? updatedComplaint : c
        ))
        setShowFeedbackModal(false)
        setSelectedComplaint(null)
        setFeedbackData({ rating: 5, comment: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit feedback')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Failed to submit feedback')
    }
  }

  const handleSendReminder = async () => {
    if (!selectedComplaint) return

    try {
      const response = await fetch(`/api/complaints/reminder/${selectedComplaint.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Please provide an update on this complaint. Thank you.'
        })
      })

      if (response.ok) {
        alert('Reminder sent successfully!')
        setShowReminderModal(false)
        setSelectedComplaint(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to send reminder')
      }
    } catch (error) {
      console.error('Error sending reminder:', error)
      alert('Failed to send reminder')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file
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

  const calculateResolvingTime = (createdAt: string, resolvedAt: string) => {
    const created = new Date(createdAt)
    const resolved = new Date(resolvedAt)
    const diffTime = Math.abs(resolved.getTime() - created.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${diffDays} days ${diffHours} hours`
  }

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || complaint.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openComplaints = complaints.filter(c => c.status !== 'Resolved').length
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Complaints</h1>
              <p className="text-gray-600">Track and manage your support tickets</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Complaint</span>
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
                <p className="text-sm font-medium text-gray-600">Total Complaints</p>
                <p className="text-3xl font-bold text-gray-900">{complaints.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-3xl font-bold text-red-600">{openComplaints}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{resolvedComplaints}</p>
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                  <p className="text-xs text-gray-500">Resolution Time</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatResolvingTime(complaint.resolvingTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Feedback</p>
                  <div className="flex items-center space-x-1">
                    {complaint.feedback ? (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIconSolid
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
                    ) : complaint.status === 'Resolved' ? (
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint)
                          setShowFeedbackModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Leave Feedback
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">Not resolved</span>
                    )}
                  </div>
                </div>
              </div>

              {complaint.photo && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Attached Photo</p>
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              )}

              {complaint.workCompletionImage && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Work Completion Image</p>
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                  </div>
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
                <div className="flex items-center space-x-3">
                  {complaint.status !== 'Resolved' && (
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint)
                        setShowReminderModal(true)
                      }}
                      className="text-orange-600 hover:text-orange-800 text-sm font-medium flex items-center space-x-1"
                      title="Send reminder to management"
                    >
                      <BellIcon className="w-4 h-4" />
                      <span>Remind</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedComplaint(complaint)
                      setShowHistoryModal(true)
                    }}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center space-x-1"
                    title="View complaint history"
                  >
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                    <span>History</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedComplaint(complaint)
                      setShowDetailsModal(true)
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>Details</span>
                  </button>
                </div>
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

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create New Complaint</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., AC not working"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="input-field"
                    placeholder="Describe the issue in detail..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attach Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="input-field"
                  />
                  {formData.photo && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {formData.photo.name}
                    </p>
                  )}
                </div>
              </form>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateComplaint}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Submit Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Leave Feedback</h2>
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  How would you rate the resolution of "{selectedComplaint.title}"?
                </p>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFeedbackData(prev => ({ ...prev, rating }))}
                      className="p-1"
                    >
                      {rating <= feedbackData.rating ? (
                        <StarIconSolid className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <StarIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                <textarea
                  value={feedbackData.comment}
                  onChange={(e) => setFeedbackData(prev => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  className="input-field"
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Details Modal */}
      {showDetailsModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Complaint Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedComplaint(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Complaint Title */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedComplaint.title}</h4>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedComplaint.status === 'Open' 
                      ? 'bg-red-100 text-red-800'
                      : selectedComplaint.status === 'In Process'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedComplaint.status === 'Resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedComplaint.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created: {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Timeline */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Timeline</h5>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Complaint Created</p>
                      <p className="text-xs text-gray-500">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-500">{new Date(selectedComplaint.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedComplaint.resolvedAt && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Resolved</p>
                        <p className="text-xs text-gray-500">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resolution Time */}
              {selectedComplaint.resolvedAt && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-green-800 mb-1">Resolution Time</h5>
                  <p className="text-green-700">
                    {calculateResolvingTime(selectedComplaint.createdAt, selectedComplaint.resolvedAt)}
                  </p>
                </div>
              )}

              {/* Feedback */}
              {selectedComplaint.feedback && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-blue-800 mb-2">Your Feedback</h5>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIconSolid
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (selectedComplaint.feedback?.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-blue-700">{selectedComplaint.feedback.rating}/5</span>
                  </div>
                  {selectedComplaint.feedback.comment && (
                    <p className="text-sm text-blue-700">{selectedComplaint.feedback.comment}</p>
                  )}
                </div>
              )}

              {/* Work Completion Image */}
              {selectedComplaint.workCompletionImage && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Work Completion Image</h5>
                  <img
                    src={selectedComplaint.workCompletionImage}
                    alt="Work completion"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedComplaint(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Send Reminder</h2>
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Send a reminder to management about "{selectedComplaint.title}"
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <BellIcon className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    This will notify the management team to provide an update on your complaint.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendReminder}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                  <span>Send Reminder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Complaint History</h3>
                <button
                  onClick={() => {
                    setShowHistoryModal(false)
                    setSelectedComplaint(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Complaint Title */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedComplaint.title}</h4>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedComplaint.status === 'Open' 
                      ? 'bg-red-100 text-red-800'
                      : selectedComplaint.status === 'In Process'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedComplaint.status === 'On Hold'
                      ? 'bg-yellow-100 text-yellow-800'
                      : selectedComplaint.status === 'Testing'
                      ? 'bg-purple-100 text-purple-800'
                      : selectedComplaint.status === 'Resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedComplaint.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    ID: #{selectedComplaint.id}
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Timeline & Updates</h5>
                <div className="space-y-4">
                  {/* Initial Complaint */}
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">Complaint Created</p>
                        <span className="text-xs text-gray-500">{new Date(selectedComplaint.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{selectedComplaint.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Status: <span className="font-medium">Open</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Updates */}
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">Status Updated</p>
                        <span className="text-xs text-gray-500">{new Date(selectedComplaint.updatedAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Status changed to: <span className="font-medium">{selectedComplaint.status}</span>
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        Updated by: Management Team
                      </div>
                    </div>
                  </div>

                  {/* Resolution */}
                  {selectedComplaint.resolvedAt && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">Complaint Resolved</p>
                          <span className="text-xs text-gray-500">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Resolution time: {calculateResolvingTime(selectedComplaint.createdAt, selectedComplaint.resolvedAt)}
                        </p>
                        {selectedComplaint.workCompletionImage && (
                          <div className="mt-2 text-xs text-gray-500">
                            Work completion image provided
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {selectedComplaint.feedback && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">Feedback Submitted</p>
                          <span className="text-xs text-gray-500">{new Date(selectedComplaint.feedback.submittedAt).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIconSolid
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= selectedComplaint.feedback!.rating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{selectedComplaint.feedback.rating}/5</span>
                        </div>
                        {selectedComplaint.feedback.comment && (
                          <p className="text-sm text-gray-600 mt-1">{selectedComplaint.feedback.comment}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Management Updates Placeholder */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Management Updates</h5>
                <p className="text-sm text-gray-600">
                  Updates from the management team will appear here as they work on your complaint.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowHistoryModal(false)
                  setSelectedComplaint(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

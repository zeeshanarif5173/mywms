'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PauseIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PaperClipIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface Task {
  id: string
  title: string
  description: string
  department: 'AC' | 'Electrician' | 'IT' | 'Management' | 'Operations' | 'Accounts' | 'Cleaning' | 'Security' | 'Maintenance'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled' | 'Overdue'
  assignedTo?: string
  assignedToName?: string
  createdBy: string
  createdByName: string
  branchId: string
  dueDate: string
  completedAt?: string
  isRecurring: boolean
  attachments: any[]
  comments: any[]
  history: any[]
  fineAmount?: number
  fineApplied?: boolean
  createdAt: string
  updatedAt: string
}

interface TaskStats {
  totalTasks: number
  openTasks: number
  assignedTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueTasks: number
  cancelledTasks: number
  recentTasks: number
  completionRate: number
  avgCompletionTime: number
  departmentStats: Record<string, number>
  priorityStats: Record<string, number>
}

export default function ManagerTasks() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [departmentFilter, setDepartmentFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  
  // Form data for updating tasks
  const [updateData, setUpdateData] = useState({
    status: 'Open' as Task['status']
  })

  // Form data for comments
  const [commentData, setCommentData] = useState({
    comment: ''
  })

  // Load tasks and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Fetch tasks
        const tasksResponse = await fetch('/api/tasks')
        if (tasksResponse.ok) {
          const tasksData = await tasksResponse.json()
          setTasks(tasksData)
        }

        // Fetch stats
        const statsResponse = await fetch('/api/tasks/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
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

  const handleUpdateTask = async () => {
    if (!selectedTask) return

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t))
        setShowUpdateModal(false)
        setSelectedTask(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Failed to update task')
    }
  }

  const handleAddComment = async () => {
    if (!selectedTask || !commentData.comment.trim()) return

    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: commentData.comment })
      })

      if (response.ok) {
        const newComment = await response.json()
        // Refresh the task to get updated comments
        const taskResponse = await fetch(`/api/tasks/${selectedTask.id}`)
        if (taskResponse.ok) {
          const updatedTask = await taskResponse.json()
          setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t))
          setSelectedTask(updatedTask)
        }
        setCommentData({ comment: '' })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />
      case 'Assigned':
        return <UserGroupIcon className="w-5 h-5 text-blue-500" />
      case 'In Progress':
        return <WrenchScrewdriverIcon className="w-5 h-5 text-yellow-500" />
      case 'Completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'Overdue':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case 'Cancelled':
        return <XMarkIcon className="w-5 h-5 text-gray-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-gray-100 text-gray-800'
      case 'Assigned':
        return 'bg-blue-100 text-blue-800'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Overdue':
        return 'bg-red-100 text-red-800'
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-green-100 text-green-800'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'High':
        return 'bg-orange-100 text-orange-800'
      case 'Critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDepartmentColor = (department: string) => {
    const colors = {
      'AC': 'bg-blue-100 text-blue-800',
      'Electrician': 'bg-yellow-100 text-yellow-800',
      'IT': 'bg-purple-100 text-purple-800',
      'Management': 'bg-indigo-100 text-indigo-800',
      'Operations': 'bg-green-100 text-green-800',
      'Accounts': 'bg-pink-100 text-pink-800',
      'Cleaning': 'bg-cyan-100 text-cyan-800',
      'Security': 'bg-red-100 text-red-800',
      'Maintenance': 'bg-orange-100 text-orange-800'
    }
    return colors[department as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter
    const matchesDepartment = departmentFilter === 'ALL' || task.department === departmentFilter
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesDepartment && matchesPriority
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
              <h1 className="text-3xl font-bold text-gray-900">Branch Tasks</h1>
              <p className="text-gray-600">View and manage tasks for your branch</p>
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
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Open Tasks</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.openTasks}</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.inProgressTasks}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <WrenchScrewdriverIcon className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
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
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="ALL">All Departments</option>
                <option value="AC">AC</option>
                <option value="Electrician">Electrician</option>
                <option value="IT">IT</option>
                <option value="Management">Management</option>
                <option value="Operations">Operations</option>
                <option value="Accounts">Accounts</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Security">Security</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="ALL">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(task.status)}
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDepartmentColor(task.department)}`}>
                    {task.department}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Assigned To</p>
                  <p className="text-sm font-medium text-gray-900">
                    {task.assignedToName || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fine Amount</p>
                  <p className="text-sm font-medium text-gray-900">
                    {task.fineAmount ? `$${task.fineAmount}` : 'None'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  {task.isRecurring && (
                    <span className="text-xs text-blue-600 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Recurring
                    </span>
                  )}
                  {task.attachments.length > 0 && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <PaperClipIcon className="w-4 h-4 mr-1" />
                      {task.attachments.length} attachment(s)
                    </span>
                  )}
                  {task.comments.length > 0 && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                      {task.comments.length} comment(s)
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedTask(task)
                      setUpdateData({ status: task.status })
                      setShowUpdateModal(true)
                    }}
                    className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTask(task)
                      setShowDetailsModal(true)
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </main>

      {/* Update Task Modal */}
      {showUpdateModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Update Task Status</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Update status for "{selectedTask.title}"
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ status: e.target.value as Task['status'] })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Open">Open</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateTask}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Task Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedTask(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Task Info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedTask.title}</h4>
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getDepartmentColor(selectedTask.department)}`}>
                    {selectedTask.department}
                  </span>
                </div>
                <p className="text-gray-700">{selectedTask.description}</p>
              </div>

              {/* Task Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Task Information</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Assigned To:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTask.assignedToName || 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Created By:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedTask.createdByName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Due Date:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedTask.dueDate).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Fine Amount:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTask.fineAmount ? `$${selectedTask.fineAmount}` : 'None'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Recurring:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTask.isRecurring ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Timeline</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedTask.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Last Updated:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(selectedTask.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    {selectedTask.completedAt && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Completed:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(selectedTask.completedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Comments ({selectedTask.comments.length})</h5>
                <div className="space-y-3 mb-4">
                  {selectedTask.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.comment}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={commentData.comment}
                    onChange={(e) => setCommentData({ comment: e.target.value })}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Attachments */}
              {selectedTask.attachments.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-3">Attachments ({selectedTask.attachments.length})</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedTask.attachments.map((attachment) => (
                      <div key={attachment.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <PaperClipIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">{attachment.fileName}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {attachment.fileType} • {Math.round(attachment.fileSize / 1024)} KB
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* History */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Task History</h5>
                <div className="space-y-2">
                  {selectedTask.history.map((historyItem) => (
                    <div key={historyItem.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{historyItem.description}</p>
                        <p className="text-xs text-gray-500">
                          {historyItem.userName} • {new Date(historyItem.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedTask(null)
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

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getAllTasks, getTasksByBranchId } from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let tasks

    if (session.user.role === 'ADMIN') {
      // Admin can see all tasks
      tasks = getAllTasks()
    } else if (session.user.role === 'MANAGER') {
      // Manager can see tasks for their branch
      tasks = getTasksByBranchId(session.user.branchId || '1')
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Calculate statistics
    const totalTasks = tasks.length
    const openTasks = tasks.filter(t => t.status === 'Open').length
    const assignedTasks = tasks.filter(t => t.status === 'Assigned').length
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length
    const completedTasks = tasks.filter(t => t.status === 'Completed').length
    const overdueTasks = tasks.filter(t => t.status === 'Overdue').length
    const cancelledTasks = tasks.filter(t => t.status === 'Cancelled').length


    // Department breakdown
    const departmentStats = tasks.reduce((acc, task) => {
      acc[task.department] = (acc[task.department] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Priority breakdown
    const priorityStats = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Recent tasks (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentTasks = tasks.filter(task => {
      const createdDate = new Date(task.createdAt)
      return createdDate >= sevenDaysAgo
    }).length

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Average completion time (for completed tasks)
    const completedTasksWithTime = tasks.filter(t => 
      t.status === 'Completed' && t.completedAt && t.createdAt
    )
    
    let avgCompletionTime = 0
    if (completedTasksWithTime.length > 0) {
      const totalCompletionTime = completedTasksWithTime.reduce((sum, task) => {
        const created = new Date(task.createdAt)
        const completed = new Date(task.completedAt!)
        const diffTime = Math.abs(completed.getTime() - created.getTime())
        const diffHours = diffTime / (1000 * 60 * 60)
        return sum + diffHours
      }, 0)
      avgCompletionTime = Math.round((totalCompletionTime / completedTasksWithTime.length) * 10) / 10
    }

    const stats = {
      totalTasks,
      openTasks,
      assignedTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      cancelledTasks,
      recentTasks,
      completionRate,
      avgCompletionTime,
      departmentStats,
      priorityStats
    }

    return NextResponse.json(stats, { status: 200 })

  } catch (error) {
    console.error('Error fetching task stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task statistics' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getPersistentTasks } from '@/lib/persistent-tasks'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

// Simple in-memory cache for task stats
let cachedTaskStats: any = null
let taskCacheTimestamp = 0
const TASK_CACHE_DURATION = 30000 // 30 seconds

export async function GET(request: NextRequest) {
  try {
    // Check if we have valid cached data
    const now = Date.now()
    if (cachedTaskStats && (now - taskCacheTimestamp) < TASK_CACHE_DURATION) {
      return NextResponse.json(cachedTaskStats)
    }

    const tasks = getPersistentTasks()
    
    // Optimize stats calculation with single-pass reduce
    const stats = tasks.reduce((acc, task) => {
      acc.totalTasks++
      
      // Status counts
      if (task.status === 'Open') acc.openTasks++
      if (task.status === 'Assigned') acc.assignedTasks++
      if (task.status === 'In Progress') acc.inProgressTasks++
      if (task.status === 'Completed') acc.completedTasks++
      if (task.status === 'Overdue') acc.overdueTasks++
      if (task.status === 'Cancelled') acc.cancelledTasks++
      
      // Recent tasks (last 7 days)
      const createdAt = new Date(task.createdAt)
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (createdAt > oneWeekAgo) acc.recentTasks++
      
      // Department stats
      acc.departmentStats[task.department] = (acc.departmentStats[task.department] || 0) + 1
      
      // Priority stats
      acc.priorityStats[task.priority] = (acc.priorityStats[task.priority] || 0) + 1
      
      return acc
    }, {
      totalTasks: 0,
      openTasks: 0,
      assignedTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      overdueTasks: 0,
      cancelledTasks: 0,
      recentTasks: 0,
      departmentStats: {} as Record<string, number>,
      priorityStats: {} as Record<string, number>
    })
    
    // Calculate completion rate
    stats.completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0
    stats.avgCompletionTime = 2.5 // days (mock for now)
    
    // Cache the results
    cachedTaskStats = stats
    taskCacheTimestamp = now
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching task stats:', error)
    return NextResponse.json({ error: 'Failed to fetch task stats' }, { status: 500 })
  }
}
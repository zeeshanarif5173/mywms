import { NextRequest, NextResponse } from 'next/server'
import { getAllTasks, createTask, checkOverdueTasks, applyLateFines } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    console.log('Running task management cron job...')
    
    // Check for overdue tasks
    const overdueTasks = checkOverdueTasks()
    console.log(`Found ${overdueTasks.length} overdue tasks`)
    
    // Apply late fines
    const appliedFines = applyLateFines()
    console.log(`Applied ${appliedFines.length} late fines`)
    
    // Check for recurring tasks that need to be created
    const allTasks = getAllTasks()
    const recurringTasks = allTasks.filter(task => task.isRecurring && task.recurringPattern)
    const newRecurringTasks: any[] = []
    
    for (const task of recurringTasks) {
      if (!task.recurringPattern) continue
      
      const now = new Date()
      const lastDueDate = new Date(task.dueDate)
      const pattern = task.recurringPattern
      
      // Check if it's time to create a new recurring task
      let shouldCreateNew = false
      let nextDueDate = new Date()
      
      switch (pattern.type) {
        case 'hourly':
          // Create new task every X hours
          const hoursSinceLast = Math.floor((now.getTime() - lastDueDate.getTime()) / (1000 * 60 * 60))
          if (hoursSinceLast >= pattern.interval) {
            shouldCreateNew = true
            nextDueDate = new Date(lastDueDate.getTime() + pattern.interval * 60 * 60 * 1000)
          }
          break
          
        case 'daily':
          // Create new task every X days
          const daysSinceLast = Math.floor((now.getTime() - lastDueDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceLast >= pattern.interval) {
            shouldCreateNew = true
            nextDueDate = new Date(lastDueDate.getTime() + pattern.interval * 24 * 60 * 60 * 1000)
          }
          break
          
        case 'weekly':
          // Create new task every X weeks
          const weeksSinceLast = Math.floor((now.getTime() - lastDueDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
          if (weeksSinceLast >= pattern.interval) {
            shouldCreateNew = true
            nextDueDate = new Date(lastDueDate.getTime() + pattern.interval * 7 * 24 * 60 * 60 * 1000)
          }
          break
          
        case 'monthly':
          // Create new task every X months
          const monthsSinceLast = (now.getFullYear() - lastDueDate.getFullYear()) * 12 + (now.getMonth() - lastDueDate.getMonth())
          if (monthsSinceLast >= pattern.interval) {
            shouldCreateNew = true
            nextDueDate = new Date(lastDueDate)
            nextDueDate.setMonth(nextDueDate.getMonth() + pattern.interval)
          }
          break
      }
      
      // Check if we should stop recurring (end date reached)
      if (pattern.endDate && new Date(pattern.endDate) < now) {
        shouldCreateNew = false
      }
      
      // Only create new task if the previous one is completed or overdue
      if (shouldCreateNew && (task.status === 'Completed' || task.status === 'Overdue')) {
        // Set time of day if specified
        if (pattern.timeOfDay) {
          const [hours, minutes] = pattern.timeOfDay.split(':').map(Number)
          nextDueDate.setHours(hours, minutes, 0, 0)
        }
        
        // Create new recurring task
        const newTask = createTask(
          task.title,
          task.description,
          task.department,
          task.priority,
          task.createdBy,
          task.createdByName,
          task.branchId,
          nextDueDate.toISOString(),
          task.assignedTo,
          task.assignedToName,
          true, // isRecurring
          pattern,
          task.fineAmount
        )
        
        newRecurringTasks.push(newTask)
        console.log(`Created new recurring task: ${newTask.title} (ID: ${newTask.id})`)
      }
    }
    
    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      overdueTasks: overdueTasks.length,
      appliedFines: appliedFines.length,
      newRecurringTasks: newRecurringTasks.length,
      details: {
        overdueTasks: overdueTasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
        appliedFines: appliedFines,
        newRecurringTasks: newRecurringTasks.map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate }))
      }
    }
    
    console.log('Task management cron job completed:', result)
    return NextResponse.json(result, { status: 200 })
    
  } catch (error) {
    console.error('Error in task management cron job:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to run task management cron job',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

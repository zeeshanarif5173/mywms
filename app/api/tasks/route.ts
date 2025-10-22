import { NextRequest, NextResponse } from 'next/server'
import { getPersistentTasks, savePersistentTasks } from '@/lib/persistent-tasks'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const tasks = getPersistentTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, priority = 'Medium', assignedTo, dueDate } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Get existing tasks
    const existingTasks = getPersistentTasks()
    
    // Create new task
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      status: 'Pending',
      priority,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to persistent storage
    const updatedTasks = [...existingTasks, newTask]
    savePersistentTasks(updatedTasks)

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, description, status, priority, assignedTo, dueDate } = body

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Get existing tasks from persistent storage
    const existingTasks = getPersistentTasks()
    
    // Find the task to update
    const taskIndex = existingTasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Update task
    const updatedTask = {
      ...existingTasks[taskIndex],
      title: title || existingTasks[taskIndex].title,
      description: description || existingTasks[taskIndex].description,
      status: status || existingTasks[taskIndex].status,
      priority: priority || existingTasks[taskIndex].priority,
      assignedTo: assignedTo !== undefined ? assignedTo : existingTasks[taskIndex].assignedTo,
      dueDate: dueDate !== undefined ? dueDate : existingTasks[taskIndex].dueDate,
      updatedAt: new Date().toISOString()
    }

    // Update in persistent storage
    const updatedTasks = [...existingTasks]
    updatedTasks[taskIndex] = updatedTask
    savePersistentTasks(updatedTasks)

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Get existing tasks from persistent storage
    const existingTasks = getPersistentTasks()
    
    // Find the task to delete
    const taskIndex = existingTasks.findIndex(task => task.id === id)
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Remove task from persistent storage
    const updatedTasks = existingTasks.filter(task => task.id !== id)
    savePersistentTasks(updatedTasks)

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getPersistentTasks, savePersistentTasks } from '@/lib/persistent-tasks'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = getPersistentTasks()
    const task = tasks.find(t => t.id === params.id)
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const tasks = getPersistentTasks()
    const taskIndex = tasks.findIndex(t => t.id === params.id)
    
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    const updatedTask = {
      ...tasks[taskIndex],
      ...body,
      updatedAt: new Date().toISOString()
    }
    
    tasks[taskIndex] = updatedTask
    savePersistentTasks(tasks)
    
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tasks = getPersistentTasks()
    const taskIndex = tasks.findIndex(t => t.id === params.id)
    
    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    const updatedTasks = tasks.filter(t => t.id !== params.id)
    savePersistentTasks(updatedTasks)
    
    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getPersistentTasks, savePersistentTasks } from '@/lib/persistent-tasks'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const taskId = params.id
    const tasks = getPersistentTasks()
    const taskIndex = tasks.findIndex(t => t.id === taskId)

    if (taskIndex === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const body = await request.json()
    const { comment } = body

    if (!comment) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }

    // Create new comment
    const newComment = {
      id: `comment-${Date.now()}`,
      comment,
      userId: session.user.id,
      userName: session.user.name || 'User',
      createdAt: new Date().toISOString()
    }

    // Add comment to task
    const task = tasks[taskIndex]
    if (!task.comments) {
      task.comments = []
    }
    task.comments.push(newComment)
    task.updatedAt = new Date().toISOString()

    // Save updated tasks
    savePersistentTasks(tasks)

    return NextResponse.json(newComment, { status: 201 })

  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

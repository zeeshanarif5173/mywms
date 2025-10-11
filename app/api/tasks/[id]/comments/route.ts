import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getTaskById, addTaskComment } from '@/lib/mock-data'


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
    const task = getTaskById(taskId)

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role === 'MANAGER' && task.branchId !== session.user.branchId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { comment } = body

    if (!comment) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 })
    }

    // Add the comment
    const newComment = addTaskComment(
      taskId,
      session.user.id,
      session.user.name || 'User',
      comment
    )

    if (!newComment) {
      return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
    }

    return NextResponse.json(newComment, { status: 201 })

  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
}

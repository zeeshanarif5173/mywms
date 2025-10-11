import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getTaskById, addTaskAttachment } from '@/lib/mock-data'

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
    const { fileName, fileType, fileSize, fileUrl } = body

    if (!fileName || !fileType || !fileSize || !fileUrl) {
      return NextResponse.json(
        { error: 'fileName, fileType, fileSize, and fileUrl are required' },
        { status: 400 }
      )
    }

    // Add the attachment
    const newAttachment = addTaskAttachment(
      taskId,
      fileName,
      fileType,
      fileSize,
      fileUrl,
      session.user.id
    )

    if (!newAttachment) {
      return NextResponse.json({ error: 'Failed to add attachment' }, { status: 500 })
    }

    return NextResponse.json(newAttachment, { status: 201 })

  } catch (error) {
    console.error('Error adding attachment:', error)
    return NextResponse.json(
      { error: 'Failed to add attachment' },
      { status: 500 }
    )
  }
}

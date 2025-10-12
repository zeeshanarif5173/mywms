import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')

    let tasks

    if (session.user.role === 'ADMIN') {
      // Admin can see all tasks
      tasks = await prisma.task.findMany({
        include: {
          assignedToUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else if (session.user.role === 'MANAGER') {
      // Manager can see tasks for their branch
      tasks = await prisma.task.findMany({
        where: {
          branchId: parseInt(session.user.branchId || '1')
        },
        include: {
          assignedToUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          createdByUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          branch: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Filter by branch if specified
    if (branchId && session.user.role === 'ADMIN') {
      tasks = tasks.filter(task => task.branchId === parseInt(branchId))
    }

    return NextResponse.json(tasks, { status: 200 })

  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can create tasks
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create tasks' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      department,
      priority,
      branchId,
      dueDate,
      assignedTo,
      assignedToName,
      isRecurring,
      recurringPattern,
      fineAmount
    } = body

    // Validate required fields
    if (!title || !description || !department || !priority || !branchId || !dueDate) {
      return NextResponse.json(
        { error: 'Title, description, department, priority, branchId, and dueDate are required' },
        { status: 400 }
      )
    }

    // Create the task in database
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        department,
        priority,
        createdBy: parseInt(session.user.id),
        createdByName: session.user.name || 'Admin',
        branchId: parseInt(branchId),
        dueDate: new Date(dueDate),
        assignedTo: assignedTo ? parseInt(assignedTo) : null,
        assignedToName: assignedToName || null,
        isRecurring: isRecurring || false,
        recurringPattern: recurringPattern || null,
        fineAmount: fineAmount ? parseFloat(fineAmount) : null,
        status: 'Open'
      },
      include: {
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(newTask, { status: 201 })

  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

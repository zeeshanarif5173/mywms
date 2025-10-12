import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only managers and admins can update complaints
    if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only managers and admins can update complaints' }, { status: 403 })
    }

    const complaintId = params.id
    const body = await request.json()
    const { status, workCompletionImage } = body

    if (!complaintId) {
      return NextResponse.json(
        { error: 'Complaint ID is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['Open', 'In Process', 'On Hold', 'Testing', 'Resolved']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      )
    }

    // Get the existing complaint
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: parseInt(complaintId) },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!existingComplaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      )
    }

    // Update complaint in database
    const updatedComplaint = await prisma.complaint.update({
      where: { id: parseInt(complaintId) },
      data: {
        status: status || existingComplaint.status,
        imageUrl: workCompletionImage || existingComplaint.imageUrl,
        resolvedAt: status === 'Resolved' ? new Date() : existingComplaint.resolvedAt
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            branch: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedComplaint, { status: 200 })
  } catch (error) {
    console.error('Error updating complaint:', error)
    return NextResponse.json(
      { error: 'Failed to update complaint' },
      { status: 500 }
    )
  }
}
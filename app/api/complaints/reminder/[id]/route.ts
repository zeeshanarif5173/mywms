import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

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

    // Only customers can send reminders for their own complaints
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can send reminders' }, { status: 403 })
    }

    const complaintId = params.id
    const body = await request.json()
    const { message } = body

    // Find the complaint
    const complaint = await prisma.complaint.findUnique({
      where: { id: parseInt(complaintId) },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      )
    }

    // Check if the customer owns this complaint
    if (complaint.customer.email !== session.user.email) {
      return NextResponse.json(
        { error: 'You can only send reminders for your own complaints' },
        { status: 403 }
      )
    }

    // Check if complaint is already resolved
    if (complaint.status === 'Resolved') {
      return NextResponse.json(
        { error: 'Cannot send reminder for resolved complaints' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Send email notification to management
    // 2. Create a notification record
    // 3. Log the reminder activity
    // 4. Send SMS or push notification if configured

    // For now, we'll just log the reminder and return success
    console.log('Complaint Reminder Sent:', {
      complaintId: complaint.id,
      customerEmail: complaint.customer.email,
      customerName: complaint.customer.name,
      complaintTitle: complaint.title,
      message: message || 'Please provide an update on this complaint. Thank you.',
      timestamp: new Date().toISOString()
    })

    // TODO: Implement actual notification system
    // - Send email to management team
    // - Create notification record in database
    // - Send SMS if customer has phone number

    return NextResponse.json({
      success: true,
      message: 'Reminder sent successfully',
      reminderId: `REM-${Date.now()}`,
      sentAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error sending reminder:', error)
    return NextResponse.json(
      { error: 'Failed to send reminder' },
      { status: 500 }
    )
  }
}

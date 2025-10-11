import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getAllBookings, getAllCustomers, getAllMeetingRooms } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can view all bookings
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const bookings = getAllBookings()
    const customers = getAllCustomers()
    const meetingRooms = getAllMeetingRooms()

    // Enrich bookings with customer names and room names
    const enrichedBookings = bookings.map(booking => {
      const customer = customers.find(c => c.id === booking.customerId)
      const room = meetingRooms.find(r => r.id === booking.roomId)
      
      return {
        ...booking,
        customerName: customer?.name || 'Unknown Customer',
        customerEmail: customer?.email || 'unknown@example.com',
        roomName: room?.name || 'Unknown Room',
        roomLocation: room?.location || 'Unknown Location'
      }
    })

    // Sort by date and time (newest first)
    enrichedBookings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}:00`)
      const dateB = new Date(`${b.date}T${b.startTime}:00`)
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json(enrichedBookings, { status: 200 })

  } catch (error) {
    console.error('Error fetching all bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}


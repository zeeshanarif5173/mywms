import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { cancelBooking } from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can cancel their own bookings
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can cancel bookings' }, { status: 403 })
    }

    const bookingId = params.bookingId
    const success = cancelBooking(bookingId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Booking not found or could not be cancelled' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Booking cancelled successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { 
  getBookingsByCustomerId, 
  getCustomerByUserId 
} from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerId = params.customerId

    // For customers, get their actual customer ID from the user ID
    let actualCustomerId = customerId
    
    if (session.user.role === 'CUSTOMER') {
      const customer = getCustomerByUserId(session.user.id)
      if (!customer) {
        return NextResponse.json(
          { error: 'Customer profile not found' },
          { status: 404 }
        )
      }
      actualCustomerId = customer.id
    }

    // Check if user can access this customer's bookings
    if (session.user.role === 'CUSTOMER' && session.user.id !== customerId) {
      return NextResponse.json(
        { error: 'You can only access your own bookings' },
        { status: 403 }
      )
    }

    const bookings = getBookingsByCustomerId(actualCustomerId)
    return NextResponse.json(bookings, { status: 200 })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

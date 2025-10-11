import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { 
  getCustomerByEmail, 
  createBooking, 
  getCustomerDailyBookingHours,
  getCustomerMonthlyBookingHours,
  getPackageLimitByPackageId 
} from '@/lib/mock-data'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only customers can book
    if (session.user.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Only customers can book meeting rooms' }, { status: 403 })
    }

    const body = await request.json()
    const { roomId, date, startTime, endTime, purpose } = body

    // Validate required fields
    if (!roomId || !date || !startTime || !endTime || !purpose) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate that the booking is not in the past
    const bookingDateTime = new Date(`${date}T${startTime}:00`)
    const now = new Date()
    
    if (bookingDateTime <= now) {
      return NextResponse.json(
        { error: 'Cannot book a time slot that has already passed' },
        { status: 400 }
      )
    }

    // Find customer
    const customer = getCustomerByEmail(session.user.email)
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    // Check if customer account is locked
    if (customer.accountStatus === 'Locked') {
      return NextResponse.json(
        { error: 'Your account is locked. Cannot book meeting rooms.' },
        { status: 403 }
      )
    }

    // Check daily booking limit (2 hours = 120 minutes)
    const dailyHours = getCustomerDailyBookingHours(customer.id, date)
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    const duration = (end.getTime() - start.getTime()) / (1000 * 60) // minutes
    
    if (dailyHours + duration > 120) {
      return NextResponse.json(
        { error: 'Daily booking limit exceeded. Maximum 2 hours per day.' },
        { status: 400 }
      )
    }

    // Check monthly limit if customer has a package
    if (customer.packageId) {
      const packageLimit = getPackageLimitByPackageId(customer.packageId)
      if (packageLimit) {
        const currentDate = new Date()
        const monthlyHours = getCustomerMonthlyBookingHours(customer.id, currentDate.getFullYear(), currentDate.getMonth() + 1)
        
        if (monthlyHours + duration > packageLimit.monthlyHoursLimit * 60) {
          return NextResponse.json(
            { error: `Monthly booking limit exceeded. Limit: ${packageLimit.monthlyHoursLimit} hours per month.` },
            { status: 400 }
          )
        }
      }
    }

    // Create booking
    const newBooking = createBooking(customer.id, customer.branchId, roomId, date, startTime, endTime, purpose)
    
    if (!newBooking) {
      return NextResponse.json(
        { error: 'Time slot is not available' },
        { status: 400 }
      )
    }

    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error('Error booking meeting room:', error)
    return NextResponse.json(
      { error: 'Failed to book meeting room' },
      { status: 500 }
    )
  }
}
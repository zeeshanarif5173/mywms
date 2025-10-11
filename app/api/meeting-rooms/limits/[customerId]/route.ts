import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { 
  getCustomerByUserId, 
  getCustomerDailyBookingHours,
  getCustomerMonthlyBookingHours,
  getPackageLimitByPackageId 
} from '@/lib/mock-data'

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

    // Check if user can access this customer's limits
    if (session.user.role === 'CUSTOMER' && session.user.id !== customerId) {
      return NextResponse.json(
        { error: 'You can only access your own limits' },
        { status: 403 }
      )
    }

    const customer = getCustomerByUserId(session.user.id)
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 404 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const currentDate = new Date()
    
    const dailyHours = getCustomerDailyBookingHours(actualCustomerId, today)
    const monthlyHours = getCustomerMonthlyBookingHours(
      actualCustomerId, 
      currentDate.getFullYear(), 
      currentDate.getMonth() + 1
    )

    let monthlyLimit = 20 // Default limit
    if (customer.packageId) {
      const packageLimit = getPackageLimitByPackageId(customer.packageId)
      if (packageLimit) {
        monthlyLimit = packageLimit.monthlyHoursLimit
      }
    }

    return NextResponse.json({
      dailyHours,
      monthlyHours,
      monthlyLimit,
      dailyLimit: 120, // 2 hours in minutes
      maxBookingsPerDay: 2
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching booking limits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking limits' },
      { status: 500 }
    )
  }
}

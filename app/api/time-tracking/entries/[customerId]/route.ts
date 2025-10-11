import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { 
  getTimeEntriesByCustomerId, 
  getCurrentTimeEntry, 
  getTimeEntriesByDateRange,
  getTotalHoursInRange,
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
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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

    // Check if user can access this customer's time entries
    if (session.user.role === 'CUSTOMER' && session.user.id !== customerId) {
      return NextResponse.json(
        { error: 'You can only access your own time entries' },
        { status: 403 }
      )
    }

    let entries
    let totalHours = 0

    if (startDate && endDate) {
      entries = getTimeEntriesByDateRange(actualCustomerId, startDate, endDate)
      totalHours = getTotalHoursInRange(actualCustomerId, startDate, endDate)
    } else {
      entries = getTimeEntriesByCustomerId(actualCustomerId)
      // Calculate total hours for all entries
      totalHours = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60
    }

    // Calculate today's hours specifically
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = entries.filter(entry => entry.date === today)
    const todayHours = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60

    const currentEntry = getCurrentTimeEntry(actualCustomerId)

    return NextResponse.json({
      entries,
      currentEntry,
      totalHours: Math.round(totalHours * 100) / 100,
      todayHours: Math.round(todayHours * 100) / 100
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching time entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    )
  }
}

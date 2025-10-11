import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { 
  getTimeEntriesByDateRange, 
  getTotalHoursInRange,
  getCustomerByUserId 
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

    const defaultStartDate = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const defaultEndDate = endDate || new Date().toISOString().split('T')[0]

    const entries = getTimeEntriesByDateRange(actualCustomerId, defaultStartDate, defaultEndDate)
    const totalHours = getTotalHoursInRange(actualCustomerId, defaultStartDate, defaultEndDate)

    // Generate CSV content
    const csvHeaders = [
      'Date',
      'Check In Time',
      'Check Out Time',
      'Duration (Hours)',
      'Status',
      'Notes'
    ]

    const csvRows = entries.map(entry => [
      entry.date,
      new Date(entry.checkInTime).toLocaleTimeString('en-US', { hour12: true }),
      entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleTimeString('en-US', { hour12: true }) : '',
      entry.duration ? (entry.duration / 60).toFixed(2) : '',
      entry.status,
      entry.notes || ''
    ])

    // Add summary row
    csvRows.push(['', '', '', '', '', ''])
    csvRows.push(['TOTAL HOURS', '', '', totalHours.toFixed(2), '', ''])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="time-tracking-${defaultStartDate}-to-${defaultEndDate}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting time entries:', error)
    return NextResponse.json(
      { error: 'Failed to export time entries' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getStaffTimeEntries, getStaffByEmail, getStaffTimeStats } from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET(
  request: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const staffId = params.staffId
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'json'

    // Check permissions
    if (session.user.role === 'STAFF' || session.user.role === 'TEAM_LEAD') {
      // Staff can only export their own entries
      const staff = getStaffByEmail(session.user.email)
      if (!staff || staff.id !== staffId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get time entries and stats
    const entries = getStaffTimeEntries(staffId, startDate || undefined, endDate || undefined)
    const stats = getStaffTimeStats(staffId, startDate || undefined, endDate || undefined)

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = 'Date,Check In,Check Out,Duration (Hours),Status,Notes\n'
      const csvRows = entries.map(entry => {
        const checkIn = new Date(entry.checkInTime).toLocaleString()
        const checkOut = entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleString() : 'N/A'
        const duration = entry.duration ? (entry.duration / 60).toFixed(2) : 'N/A'
        const notes = entry.notes ? entry.notes.replace(/,/g, ';') : ''
        return `${entry.date},${checkIn},${checkOut},${duration},${entry.status},${notes}`
      }).join('\n')

      const csv = csvHeaders + csvRows

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="staff-time-entries-${staffId}-${startDate || 'all'}-${endDate || 'all'}.csv"`
        }
      })
    }

    // Return JSON with stats
    return NextResponse.json({
      entries,
      stats,
      summary: {
        totalEntries: entries.length,
        totalHours: stats.totalHours,
        averageHoursPerDay: stats.averageHoursPerDay,
        period: {
          startDate: startDate || 'all',
          endDate: endDate || 'all'
        }
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Error exporting staff time entries:', error)
    return NextResponse.json(
      { error: 'Failed to export time entries' },
      { status: 500 }
    )
  }
}

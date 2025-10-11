import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getStaffTimeEntries, getStaffByEmail } from '@/lib/mock-data'

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

    // Check permissions
    if (session.user.role === 'STAFF' || session.user.role === 'TEAM_LEAD') {
      // Staff can only view their own entries
      const staff = getStaffByEmail(session.user.email)
      if (!staff || staff.id !== staffId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else if (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get time entries
    const entries = getStaffTimeEntries(staffId, startDate || undefined, endDate || undefined)

    return NextResponse.json(entries, { status: 200 })
  } catch (error) {
    console.error('Error fetching staff time entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time entries' },
      { status: 500 }
    )
  }
}

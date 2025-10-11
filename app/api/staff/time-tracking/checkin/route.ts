import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getStaffByEmail, checkInStaff, getCurrentStaffTimeEntry } from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only staff can check in
    if (session.user.role !== 'STAFF' && session.user.role !== 'TEAM_LEAD') {
      return NextResponse.json({ error: 'Only staff can check in' }, { status: 403 })
    }

    const body = await request.json()
    const { notes } = body

    // Find staff by email
    const staff = getStaffByEmail(session.user.email)

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff profile not found' },
        { status: 404 }
      )
    }

    // Check if staff account is active
    if (staff.accountStatus === 'Locked' || staff.accountStatus === 'Suspended') {
      return NextResponse.json(
        { error: 'Your account is locked or suspended. Cannot check in. Please contact your manager.' },
        { status: 403 }
      )
    }

    // Check if already checked in
    const currentEntry = getCurrentStaffTimeEntry(staff.id)
    if (currentEntry) {
      return NextResponse.json(
        { error: 'You are already checked in' },
        { status: 400 }
      )
    }

    // Check in
    const newEntry = checkInStaff(staff.id, notes)

    return NextResponse.json(newEntry, { status: 201 })
  } catch (error) {
    console.error('Error checking in staff:', error)
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    )
  }
}

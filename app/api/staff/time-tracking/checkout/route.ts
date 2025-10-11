import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getStaffByEmail, checkOutStaff, getCurrentStaffTimeEntry } from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only staff can check out
    if (session.user.role !== 'STAFF' && session.user.role !== 'TEAM_LEAD') {
      return NextResponse.json({ error: 'Only staff can check out' }, { status: 403 })
    }

    // Find staff by email
    const staff = getStaffByEmail(session.user.email)

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff profile not found' },
        { status: 404 }
      )
    }

    // Check if currently checked in
    const currentEntry = getCurrentStaffTimeEntry(staff.id)
    if (!currentEntry) {
      return NextResponse.json(
        { error: 'You are not currently checked in' },
        { status: 400 }
      )
    }

    // Check out
    const updatedEntry = checkOutStaff(staff.id)

    if (!updatedEntry) {
      return NextResponse.json(
        { error: 'Failed to check out' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedEntry, { status: 200 })
  } catch (error) {
    console.error('Error checking out staff:', error)
    return NextResponse.json(
      { error: 'Failed to check out' },
      { status: 500 }
    )
  }
}

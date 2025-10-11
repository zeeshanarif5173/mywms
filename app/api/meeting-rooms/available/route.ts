import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getActiveMeetingRooms } from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const meetingRooms = getActiveMeetingRooms()
    return NextResponse.json(meetingRooms, { status: 200 })
  } catch (error) {
    console.error('Error fetching available meeting rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available meeting rooms' },
      { status: 500 }
    )
  }
}

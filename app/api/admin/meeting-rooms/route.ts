import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { 
  getAllMeetingRooms, 
  createMeetingRoom, 
  updateMeetingRoom, 
  deleteMeetingRoom 
} from '@/lib/mock-data'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin and manager can access
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const meetingRooms = getAllMeetingRooms()
    return NextResponse.json(meetingRooms, { status: 200 })
  } catch (error) {
    console.error('Error fetching meeting rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meeting rooms' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin and manager can create
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const { name, capacity, location, amenities, isActive } = body

    // Validate required fields
    if (!name || !capacity || !location) {
      return NextResponse.json(
        { error: 'Name, capacity, and location are required' },
        { status: 400 }
      )
    }

    const newRoom = createMeetingRoom(name, capacity, location, amenities || [])
    
    return NextResponse.json(newRoom, { status: 201 })
  } catch (error) {
    console.error('Error creating meeting room:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting room' },
      { status: 500 }
    )
  }
}

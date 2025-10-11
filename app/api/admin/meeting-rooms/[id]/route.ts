import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { 
  getMeetingRoomById, 
  updateMeetingRoom, 
  deleteMeetingRoom 
} from '@/lib/mock-data'


// Force dynamic rendering
export const dynamic = 'force-dynamic'
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin and manager can update
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const roomId = params.id
    const body = await request.json()

    const updatedRoom = updateMeetingRoom(roomId, body)
    
    if (!updatedRoom) {
      return NextResponse.json(
        { error: 'Meeting room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedRoom, { status: 200 })
  } catch (error) {
    console.error('Error updating meeting room:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting room' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admin can delete
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const roomId = params.id

    const success = deleteMeetingRoom(roomId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Meeting room not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Meeting room deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting meeting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete meeting room' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getHybridRooms, savePersistentRooms, Room } from '@/lib/persistent-rooms'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

        const roomId = params.id
        const rooms = getHybridRooms()
        const room = rooms.find((r: Room) => r.id === roomId)

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room, { status: 200 })
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can update rooms
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can update rooms' }, { status: 403 })
    }

    const roomId = params.id
    const body = await request.json()
    const { 
      branchId,
      roomNumber,
      name,
      type,
      capacity,
      location,
      floor,
      amenities,
      isActive,
      isBookable,
      assignedCustomerId,
      hourlyRate,
      monthlyRate,
      description,
      tags
    } = body

        // Get existing rooms from persistent storage
        const rooms = getHybridRooms()
        const roomIndex = rooms.findIndex((r: Room) => r.id === roomId)

    if (roomIndex === -1) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

        // Update the room
        const updatedRoom: Room = {
          ...rooms[roomIndex],
          branchId,
          roomNumber,
          name,
          type,
          capacity,
          location,
          floor,
          amenities,
          isActive,
          isBookable,
          assignedCustomerId,
          hourlyRate,
          monthlyRate,
          description,
          tags,
          updatedAt: new Date().toISOString()
        }

        rooms[roomIndex] = updatedRoom
        savePersistentRooms(rooms)

    return NextResponse.json(updatedRoom, { status: 200 })
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
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

    // Only admins can delete rooms
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete rooms' }, { status: 403 })
    }

        const roomId = params.id
        
        // Get existing rooms from persistent storage
        const rooms = getHybridRooms()
        const roomIndex = rooms.findIndex((r: Room) => r.id === roomId)

    if (roomIndex === -1) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

        // Get the room to be deleted for cleanup
        const roomToDelete = rooms[roomIndex]

        // Permanently remove the room from the array
        rooms.splice(roomIndex, 1)
        savePersistentRooms(rooms)

        return NextResponse.json({ 
          message: 'Room deleted successfully',
          deletedRoom: {
            id: roomToDelete.id,
            name: roomToDelete.name,
            roomNumber: roomToDelete.roomNumber
          }
        }, { status: 200 })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}


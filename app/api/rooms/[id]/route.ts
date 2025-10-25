import { NextRequest, NextResponse } from 'next/server'
import { getPersistentRooms, savePersistentRooms } from '@/lib/persistent-rooms'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rooms = getPersistentRooms()
    const room = rooms.find(r => r.id === params.id)
    
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }
    
    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { 
      branchId, 
      roomNumber, 
      name, 
      type, 
      capacity, 
      location, 
      floor, 
      amenities = [], 
      isActive = true, 
      isBookable = true, 
      assignedCustomerId = '', 
      hourlyRate = 0, 
      monthlyRate = 0, 
      description, 
      tags = [] 
    } = body

    // Get existing rooms
    const existingRooms = getPersistentRooms()
    const roomIndex = existingRooms.findIndex(r => r.id === params.id)
    
    if (roomIndex === -1) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Check if room number already exists in the same branch (excluding current room)
    if (roomNumber && branchId) {
      const roomExists = existingRooms.some(room => 
        room.branchId === branchId && 
        room.roomNumber === roomNumber && 
        room.id !== params.id
      )
      if (roomExists) {
        return NextResponse.json({ error: 'Room number already exists in this branch' }, { status: 400 })
      }
    }

    // Update room
    const updatedRoom = {
      ...existingRooms[roomIndex],
      branchId: branchId || existingRooms[roomIndex].branchId,
      roomNumber: roomNumber || existingRooms[roomIndex].roomNumber,
      name: name || existingRooms[roomIndex].name,
      type: type || existingRooms[roomIndex].type,
      capacity: capacity !== undefined ? parseInt(capacity) : existingRooms[roomIndex].capacity,
      location: location || existingRooms[roomIndex].location,
      floor: floor || existingRooms[roomIndex].floor,
      amenities: Array.isArray(amenities) ? amenities : existingRooms[roomIndex].amenities,
      isActive: isActive !== undefined ? Boolean(isActive) : existingRooms[roomIndex].isActive,
      isBookable: isBookable !== undefined ? Boolean(isBookable) : existingRooms[roomIndex].isBookable,
      assignedCustomerId: assignedCustomerId !== undefined ? assignedCustomerId : existingRooms[roomIndex].assignedCustomerId,
      hourlyRate: hourlyRate !== undefined ? parseFloat(hourlyRate) : existingRooms[roomIndex].hourlyRate,
      monthlyRate: monthlyRate !== undefined ? parseFloat(monthlyRate) : existingRooms[roomIndex].monthlyRate,
      description: description || existingRooms[roomIndex].description,
      tags: Array.isArray(tags) ? tags : existingRooms[roomIndex].tags,
      updatedAt: new Date().toISOString()
    }

    // Update in persistent storage
    const updatedRooms = [...existingRooms]
    updatedRooms[roomIndex] = updatedRoom
    savePersistentRooms(updatedRooms)

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const existingRooms = getPersistentRooms()
    const roomIndex = existingRooms.findIndex(r => r.id === params.id)
    
    if (roomIndex === -1) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const roomToDelete = existingRooms[roomIndex]

    // Remove room from persistent storage
    const updatedRooms = existingRooms.filter(r => r.id !== params.id)
    savePersistentRooms(updatedRooms)

    return NextResponse.json({ 
      message: 'Room deleted successfully',
      deletedRoom: roomToDelete,
      cleanup: {
        deletedBookings: 0, // TODO: Implement booking cleanup
        deletedInventoryItems: 0 // TODO: Implement inventory cleanup
      }
    })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
  }
}
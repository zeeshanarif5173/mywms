import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { getHybridRooms, savePersistentRooms, Room } from '@/lib/persistent-rooms'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')

    // Get rooms from persistent storage
    let rooms = getHybridRooms()
    
    // Filter by branch if specified
    if (branchId) {
      rooms = rooms.filter((room: any) => room.branchId === branchId && room.isActive)
    } else {
      rooms = rooms.filter((room: any) => room.isActive)
    }

    return NextResponse.json(rooms, { status: 200 })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
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

    // Only admins can create rooms
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can create rooms' }, { status: 403 })
    }

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
      assignedCustomerId,
      hourlyRate,
      monthlyRate,
      description,
      tags = []
    } = body

    if (!branchId || !roomNumber || !name || !type || !capacity || !location || !floor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get existing rooms from persistent storage
    const existingRooms = getHybridRooms()
    
    // Create new room
    const newRoom: Room = {
      id: `ROOM-${Date.now()}`,
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
      description: description || '',
      tags,
      inventory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Add to persistent storage
    const updatedRooms = [...existingRooms, newRoom]
    savePersistentRooms(updatedRooms)

    return NextResponse.json(newRoom, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getPersistentRooms, savePersistentRooms } from '@/lib/persistent-rooms'

// Force dynamic rendering and prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const preferredRegion = 'auto'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const rooms = getPersistentRooms()
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    // Validate required fields
    if (!branchId || !roomNumber || !name || !type || !capacity || !location || !floor || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get existing rooms
    const existingRooms = getPersistentRooms()
    
    // Check if room number already exists in the same branch
    const roomExists = existingRooms.some(room => 
      room.branchId === branchId && room.roomNumber === roomNumber
    )
    if (roomExists) {
      return NextResponse.json({ error: 'Room number already exists in this branch' }, { status: 400 })
    }

    // Create new room
    const newRoom = {
      id: `ROOM-${Date.now()}`,
      branchId,
      roomNumber,
      name,
      type,
      capacity: parseInt(capacity),
      location,
      floor,
      amenities: Array.isArray(amenities) ? amenities : [],
      isActive: Boolean(isActive),
      isBookable: Boolean(isBookable),
      assignedCustomerId: assignedCustomerId || '',
      hourlyRate: parseFloat(hourlyRate) || 0,
      monthlyRate: parseFloat(monthlyRate) || 0,
      description,
      tags: Array.isArray(tags) ? tags : [],
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
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 })
  }
}